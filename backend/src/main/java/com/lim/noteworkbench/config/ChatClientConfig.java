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
 * 不同模型提供商
 */
@Configuration
public class ChatClientConfig {

    //解析配置文件，将ChatClientRegistry初始化并成为Bean
    @Bean
    public ChatClientRegistry chatClientRegistry(
            ChatModelProperties properties,
            ChatClientBuilderConfigurer configurer,
            ObjectProvider<ObservationRegistry> observationRegistry,
            ObjectProvider<ChatClientObservationConvention> chatClientConvention,
            ObjectProvider<AdvisorObservationConvention> advisorConvention,
            ObjectProvider<ToolCallingAdvisor.Builder<?>> toolCallingAdvisorBuilder
    ) {
        Map<String, ChatClient> clients = new LinkedHashMap<>();

        properties.getProviders().forEach((providerName, providerProperties) -> {
            OpenAiChatModel chatModel = buildChatModel(providerProperties);

            //为了保留可观测性和自定义功能，您应该注入 ChatClientBuilderConfigurer 来辅助创建ChatClient
            ChatClient chatClient = configurer.configure(ChatClient.builder(chatModel,
                            observationRegistry.getIfUnique(() -> ObservationRegistry.NOOP),
                            chatClientConvention.getIfUnique(),
                            advisorConvention.getIfUnique(),
                            toolCallingAdvisorBuilder.getIfAvailable()))
                    .build();

            clients.put(providerName, chatClient);
        });

        return new ChatClientRegistry(clients);
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

    /*@Bean
    //@Primary //ChatClient 上的 @Primary：解决业务类直接注入 ChatClient 时选哪个 Bean 的歧义
    public ChatClient dashscopeChatClient(@Qualifier("dashscopeChatModel") OpenAiChatModel chatModel,
                                          ChatClientBuilderConfigurer configurer,
                                          ObjectProvider<ObservationRegistry> observationRegistry,
                                          ObjectProvider<ChatClientObservationConvention> chatClientObservationConvention,
                                          ObjectProvider<AdvisorObservationConvention> advisorObservationConvention,
                                          ObjectProvider<ToolCallingAdvisor.Builder<?>> toolCallingAdvisorBuilder) {
        return buildChatClient(chatModel, configurer, observationRegistry,
                chatClientObservationConvention, advisorObservationConvention, toolCallingAdvisorBuilder);
    }


    @Primary
    @Bean
    public ChatClient deepseekCharClient(@Qualifier("deepseekChatModel") OpenAiChatModel chatModel,
                                         ChatClientBuilderConfigurer configurer,
                                         ObjectProvider<ObservationRegistry> observationRegistry,
                                         ObjectProvider<ChatClientObservationConvention> chatClientObservationConvention,
                                         ObjectProvider<AdvisorObservationConvention> advisorObservationConvention,
                                         ObjectProvider<ToolCallingAdvisor.Builder<?>> toolCallingAdvisorBuilder) {
        return buildChatClient(chatModel, configurer, observationRegistry,
                chatClientObservationConvention, advisorObservationConvention, toolCallingAdvisorBuilder);
    }*/
}


