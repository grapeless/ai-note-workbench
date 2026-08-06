package com.lim.noteworkbench.mapper;

import com.lim.noteworkbench.model.entity.ChatMessage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface ChatMessageMapper {
    int insert(ChatMessage message);

    List<ChatMessage> findByConversationId(@Param("conversationId") UUID conversationId);

    int updateGenerationResult(ChatMessage message);
}
