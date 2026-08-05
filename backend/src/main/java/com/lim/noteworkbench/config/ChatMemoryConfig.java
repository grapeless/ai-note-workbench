package com.lim.noteworkbench.config;

import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.memory.repository.redis.RedisChatMemoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import redis.clients.jedis.DefaultJedisClientConfig;
import redis.clients.jedis.RedisClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Configuration
public class ChatMemoryConfig {
    /**
     * ChatMemory的实现(MessageWindowChatMemory)负责决定保留哪些消息以及何时删除它们。
     */
    @Bean
    public ChatMemory chatMemory(RedisChatMemoryRepository repository) {
        return MessageWindowChatMemory.builder()
                .chatMemoryRepository(repository)
                .maxMessages(20) // 是最多保留20条消息，大致约10轮，不是20轮。
                .build();
    }

    /**
     * 消息的底层存储由 ChatMemoryRepository 处理，它的职责是存储和检索消息。
     */
    @Bean
    public RedisChatMemoryRepository redisChatMemoryRepository(RedisClient redisClient) {
        return RedisChatMemoryRepository.builder()
                .jedisClient(redisClient)
                .indexName("note-workbench-chat-memory-idx")
                .keyPrefix("note-workbench:chat-memory:")
                .metadataFields(List.of(Map.of(
                        "name", "messageType",
                        "type", "tag"
                )))
                .timeToLive(Duration.ofDays(7))
                .initializeSchema(true) //自动创建 Redis Search 索引
                .build();
    }

    @Bean
    public RedisClient redisClient(
            @Value("${spring.data.redis.host}") String host,
            @Value("${spring.data.redis.port}") int port,
            @Value("${spring.data.redis.password}") String password
    ) {
        return RedisClient.builder()
                .hostAndPort(host, port)
                .clientConfig(DefaultJedisClientConfig.builder()
                        .password(password)
                        .build())
                .build();
    }
}
