package com.lim.noteworkbench.service;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import com.lim.noteworkbench.config.ChatClientConfig.ChatClientRegistry;
import com.lim.noteworkbench.config.VectorStoreConfig.VectorStoreRegistry;
import com.lim.noteworkbench.config.properties.ChatModelProperties;
import com.lim.noteworkbench.model.constant.KnowledgeMetadataKey;
import com.lim.noteworkbench.model.dto.ChatRequestDTO;
import com.lim.noteworkbench.model.entity.KnowledgeCollection;
import com.lim.noteworkbench.model.vo.ChatResponseVO;
import com.lim.noteworkbench.model.vo.ModelProviderVO;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.rag.advisor.RetrievalAugmentationAdvisor;
import org.springframework.ai.rag.generation.augmentation.ContextualQueryAugmenter;
import org.springframework.ai.rag.retrieval.search.VectorStoreDocumentRetriever;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatClientRegistry chatClientRegistry;
    private final VectorStoreRegistry vectorStoreRegistry;
    private final ChatModelProperties chatModelProperties;
    private final KnowledgeCollectionService knowledgeCollectionService;

    public ChatResponseVO chat(ChatRequestDTO chatRequestDTO) {
        //1.根据提供商获取对应默认chatClient
        ChatClient chatClient = chatClientRegistry.get(chatRequestDTO.providerCode());

        //2.检查目前提供商是否配置了该模型
        boolean supported = chatModelProperties.getProviders().get(chatRequestDTO.providerCode())
                .getModels().stream()
                .anyMatch(model -> Objects.equals(model.getCode(), chatRequestDTO.modelCode()));

        if (!supported)
            throw new BusinessException(ResultCode.PARAMS_ERROR, "不支持的对话模型：" + chatRequestDTO.modelCode());

        //3.路由对话模式，并获取回答
        String content = switch (chatRequestDTO.mode()) {
            case PLAIN -> doPlainChat(chatClient, chatRequestDTO);
            case RAG -> doRagChat(chatClient, chatRequestDTO, false);
            //目前总是执行一次知识库检索
            case AUTO -> doRagChat(chatClient, chatRequestDTO, true);
        };

        //4.返回响应
        return new ChatResponseVO(
                chatRequestDTO.providerCode(),
                chatRequestDTO.modelCode(),
                content);
    }

    private String doPlainChat(ChatClient chatClient, ChatRequestDTO chatRequestDTO) {
        return chatClient.prompt()
                .user(chatRequestDTO.message())
                .options(OpenAiChatOptions.builder()
                        .model(chatRequestDTO.modelCode())
                )
                .call()
                .content();
    }

    private String doRagChat(ChatClient chatClient, ChatRequestDTO chatRequestDTO, boolean allowEmptyContext) {
        KnowledgeCollection collection = knowledgeCollectionService.getById(chatRequestDTO.collectionId());

        RetrievalAugmentationAdvisor retrievalAugmentationAdvisor = RetrievalAugmentationAdvisor.builder()
                .documentRetriever(VectorStoreDocumentRetriever.builder()
                        .vectorStore(vectorStoreRegistry.get(collection.getEmbeddingProvider(), collection.getEmbeddingModel()))
                        .similarityThreshold(0.7)
                        .topK(5)
                        .filterExpression(new FilterExpressionBuilder()
                                .eq(KnowledgeMetadataKey.COLLECTION_ID, collection.getId())
                                .build())
                        .build())
                .queryAugmenter(ContextualQueryAugmenter.builder()
                        .allowEmptyContext(allowEmptyContext) //默认为false，即知识库中没有没有上下文时，直接回答没有，而不是让模型用自己的知识回答。
                        .build())
                .build();

        return chatClient.prompt()
                .advisors(retrievalAugmentationAdvisor)
                .user(chatRequestDTO.message())
                .options(OpenAiChatOptions.builder()
                        .model(chatRequestDTO.modelCode()))
                .call()
                .content();
    }

    public List<ModelProviderVO> getAvailableModelList() {
        return chatModelProperties.getProviders().entrySet().stream()
                .map(entry -> new ModelProviderVO(entry.getKey(), entry.getValue()))
                .toList();
    }
}
