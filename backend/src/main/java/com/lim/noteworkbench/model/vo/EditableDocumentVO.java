package com.lim.noteworkbench.model.vo;

import com.lim.noteworkbench.model.enums.DocumentType;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "可编辑文档内容")
public record EditableDocumentVO(
        @Schema(description = "文档 ID") Long documentId,
        @Schema(description = "文档标题") String title,
        @Schema(description = "文档类型") DocumentType documentType,
        @Schema(description = "文档原始文本内容") String content,
        @Schema(description = "正文内容摘要") String contentHash
) {
}
