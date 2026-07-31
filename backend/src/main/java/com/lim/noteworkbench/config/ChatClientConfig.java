package com.lim.noteworkbench.config;

import com.lim.noteworkbench.config.properties.ChatModelProperties;
import io.micrometer.observation.ObservationRegistry;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.ToolCallingAdvisor;
import org.springframework.ai.chat.client.advisor.observation.AdvisorObservationConvention;
import org.springframework.ai.chat.client.observation.ChatClientObservationConvention;
import org.springframework.ai.model.chat.client.autoconfigure.ChatClientBuilderConfigurer;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * <pre>
 *   ChatModelProperties
 *           ↓
 *   OpenAiChatModel
 *           ↓
 *   ChatClient
 * </pre>
 */
@Configuration
public class ChatClientConfig {

    /**
     * 解析配置文件，初始化providerCode(提供商)与ChatClient(其ChatModel配置为默认模型)的映射
     */
    @Bean("chatClients")
    public Map<String, ChatClient> chatClients(
            ChatModelProperties properties,
            ChatClientBuilderConfigurer configurer,
            ObjectProvider<ObservationRegistry> observationRegistry,
            ObjectProvider<ChatClientObservationConvention> chatClientConvention,
            ObjectProvider<AdvisorObservationConvention> advisorConvention,
            ObjectProvider<ToolCallingAdvisor.Builder<?>> toolCallingAdvisorBuilder
    ) {
        Map<String, ChatClient> clients = new LinkedHashMap<>();

        properties.getProviders().forEach((providerCode, providerProperties) -> {
            OpenAiChatModel chatModel = buildChatModel(providerProperties);

            //为了保留可观测性和自定义功能，您应该注入 ChatClientBuilderConfigurer 来辅助创建ChatClient
            ChatClient chatClient = configurer.configure(ChatClient.builder(chatModel,
                            observationRegistry.getIfUnique(() -> ObservationRegistry.NOOP),
                            chatClientConvention.getIfUnique(),
                            advisorConvention.getIfUnique(),
                            toolCallingAdvisorBuilder.getIfAvailable()))
                    .build();

            clients.put(providerCode, chatClient);
        });

        return Map.copyOf(clients);
    }

    //一个提供商，一个chatModel，多个chatClient（现在只初始化一个）
    private OpenAiChatModel buildChatModel(ChatModelProperties.ProviderProperties providerProperties) {
        return OpenAiChatModel.builder()
                .options(OpenAiChatOptions.builder()
                        .baseUrl(providerProperties.getBaseUrl())
                        .apiKey(providerProperties.getApiKey())
                        .model(providerProperties.getDefaultModel())
                        .build())
                .build();
    }
}


