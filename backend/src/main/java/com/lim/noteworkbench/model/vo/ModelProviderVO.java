package com.lim.noteworkbench.model.vo;

import com.lim.noteworkbench.config.properties.ChatModelProperties;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "聊天模型提供商信息")
public record ModelProviderVO(
        @Schema(description = "聊天模型提供商编码")
        String providerCode,
        @Schema(description = "默认聊天模型编码")
        String defaultModel,
        @Schema(description = "可用聊天模型列表")
        List<ChatModelProperties.ModelProperties> models
) {
    public ModelProviderVO(String providerCode, ChatModelProperties.ProviderProperties providerProperties) {
        this(providerCode,
                providerProperties.getDefaultModel(),
                providerProperties.getModels()
        );
    }
}
