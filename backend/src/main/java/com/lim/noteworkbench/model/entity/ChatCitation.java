package com.lim.noteworkbench.model.entity;

import com.lim.noteworkbench.model.enums.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * AI 回答引用实体，用于保存回答生成时使用的来源快照及原文定位信息。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatCitation {

    /**
     * 引用所属的 AI 消息 ID。
     */
    private UUID assistantMessageId;

    /**
     * 展示在回答中的引用标识，例如 {@code D1-C2}。
     */
    private String citationId;

    /**
     * 引用来源文档的 ID。
     */
    private Long documentId;

    /**
     * 创建引用时来源文档的版本，以文档更新时间表示。
     */
    private LocalDateTime documentVersion;

    /**
     * 创建引用时来源文档的标题快照。
     */
    private String documentTitle;

    /**
     * 创建引用时来源文档的类型。
     */
    private DocumentType documentType;

    /**
     * 引用内容在来源文档中的定位信息，例如 Markdown 标题或 PDF 页码标识。
     */
    private String sourceLocator;

    /**
     * PDF 引用所在的页码；文本类型引用不使用该字段。
     */
    private Integer pageNumber;

    /**
     * 回答生成时提供给模型的原文片段快照。
     */
    private String quote;

    /**
     * 引用记录的创建时间。
     */
    private LocalDateTime createTime;

    /**
     * 引用当前是否仍可跳转；查询时根据来源文档版本计算，不是 {@code chat_citation} 表中的字段。
     */
    private boolean available;

}
