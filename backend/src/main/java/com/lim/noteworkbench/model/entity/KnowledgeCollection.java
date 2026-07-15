package com.lim.noteworkbench.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 知识集合实体，用于组织和管理一组相关文档，并记录集合的基本信息及时间信息。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeCollection {
    /**
     * 集合唯一标识。
     */
    private Long id;

    /**
     * 集合名称。
     */
    private String name;

    /**
     * 集合描述。
     */
    private String description;

    /**
     * 集合创建时间。
     */
    private LocalDateTime createTime;

    /**
     * 集合最后更新时间。
     */
    private LocalDateTime updateTime;
}
