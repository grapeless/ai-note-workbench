package com.lim.noteworkbench.mapper;

import com.lim.noteworkbench.model.entity.ChatConversation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface ChatConversationMapper {
    int insert(ChatConversation conversation);

    ChatConversation findById(@Param("id") UUID id);

    List<ChatConversation> findByCollectionId(@Param("collectionId") Long collectionId);

    int updateTime(@Param("id") UUID id);

    int deleteById(@Param("id") UUID id);

    int deleteByCollectionId(@Param("collectionId") Long collectionId);
}
