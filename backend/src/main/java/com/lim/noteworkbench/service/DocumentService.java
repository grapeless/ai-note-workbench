package com.lim.noteworkbench.service;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import com.lim.noteworkbench.mapper.CollectionMapper;
import com.lim.noteworkbench.mapper.DocumentMapper;
import com.lim.noteworkbench.model.entity.Document;
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
public class DocumentService {
    private final DocumentMapper documentMapper;
    private final CollectionMapper collectionMapper;
    private final StorageService storageService;

    @Transactional
    public Document upload(Long collectionId, MultipartFile file) {
        if (file.isEmpty()) throw new BusinessException(ResultCode.PARAMS_ERROR, "上传文件不能为空");
        if (collectionMapper.findById(collectionId) == null) throw new BusinessException(ResultCode.NOT_FOUND_ERROR, "指定的集合不存在");

        // 上传文件至对应集合的存储目录
        String sourcePath = storageService.store(collectionId, file);
        try {
            Document document = Document.builder()
                    .collectionId(collectionId)
                    .title(resolveTitle(file))
                    .sourcePath(sourcePath)
                    .contentType(resolveContentType(file))
                    .status("UPLOADED")
                    .errorMessage(null)
                    .build();

            int affectedRows = documentMapper.insert(document);

            if (affectedRows != 1) throw new IllegalStateException("文档记录插入失败");
            if (document.getId() == null) throw new IllegalStateException("数据库没有回填文档 ID");

            Document savedDocument = documentMapper.findById(document.getId());

            if (savedDocument == null) throw new IllegalStateException("插入成功，但没有查询到文档记录");

            return savedDocument;
        } catch (RuntimeException exception) {
            // 数据库操作失败时，清理已经保存的文件
            storageService.delete(sourcePath);
            throw exception;
        }
    }

    public Document getById(Long id) {
        Document document = documentMapper.findById(id);

        if (document == null) throw new BusinessException(ResultCode.NOT_FOUND_ERROR, "文档不存在");

        return document;
    }

    public List<Document> listByCollectionId(Long collectionId) {
        if (collectionMapper.findById(collectionId) == null) {
            throw new BusinessException(ResultCode.NOT_FOUND_ERROR, "指定的集合不存在");
        }

        return documentMapper.findByCollectionId(collectionId);
    }

    private String resolveTitle(MultipartFile file) {
        String filename = file.getOriginalFilename();

        if (filename == null || filename.isBlank()) return "未命名文档";

        filename = StringUtils.cleanPath(filename);

        // 只保留文件名，避免客户端传入完整路径
        String cleanFilename = StringUtils.getFilename(filename);

        return cleanFilename == null
                ? "未命名文档"
                : cleanFilename;
    }

    private String resolveContentType(MultipartFile file) {
        String filename = file.getOriginalFilename();

        String extension = StringUtils.getFilenameExtension(filename);

        if (extension == null) return "application/octet-stream";

        return switch (extension.toLowerCase(Locale.ROOT)) {
            case "pdf" -> "application/pdf";
            case "txt" -> "text/plain";
            case "md", "markdown" -> "text/markdown";
            default -> "application/octet-stream";
        };
    }
}
