package com.lim.noteworkbench.config;

import org.springframework.ai.chat.client.ChatClient;

import java.util.Map;

/**
 * 根据配置文件，为每一个模型提供商匹配一个ChatClient保存在该类中
 */
public record ChatClientRegistry(Map<String, ChatClient> clients) {
    public ChatClientRegistry(Map<String, ChatClient> clients) {
        this.clients = Map.copyOf(clients);
    }

    public ChatClient getChatClient(String providerCode) {
        return clients.get(providerCode);
    }

}
