package com.lim.noteworkbench.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 文档分块实体，用于记录文档切分后的文本块信息。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeChunk {
    /**
     * 文档分块唯一标识。<br>
     * 用于数据库保持唯一，主键/外键等数据库原生用途。
     */
    private Long id;

    /**
     * 分块所属文档（{@link KnowledgeDocument}）的唯一标识。
     */
    private Long knowledgeDocumentId;

    /**
     * 同一 {@link KnowledgeDocument} 下所有 {@link KnowledgeChunk} 的有序标识。<br>
     * 用于业务需要，例如相邻Chunk查询、引用、调试等。
     */
    private Integer order;

    /**
     * 分块在源文件中的定位信息，例如页码。
     */
    private String sourceLocator;

    /**
     * 分块包含的 Token 数量。
     */
    private Integer tokenCount;

    /**
     * 分块创建时间。
     */
    private LocalDateTime createTime;
}
