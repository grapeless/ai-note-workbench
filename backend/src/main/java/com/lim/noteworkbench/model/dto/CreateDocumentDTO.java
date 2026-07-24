package com.lim.noteworkbench.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@Schema(description = "创建文档参数")
public record CreateDocumentDTO(
    @Schema(description = "集合 ID")
    @NotNull(message = "集合ID不能为空")
    @Positive(message = "集合ID必须为正数")
    Long collectionId,

    @Schema(description = "文档标题")
    @NotBlank(message = "文档标题不能为空")
    @Size(max = 255, message = "文档标题长度不能超过255个字符")
    String title,

    @Schema(description = "源文件路径")
    @NotBlank(message = "源文件路径不能为空")
    @Size(max = 1024, message = "源文件路径长度不能超过1024个字符")
    String sourcePath,

    @Schema(description = "文档内容类型")
    @NotBlank(message = "文档内容类型不能为空")
    @Size(max = 100, message = "文档内容类型长度不能超过100个字符")
    String contentType
) {
}
