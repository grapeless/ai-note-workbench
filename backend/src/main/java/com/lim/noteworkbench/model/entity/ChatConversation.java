package com.lim.noteworkbench.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * AI 对话会话实体。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatConversation {
    /**
     * 会话唯一标识，同时作为 Spring AI 的 conversationId。
     */
    private UUID id;

    /**
     * 会话所属知识集合的唯一标识。
     */
    private Long collectionId;

    /**
     * 会话标题。
     */
    private String title;

    /**
     * 会话创建时间。
     */
    private LocalDateTime createTime;

    /**
     * 会话最后更新时间。
     */
    private LocalDateTime updateTime;
}
