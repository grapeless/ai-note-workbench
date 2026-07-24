package com.lim.noteworkbench.model.vo;

import com.lim.noteworkbench.config.properties.ChatModelProperties;

import java.util.List;

public record ModelProviderVO(
        String providerCode,
        String providerName,
        String defaultModel,
        List<ChatModelProperties.ModelProperties> models
) {
    public ModelProviderVO(String providerCode, ChatModelProperties.ProviderProperties providerProperties) {
        this(providerCode,
                providerProperties.getName(),
                providerProperties.getDefaultModel(),
                providerProperties.getModels()
        );
    }
}
