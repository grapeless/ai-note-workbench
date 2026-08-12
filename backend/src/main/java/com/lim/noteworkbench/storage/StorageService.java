package com.lim.noteworkbench.storage;

import com.lim.noteworkbench.model.enums.DocumentType;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    /**
     * 保存文件，返回相对于存储根目录的路径。
     */
    String store(Long collectionId, MultipartFile file);

    /**
     * 根据相对路径删除文件。
     */
    void delete(String relativePath);

    /**
     * 删除对应集合的全部文件。
     */
    void deleteCollection(Long collectionId);

    /**
     * 加载文件
     */
    Resource load(String relativePath);

    /**
     * 读取 UTF-8 文本文档。
     */
    String readText(String relativePath);

    /**
     * 使用 UTF-8 覆盖已有文本文档。
     */
    void writeText(String relativePath, String content);

    /**
     * 创建UTF-8 文本文档
     */
    String createText(Long knowledgeCollectionId, DocumentType documentType, String content);
}
