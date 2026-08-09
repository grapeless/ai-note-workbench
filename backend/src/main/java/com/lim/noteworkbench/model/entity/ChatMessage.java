package com.lim.noteworkbench.model.entity;

import com.lim.noteworkbench.model.enums.ChatMessageRole;
import com.lim.noteworkbench.model.enums.ChatMessageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * AI 对话消息实体。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    /**
     * 消息唯一标识。
     */
    private UUID id;

    /**
     * 消息所属会话的唯一标识。
     */
    private UUID conversationId;

    /**
     * 消息在持久化记录中的顺序标识。
     */
    private Long sequenceId;

    /**
     * 消息角色。
     */
    private ChatMessageRole role;

    /**
     * 用户消息或 AI 正式回答内容。
     */
    private String content;

    /**
     * AI 的思考内容。
     */
    private String reasoningContent;

    /**
     * 生成 AI 消息所使用的模型提供商。
     */
    private String providerCode;

    /**
     * 生成 AI 消息所使用的模型。
     */
    private String modelCode;

    /**
     * 消息生成状态。
     */
    private ChatMessageStatus status;

    /**
     * 消息创建时间。
     */
    private LocalDateTime createTime;

    /**
     * 消息最后更新时间。
     */
    private LocalDateTime updateTime;
}
