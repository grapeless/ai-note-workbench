package com.lim.noteworkbench.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "创建集合参数")
public record CreateCollectionDTO(
    @Schema(description = "集合名称")
    @NotBlank(message = "集合名称不能为空")
    @Size(max = 100, message = "集合名称长度不能超过100个字符")
    String name,

    @Schema(description = "集合描述")
    @Size(max = 1000, message = "集合描述长度不能超过1000个字符")
    String description
) {
}
