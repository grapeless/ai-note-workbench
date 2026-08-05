package com.lim.noteworkbench.config;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import com.lim.noteworkbench.config.properties.ChatModelProperties;
import io.micrometer.observation.ObservationRegistry;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.client.advisor.ToolCallingAdvisor;
import org.springframework.ai.chat.client.advisor.observation.AdvisorObservationConvention;
import org.springframework.ai.chat.client.observation.ChatClientObservationConvention;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.model.chat.client.autoconfigure.ChatClientBuilderConfigurer;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
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
    @Bean
    public ChatClientRegistry chatClientRegistry(
            ChatMemory chatMemory,
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
                    .defaultAdvisors(
                            MessageChatMemoryAdvisor.builder(chatMemory).build(),
                            new SimpleLoggerAdvisor()
                    )
                    .build();

            clients.put(providerCode, chatClient);
        });

        return new ChatClientRegistry(Map.copyOf(clients));
    }

    //一个提供商，一个chatModel，多个chatClient（现在只初始化一个）
    private OpenAiChatModel buildChatModel(ChatModelProperties.ProviderProperties providerProperties) {
        return OpenAiChatModel.builder()
                .options(OpenAiChatOptions.builder()
                        .baseUrl(providerProperties.getBaseUrl())
                        .apiKey(providerProperties.getApiKey())
                        .model(providerProperties.getDefaultModel())
                        .timeout(Duration.ofMinutes(5))
                        .build())
                .build();
    }

    public static final class ChatClientRegistry {
        private final Map<String, ChatClient> chatClients;

        private ChatClientRegistry(Map<String, ChatClient> chatClients) {
            this.chatClients = chatClients;
        }

        public ChatClient get(String providerCode) {
            ChatClient chatClient = chatClients.get(providerCode);
            if (chatClient == null) {
                throw new BusinessException(ResultCode.PARAMS_ERROR, "不支持的模型提供商：" + providerCode);
            }

            return chatClient;
        }
    }
}


