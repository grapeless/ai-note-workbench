package com.lim.noteworkbench.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 文档实体，用于记录上传文档的基本信息、所属工作区及处理状态。
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Document {
    /**
     * 文档唯一标识。
     */
    private Long id;

    /**
     * 文档所属工作区的唯一标识。
     */
    private Long workspaceId;

    /**
     * 文档标题。
     */
    private String title;

    /**
     * 源文件的存储路径。
     */
    private String sourcePath;

    /**
     * 文档内容类型。
     */
    private String contentType;

    /**
     * 文档当前的处理状态。
     */
    private String status;

    /**
     * 文档处理失败时的错误信息。
     */
    private String errorMessage;

    /**
     * 文档创建时间。
     */
    private LocalDateTime createTime;

    /**
     * 文档最后更新时间。
     */
    private LocalDateTime updateTime;
}
