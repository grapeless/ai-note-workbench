package com.lim.noteworkbench.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 文档分块实体，用于记录文档切分后的文本块信息。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Chunk {
    /**
     * 文档分块唯一标识。
     */
    private Long id;

    /**
     * 分块所属文档的唯一标识，注意该id应从{@link KnowledgeDocument}中的id，
     * 而非框架提供的{@link org.springframework.ai.document.Document}的id。
     */
    private Long documentId;

    /**
     * 分块在文档中的顺序索引，从 0 开始。
     */
    private Integer chunkIndex;

    /**
     * 分块的文本内容。
     */
    private String content;

    /**
     * 分块在源文件中的定位信息，例如页码。
     */
    private String sourceLocator;

    /**
     * 分块包含的 Token 数量。
     */
    private Integer tokenCount;

    /**
     * 元信息
     */
    private Map<String ,Object> metadata;

    /**
     * 分块创建时间。
     */
    private LocalDateTime createTime;
}
