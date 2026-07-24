package com.lim.noteworkbench.service;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import com.lim.noteworkbench.config.ChatClientRegistry;
import com.lim.noteworkbench.config.properties.ChatModelProperties;
import com.lim.noteworkbench.model.dto.ChatRequestDTO;
import com.lim.noteworkbench.model.vo.ChatResponseVO;
import com.lim.noteworkbench.model.vo.ModelProviderVO;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatClientRegistry chatClientRegistry;
    private final ChatModelProperties chatModelProperties;

    public ChatResponseVO doChatWithAI(ChatRequestDTO chatRequestDTO) {
        //1.检查即提供商是否存在
        ChatModelProperties.ProviderProperties provider = chatModelProperties.getProviders().get(chatRequestDTO.providerCode());
        if (provider == null)
            throw new BusinessException(ResultCode.PARAMS_ERROR, "不支持的模型提供商：" + chatRequestDTO.providerCode());

        //2.检查提供商是否包含该模型
        boolean supported = provider.getModels().stream()
                .anyMatch(model -> Objects.equals(model.getCode(), chatRequestDTO.modelCode()));

        if (!supported)
            throw new BusinessException(ResultCode.PARAMS_ERROR, "暂不支持该提供商的该模型：" + chatRequestDTO.modelCode());

        //3.根据提供商获取对应chatClient
        ChatClient chatClient = chatClientRegistry.getChatClient(chatRequestDTO.providerCode());

        //4.使用本次请求指定的模型发送消息
        String content = chatClient.prompt()
                .user(chatRequestDTO.message())
                .options(OpenAiChatOptions.builder()
                        .model(chatRequestDTO.modelCode()))
                .call()
                .content();


        //5.返回响应
        return new ChatResponseVO(
                chatRequestDTO.providerCode(),
                chatRequestDTO.modelCode(),
                content);
    }

    public List<ModelProviderVO> getAvailableModelList() {
        return chatModelProperties.getProviders().entrySet().stream()
                .map(entry -> new ModelProviderVO(entry.getKey(), entry.getValue()))
                .toList();
    }
}
