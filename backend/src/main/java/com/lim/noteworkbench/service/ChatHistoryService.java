package com.lim.noteworkbench.service;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import com.lim.noteworkbench.mapper.ChatConversationMapper;
import com.lim.noteworkbench.mapper.ChatMessageMapper;
import com.lim.noteworkbench.model.dto.ChatRequestDTO;
import com.lim.noteworkbench.model.entity.ChatConversation;
import com.lim.noteworkbench.model.entity.ChatMessage;
import com.lim.noteworkbench.model.enums.ChatMessageRole;
import com.lim.noteworkbench.model.enums.ChatMessageStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatHistoryService {

    private final ChatConversationMapper chatConversationMapper;
    private final ChatMessageMapper chatMessageMapper;
    private final ChatMemory chatMemory;

    @Transactional
    public UUID startTurn(ChatRequestDTO chatRequestDTO) {
        UUID conversationId = chatRequestDTO.conversationId();
        ChatConversation chatConversation = chatConversationMapper.findById(conversationId);

        //首次发送时创建会话
        if (chatConversation == null) {
            chatConversationMapper.insert(ChatConversation.builder()
                    .id(conversationId)
                    .collectionId(chatRequestDTO.collectionId())
                    .title(chatRequestDTO.message())
                    .build());
        } else if (!Objects.equals(chatConversation.getCollectionId(), chatRequestDTO.collectionId())) {
            //防止相同conversationId，但是不同知识库，虽然UUID相同概率极小
            throw new BusinessException(ResultCode.PARAMS_ERROR, "会话不属于当前知识库");
        }

        //插入用户消息
        chatMessageMapper.insert(ChatMessage.builder()
                .id(UUID.randomUUID())
                .conversationId(conversationId)
                .role(ChatMessageRole.USER)
                .content(chatRequestDTO.message())
                .status(ChatMessageStatus.COMPLETED)
                .build());

        //插入AI占位消息
        UUID assistantMessageId = UUID.randomUUID();
        chatMessageMapper.insert(ChatMessage.builder()
                .id(assistantMessageId)
                .conversationId(conversationId)
                .role(ChatMessageRole.ASSISTANT)
                .content("")
                .providerCode(chatRequestDTO.providerCode())
                .modelCode(chatRequestDTO.modelCode())
                .status(ChatMessageStatus.GENERATING)
                .build());

        // 后续completeTurn和 failTurn都通过这个ID更新正确的AI消息
        return assistantMessageId;
    }

    @Transactional
    public void failTurn(UUID conversationId, UUID assistantMessageId, String reasoningContent, String content) {
        finishTurn(conversationId, assistantMessageId, reasoningContent, content, ChatMessageStatus.FAILED);
    }

    @Transactional
    public void completeTurn(UUID conversationId, UUID assistantMessageId, String reasoningContent, String content) {
        finishTurn(conversationId, assistantMessageId, reasoningContent, content, ChatMessageStatus.COMPLETED);
    }

    private void finishTurn(UUID conversationId, UUID assistantMessageId, String reasoningContent, String content, ChatMessageStatus chatMessageStatus) {
        chatMessageMapper.updateGenerationResult(ChatMessage.builder()
                .id(assistantMessageId)
                .reasoningContent(reasoningContent)
                .content(content)
                .status(chatMessageStatus)
                .build());

        chatConversationMapper.updateTime(conversationId);
    }

    public List<ChatConversation> listConversations(Long collectionId) {
        return chatConversationMapper.findByCollectionId(collectionId);
    }

    public List<ChatMessage> listMessages(UUID conversationId) {
        return chatMessageMapper.findByConversationId(conversationId);
    }

    @Transactional
    public void deleteConversation(UUID conversationId) {
        chatConversationMapper.deleteById(conversationId);
        chatMemory.clear(conversationId.toString());
    }

    @Transactional
    public void deleteByCollectionId(Long collectionId) {
        List<ChatConversation> conversations = chatConversationMapper.findByCollectionId(collectionId);

        chatConversationMapper.deleteByCollectionId(collectionId);

        conversations.forEach(conversation -> chatMemory.clear(conversation.getId().toString()));
    }
}
