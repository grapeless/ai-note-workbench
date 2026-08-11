package com.lim.noteworkbench.mapper;

import com.lim.noteworkbench.model.entity.ChatCitation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface ChatCitationMapper {
    int upsert(ChatCitation chatCitation);

    List<ChatCitation> findByConversationId(@Param("conversationId") UUID conversationId);
}
