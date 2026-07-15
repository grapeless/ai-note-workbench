package com.lim.noteworkbench.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    /**
     * 保存文件，返回相对于存储根目录的路径。
     */
    String store(Long workspaceId, MultipartFile file);

    /**
     * 根据相对路径删除文件。
     */
    void delete(String relativePath);
}