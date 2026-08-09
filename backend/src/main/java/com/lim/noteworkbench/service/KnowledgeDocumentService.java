package com.lim.noteworkbench.service;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import com.lim.noteworkbench.mapper.KnowledgeCollectionMapper;
import com.lim.noteworkbench.mapper.KnowledgeDocumentMapper;
import com.lim.noteworkbench.model.entity.KnowledgeDocument;
import com.lim.noteworkbench.model.enums.DocumentStatus;
import com.lim.noteworkbench.model.enums.DocumentType;
import com.lim.noteworkbench.model.vo.EditableDocumentVO;
import com.lim.noteworkbench.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class KnowledgeDocumentService {
    private final KnowledgeDocumentMapper knowledgeDocumentMapper;
    private final KnowledgeCollectionMapper knowledgeCollectionMapper;
    private final StorageService storageService;

    @Transactional
    public KnowledgeDocument upload(Long collectionId, MultipartFile file) {
        if (file.isEmpty()) throw new BusinessException(ResultCode.PARAMS_ERROR, "上传文件不能为空");
        if (knowledgeCollectionMapper.findById(collectionId) == null)
            throw new BusinessException(ResultCode.NOT_FOUND_ERROR, "指定的集合不存在");

        DocumentType documentType = resolveDocumentType(file);

        // 上传文件至对应集合的存储目录
        String sourcePath = storageService.store(collectionId, file);
        try {
            KnowledgeDocument document = KnowledgeDocument.builder()
                    .collectionId(collectionId)
                    .title(resolveTitle(file))
                    .sourcePath(sourcePath)
                    .documentType(documentType)
                    .status("UPLOADED")
                    .errorMessage(null)
                    .build();

            knowledgeDocumentMapper.insert(document);

            return knowledgeDocumentMapper.findById(document.getId());
        } catch (RuntimeException exception) {
            // 数据库操作失败时，清理已经保存的文件
            storageService.delete(sourcePath);
            throw exception;
        }
    }

    public EditableDocumentVO readEditableDocument(Long knowledgeCollectionId, Long knowledgeDocumentId) {
        KnowledgeDocument knowledgeDocument = getByIdInCollection(knowledgeCollectionId, knowledgeDocumentId);

        if (!knowledgeDocument.getDocumentType().isEditable()) {
            throw new BusinessException(ResultCode.PARAMS_ERROR, "该文档类型不支持文本编辑");
        }

        return new EditableDocumentVO(knowledgeDocument.getId(),
                knowledgeDocument.getTitle(),
                knowledgeDocument.getDocumentType(),
                storageService.readText(knowledgeDocument.getSourcePath())
        );
    }

    public void overwriteEditableDocument(Long knowledgeCollectionId, Long knowledgeDocumentId, String content) {
        KnowledgeDocument knowledgeDocument = getByIdInCollection(knowledgeCollectionId, knowledgeDocumentId);

        if (!knowledgeDocument.getDocumentType().isEditable()) {
            throw new BusinessException(ResultCode.PARAMS_ERROR, "该文档类型不支持文本编辑");
        }

        storageService.writeText(knowledgeDocument.getSourcePath(), content);

        //更改状态，之后需要重新嵌入
        updateStatus(knowledgeDocumentId, DocumentStatus.UPLOADED, null);
    }

    @Transactional
    public KnowledgeDocument createEditableDocument(
            Long knowledgeCollectionId,
            String title,
            DocumentType documentType,
            String content
    ) {
        if (!documentType.isEditable()) {
            throw new BusinessException(ResultCode.PARAMS_ERROR, "该文档类型不支持文本创建");
        }

        //创建文件
        String sourcePath = storageService.createText(knowledgeCollectionId, documentType, content);

        try {
            //文件创建成功后，再保存数据库元数据。此时只代表文档已经写入存储，还没有执行解析和向量化，因此初始状态为 UPLOADED。
            KnowledgeDocument knowledgeDocument = KnowledgeDocument.builder()
                    .collectionId(knowledgeCollectionId)
                    .title(title)
                    .sourcePath(sourcePath)
                    .documentType(documentType)
                    .status(DocumentStatus.UPLOADED.name())
                    .errorMessage(null)
                    .build();

            knowledgeDocumentMapper.insert(knowledgeDocument);
            return knowledgeDocumentMapper.findById(knowledgeDocument.getId());
        } catch (RuntimeException e) {
            //数据库插入失败时，删除刚刚创建的物理文件，避免存储目录中出现没有数据库记录的孤立文件。
            storageService.delete(sourcePath);
            throw e;
        }
    }

    public KnowledgeDocument getById(Long id) {
        KnowledgeDocument document = knowledgeDocumentMapper.findById(id);

        if (document == null) throw new BusinessException(ResultCode.NOT_FOUND_ERROR, "文档不存在");

        return document;
    }

    //限制文档必须属于当前知识库
    public KnowledgeDocument getByIdInCollection(Long collectionId, Long knowledgeDocumentId) {
        KnowledgeDocument knowledgeDocument = getById(knowledgeDocumentId);
        if (!knowledgeDocument.getCollectionId().equals(collectionId)) {
            throw new BusinessException(ResultCode.NOT_FOUND_ERROR, "当前知识库中不存在该文档");
        }
        return knowledgeDocument;
    }

    public List<KnowledgeDocument> listByCollectionId(Long collectionId) {
        if (knowledgeCollectionMapper.findById(collectionId) == null) {
            throw new BusinessException(ResultCode.NOT_FOUND_ERROR, "指定的集合不存在");
        }

        return knowledgeDocumentMapper.findByCollectionId(collectionId);
    }

    public void updateStatus(Long id, DocumentStatus status, String errorMessage) {
        knowledgeDocumentMapper.updateStatus(id, status.name(), errorMessage);
    }

    /**
     * 从上传文件中提取文档标题，无法获取有效文件名时返回默认标题。
     *
     * @param file 上传的文件
     * @return 文档标题
     */
    private String resolveTitle(MultipartFile file) {
        String filename = file.getOriginalFilename();

        if (filename == null || filename.isBlank()) return "未命名文档";

        filename = StringUtils.cleanPath(filename);

        // 只保留文件名，避免客户端传入完整路径
        String cleanFilename = StringUtils.getFilename(filename);

        return cleanFilename == null ? "未命名文档" : cleanFilename;
    }

    /**
     * 根据上传文件的扩展名解析文档类型。
     *
     * @param file 上传的文件
     * @return 文档类型
     */
    private DocumentType resolveDocumentType(MultipartFile file) {
        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());

        if (extension == null) throw new BusinessException(ResultCode.PARAMS_ERROR, "文件缺少扩展名");

        return switch (extension.toLowerCase(Locale.ROOT)) {
            case "pdf" -> DocumentType.PDF;
            case "txt" -> DocumentType.PLAIN_TEXT;
            case "md", "markdown" -> DocumentType.MARKDOWN;
            default -> throw new BusinessException(ResultCode.PARAMS_ERROR, "不支持的文件类型");
        };
    }
}
