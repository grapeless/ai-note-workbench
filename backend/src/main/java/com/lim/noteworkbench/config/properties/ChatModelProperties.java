package com.lim.noteworkbench.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Data
@Component
@ConfigurationProperties(prefix = "app.ai")
public class ChatModelProperties {
    private Map<String, ProviderProperties> providers = new LinkedHashMap<>();

    @Data
    public static class ProviderProperties {
        private String name;

        private String baseUrl;

        private String apiKey;

        private String defaultModel;

        private List<ModelProperties> models = new ArrayList<>();
    }

    @Data
    public static class ModelProperties {
        private String code;
        private String name;
    }
}
