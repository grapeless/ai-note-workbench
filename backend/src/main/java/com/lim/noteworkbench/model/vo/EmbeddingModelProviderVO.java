package com.lim.noteworkbench.model.vo;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "嵌入模型提供商信息")
public record EmbeddingModelProviderVO(
        @Schema(description = "嵌入模型提供商编码")
        String providerCode,

        @Schema(description = "可用嵌入模型编码")
        List<String> models
) {
}
