package com.lim.noteworkbench.model.vo;

import com.lim.noteworkbench.config.properties.ChatModelProperties;

import java.util.List;

public record ModelProviderVO(
        String providerCode,
        String defaultModel,
        List<ChatModelProperties.ModelProperties> models
) {
    public ModelProviderVO(String providerCode, ChatModelProperties.ProviderProperties providerProperties) {
        this(providerCode,
                providerProperties.getDefaultModel(),
                providerProperties.getModels()
        );
    }
}
