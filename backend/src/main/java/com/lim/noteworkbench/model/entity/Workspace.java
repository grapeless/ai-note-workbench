package com.lim.noteworkbench.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 工作区实体，用于组织和管理一组相关文档，并记录工作区的基本信息及时间信息。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Workspace {
    /**
     * 工作区唯一标识。
     */
    private Long id;

    /**
     * 工作区名称。
     */
    private String name;

    /**
     * 工作区描述。
     */
    private String description;

    /**
     * 工作区创建时间。
     */
    private LocalDateTime createTime;

    /**
     * 工作区最后更新时间。
     */
    private LocalDateTime updateTime;
}
