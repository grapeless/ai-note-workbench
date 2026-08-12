package com.lim.noteworkbench.model.vo;

import com.lim.noteworkbench.model.entity.ChatCitation;
import com.lim.noteworkbench.model.entity.ChatMessage;
import com.lim.noteworkbench.model.enums.ChatMessageRole;
import com.lim.noteworkbench.model.enums.ChatMessageStatus;
import com.lim.noteworkbench.model.enums.DocumentType;

import java.util.List;
import java.util.UUID;

/**
 * 对话消息响应视图，仅包含前端展示消息及引用所需字段。
 *
 * <p>相较于 {@link ChatMessage}，省略以下字段：</p>
 * <ul>
 *     <li>{@code conversationId}：当前会话已经由接口上下文确定。</li>
 *     <li>{@code sequenceId}：仅用于后端持久化和消息排序。</li>
 *     <li>{@code providerCode}、{@code modelCode}：当前前端不展示模型信息。</li>
 *     <li>{@code createTime}、{@code updateTime}：当前前端不展示消息时间。</li>
 * </ul>
 */
public record ChatMessageVO(
        UUID id,
        ChatMessageRole role,
        String content,
        String reasoningContent,
        List<Citation> citations,
        ChatMessageStatus status
) {

    public ChatMessageVO(ChatMessage chatMessage, List<Citation> citations) {
        this(
                chatMessage.getId(),
                chatMessage.getRole(),
                chatMessage.getContent(),
                chatMessage.getReasoningContent(),
                citations,
                chatMessage.getStatus()
        );
    }

    /**
     * 引用响应视图。相较于 {@link ChatCitation}，省略以下内部字段：
     * <ul>
     *     <li>{@code assistantMessageId}：引用已经归属于外层消息，无需重复返回。</li>
     *     <li>{@code documentVersion}：仅用于后端计算引用当前是否仍然有效。</li>
     *     <li>{@code createTime}：当前前端不展示引用记录的创建时间。</li>
     * </ul>
     */
    public record Citation(
            String citationId,
            Long documentId,
            String documentTitle,
            DocumentType documentType,
            String sourceLocator,
            Integer pageNumber,
            String quote,
            boolean available
    ) {

        public Citation(ChatCitation chatCitation) {
            this(
                    chatCitation.getCitationId(),
                    chatCitation.getDocumentId(),
                    chatCitation.getDocumentTitle(),
                    chatCitation.getDocumentType(),
                    chatCitation.getSourceLocator(),
                    chatCitation.getPageNumber(),
                    chatCitation.getQuote(),
                    chatCitation.isAvailable()
            );
        }
    }
}
