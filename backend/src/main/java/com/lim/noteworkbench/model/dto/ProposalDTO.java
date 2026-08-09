package com.lim.noteworkbench.model.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 文档变更提案。
 *
 * <p>保存 Agent 拟议的文档变更及其执行状态。提案创建时不会直接修改文件，
 * 只有用户确认后才会应用 {@link #proposedContent()}。</p>
 *
 * @param id                    提案 ID，用于查询和应用提案
 * @param conversationId        提案所属的会话 ID，用于限制确认范围
 * @param knowledgeCollectionId 提案所属的知识库 ID
 * @param knowledgeDocumentId   目标文档 ID；创建文档时为空
 * @param operation             变更操作类型
 * @param title                 文档标题
 * @param contentType           文档内容类型
 * @param proposedContent       准备写入的完整文档内容
 * @param diff                  用于向用户展示的内容差异
 * @param expectedContentHash   创建提案时原文的摘要，用于应用前检测内容冲突
 * @param status                提案状态
 * @param createTime            提案创建时间
 */
@Builder(toBuilder = true)
public record ProposalDTO(
        UUID id,
        UUID conversationId,
        Long knowledgeCollectionId,
        Long knowledgeDocumentId,
        Operation operation,
        String title,
        String contentType,
        String proposedContent,
        String diff,
        String expectedContentHash,
        Status status,
        LocalDateTime createTime
) {
    /**
     * 提案支持的文档变更类型。
     */
    public enum Operation {
        /** 创建文档。 */
        CREATE,
        /** 修改已有文档。 */
        UPDATE,
    }

    /**
     * 提案的执行状态。
     */
    public enum Status {
        /** 等待用户确认。 */
        PENDING,
        /** 已成功写入文档并完成后续处理。 */
        APPLIED,
    }
}
