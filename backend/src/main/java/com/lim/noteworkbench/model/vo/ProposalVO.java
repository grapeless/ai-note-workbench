package com.lim.noteworkbench.model.vo;

import com.lim.noteworkbench.model.dto.ProposalDTO;
import com.lim.noteworkbench.model.enums.DocumentType;
import lombok.Builder;

import java.util.UUID;

@Builder
public record ProposalVO(
        UUID proposalId,
        UUID assistantMessageId,
        String operation,
        Long knowledgeDocumentId,
        String title,
        DocumentType documentType,
        String diff,
        ProposalDTO.Status status
) {
    public static ProposalVO from(ProposalDTO proposalDTO) {
        return ProposalVO.builder()
                .proposalId(proposalDTO.id())
                .assistantMessageId(proposalDTO.assistantMessageId())
                .operation(proposalDTO.operation().name())
                .knowledgeDocumentId(proposalDTO.knowledgeDocumentId())
                .title(proposalDTO.title())
                .documentType(proposalDTO.documentType())
                .diff(proposalDTO.diff())
                .status(proposalDTO.status())
                .build();
    }
}
