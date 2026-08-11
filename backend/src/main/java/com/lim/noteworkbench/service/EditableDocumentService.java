package com.lim.noteworkbench.service;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import com.lim.noteworkbench.mapper.KnowledgeChunkMapper;
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
import org.springframework.util.DigestUtils;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class EditableDocumentService {

    private final KnowledgeDocumentService knowledgeDocumentService;
    private final StorageService storageService;
    private final KnowledgeChunkMapper knowledgeChunkMapper;
    private final KnowledgeDocumentMapper knowledgeDocumentMapper;
    private final KnowledgeCollectionMapper knowledgeCollectionMapper;

    public EditableDocumentVO read(Long knowledgeCollectionId, Long knowledgeDocumentId) {
        KnowledgeDocument knowledgeDocument = knowledgeDocumentService.getByIdInCollection(knowledgeCollectionId, knowledgeDocumentId);
        return buildEditableDocument(knowledgeDocument);
    }

    @Transactional
    public synchronized EditableDocumentVO update(
            Long knowledgeCollectionId,
            Long knowledgeDocumentId,
            String expectedContentHash,
            String content
    ) {
        KnowledgeDocument knowledgeDocument = knowledgeDocumentService.getByIdInCollection(knowledgeCollectionId, knowledgeDocumentId);
        EditableDocumentVO editableDocument = buildEditableDocument(knowledgeDocument);

        boolean unchanged = editableDocument.contentHash().equals(expectedContentHash);
        boolean alreadyWritten = editableDocument.content().equals(content);
        //文档被别人改了，而且和要保存的不一样
        if (!unchanged && !alreadyWritten)
            throw new BusinessException(ResultCode.PARAMS_ERROR, "文档已发生变化，请重新加载后再保存");
        //文档没其他人改，内容也完全一样，直接返回
        if (unchanged && alreadyWritten) return editableDocument;

        knowledgeChunkMapper.deleteByKnowledgeDocumentId(knowledgeDocumentId);
        knowledgeDocumentService.updateStatus(knowledgeDocumentId, DocumentStatus.UPLOADED, null);
        //文档没其他人改，而且有新内容，执行覆盖
        if (!alreadyWritten) storageService.writeText(knowledgeDocument.getSourcePath(), content);

        //Hash变了，但最终内容已经是想保存的内容。不管怎样，都返回一个新的editableDocument，因为content和hash至少有一个发生了变化。
        return buildEditableDocument(knowledgeDocument);
    }

    /**
     * 从 {@link KnowledgeDocument}获取文档元信息后读取其内容组装返回。
     */
    private EditableDocumentVO buildEditableDocument(KnowledgeDocument knowledgeDocument) {
        if (!knowledgeDocument.getDocumentType().isEditable()) {
            throw new BusinessException(ResultCode.PARAMS_ERROR, "该文档类型不支持文本编辑");
        }

        String content = storageService.readText(knowledgeDocument.getSourcePath());
        return new EditableDocumentVO(
                knowledgeDocument.getId(),
                knowledgeDocument.getTitle(),
                knowledgeDocument.getDocumentType(),
                content,
                DigestUtils.md5DigestAsHex(content.getBytes(StandardCharsets.UTF_8))
        );
    }

    @Transactional
    public KnowledgeDocument create(
            Long knowledgeCollectionId,
            String title,
            DocumentType documentType,
            String content
    ) {
        if (!documentType.isEditable())
            throw new BusinessException(ResultCode.PARAMS_ERROR, "该文档类型不支持文本创建");

        if (knowledgeCollectionMapper.findById(knowledgeCollectionId) == null)
            throw new BusinessException(ResultCode.NOT_FOUND_ERROR, "集合不存在");

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
}
