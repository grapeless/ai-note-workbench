package com.lim.noteworkbench.model.vo;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "可编辑文档内容")
public record EditableDocumentVO(
        @Schema(description = "文档 ID") Long documentId,
        @Schema(description = "文档标题") String title,
        @Schema(description = "文档内容类型") String contentType,
        @Schema(description = "文档原始文本内容") String content
) {
}
