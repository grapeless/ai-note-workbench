package com.lim.noteworkbench.service;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import com.lim.noteworkbench.model.dto.ProposalDTO;
import com.lim.noteworkbench.model.entity.KnowledgeDocument;
import com.lim.noteworkbench.model.vo.EditableDocumentVO;
import com.lim.noteworkbench.rag.etl.EtlPipeline;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class ProposalService {

    /**
     * 使用内存保存提案。应用重启后，尚未确认的提案自动失效。
     */
    private final Map<UUID, ProposalDTO> proposals = new ConcurrentHashMap<>();

    private final KnowledgeDocumentService knowledgeDocumentService;
    private final EtlPipeline etlPipeline;

    /**
     * 创建“更新文档”提案，不执行任何文件操作
     */
    public ProposalDTO update(
            Long collectionId,
            UUID conversationId,
            Long knowledgeDocumentId,
            String proposedContent
    ) {
        EditableDocumentVO editableDocument = knowledgeDocumentService.readEditableDocument(collectionId, knowledgeDocumentId);

        if (editableDocument.content().equals(proposedContent)) {
            throw new BusinessException(ResultCode.PARAMS_ERROR, "拟议内容与当前文档内容相同");
        }

        ProposalDTO proposalDTO = ProposalDTO.builder()
                .id(UUID.randomUUID())
                .conversationId(conversationId)
                .knowledgeCollectionId(collectionId)
                .knowledgeDocumentId(knowledgeDocumentId)
                .operation(ProposalDTO.Operation.UPDATE)
                .title(editableDocument.title())
                .contentType(editableDocument.contentType())
                .proposedContent(proposedContent)
                .diff(buildDiff(editableDocument.content(), proposedContent))
                .expectedContentHash(hash(editableDocument.content()))
                .status(ProposalDTO.Status.PENDING)
                .createTime(LocalDateTime.now())
                .build();

        proposals.put(proposalDTO.id(), proposalDTO);
        return proposalDTO;
    }

    public synchronized KnowledgeDocument applyUpdate(UUID proposalId, UUID conversationId) {
        ProposalDTO proposalDTO = get(proposalId, conversationId);

        // 已经执行完成时直接返回，避免用户重复点击造成重复写入。
        if (proposalDTO.status() == ProposalDTO.Status.APPLIED) {
            return knowledgeDocumentService.getByIdInCollection(proposalDTO.knowledgeCollectionId(), proposalDTO.knowledgeDocumentId());
        }

        EditableDocumentVO editableDocument = knowledgeDocumentService.readEditableDocument(proposalDTO.knowledgeCollectionId(), proposalDTO.knowledgeDocumentId());

        //如果当前摘要不一致，说明提案生成后文档又被修改过。
        boolean unchanged = hash(editableDocument.content()).equals(proposalDTO.expectedContentHash());
        //没有有效修改，跳过写入
        boolean alreadyWritten = editableDocument.content().equals(proposalDTO.proposedContent());

        if (!unchanged && !alreadyWritten) {
            throw new BusinessException(ResultCode.PARAMS_ERROR, "文档已发生变化，请重新生成修改方案");
        }

        if (!alreadyWritten) {
            knowledgeDocumentService.overwriteEditableDocument(
                    proposalDTO.knowledgeCollectionId(),
                    proposalDTO.knowledgeDocumentId(),
                    proposalDTO.proposedContent()
            );
        }

        //etl文件
        KnowledgeDocument knowledgeDocument = etlPipeline.process(proposalDTO.knowledgeDocumentId());
        proposals.put(proposalDTO.id(), proposalDTO.toBuilder()
                .status(ProposalDTO.Status.APPLIED)
                .build());

        return knowledgeDocument;
    }

    /**
     * 根据 ID 查询属于指定会话的提案。
     */
    public ProposalDTO get(UUID proposalId, UUID conversationId) {
        ProposalDTO proposalDTO = proposals.get(proposalId);

        if (proposalDTO == null) {
            throw new BusinessException(ResultCode.NOT_FOUND_ERROR, "文档变更提案不存在或已失效");
        }

        if (!proposalDTO.conversationId().equals(conversationId)) {
            throw new BusinessException(ResultCode.NO_AUTH_ERROR, "提案不属于当前会话");
        }

        return proposalDTO;
    }

    public List<ProposalDTO> listByConversationId(UUID conversationId) {
        return proposals.values().stream()
                .filter(proposalDTO -> proposalDTO.conversationId().equals(conversationId))
                .sorted(Comparator.comparing(ProposalDTO::createTime))
                .toList();
    }

    /**
     * 计算当前内容的版本标识，用于后续写入前的并发检查。
     */
    private String hash(String content) {
        return DigestUtils.md5DigestAsHex(content.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 生成单区块文本 Diff，保留变化区域前后三行上下文。
     * 这不是完整的 Git Diff 算法，但足以支持当前的修改预览。
     */
    private String buildDiff(String currentContent, String proposedContent) {
        List<String> currentLines = toLines(currentContent);
        List<String> proposedLines = toLines(proposedContent);

        int prefix = 0;
        while (prefix < currentLines.size()
                && prefix < proposedLines.size()
                && currentLines.get(prefix).equals(proposedLines.get(prefix))) prefix++;

        int suffix = 0;
        while (suffix < currentLines.size() - prefix
                && suffix < proposedLines.size() - prefix
                && currentLines.get(currentLines.size() - 1 - suffix)
                .equals(proposedLines.get(proposedLines.size() - 1 - suffix))) suffix++;

        int contextStart = Math.max(0, prefix - 3);
        int currentChangeEnd = currentLines.size() - suffix;
        int proposedChangeEnd = proposedLines.size() - suffix;
        int trailingContext = Math.min(3, suffix);

        StringBuilder diff = new StringBuilder()
                .append("--- 当前内容\n")
                .append("+++ 拟议内容\n")
                .append("@@ -")
                .append(contextStart + 1)
                .append(',')
                .append(currentChangeEnd - contextStart + trailingContext)
                .append(" +")
                .append(contextStart + 1)
                .append(',')
                .append(proposedChangeEnd - contextStart + trailingContext)
                .append(" @@\n");

        for (int index = contextStart; index < prefix; index++) {
            diff.append(' ').append(currentLines.get(index)).append('\n');
        }

        for (int index = prefix; index < currentChangeEnd; index++) {
            diff.append('-').append(currentLines.get(index)).append('\n');
        }

        for (int index = prefix; index < proposedChangeEnd; index++) {
            diff.append('+').append(proposedLines.get(index)).append('\n');
        }

        for (int index = currentChangeEnd; index < currentChangeEnd + trailingContext; index++) {
            diff.append(' ').append(currentLines.get(index)).append('\n');
        }

        return diff.toString();
    }

    /**
     * 空字符串代表没有任何行，而不是包含一个空白行。
     */
    private List<String> toLines(String content) {
        if (content.isEmpty()) {
            return List.of();
        }

        return Arrays.asList(content.split("\\R", -1));
    }

}
