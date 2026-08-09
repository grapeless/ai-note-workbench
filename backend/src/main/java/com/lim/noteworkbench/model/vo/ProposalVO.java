package com.lim.noteworkbench.model.vo;

import com.lim.noteworkbench.model.dto.ProposalDTO;
import lombok.Builder;

import java.util.UUID;

@Builder
public record ProposalVO(
        UUID proposalId,
        String operation,
        Long knowledgeDocumentId,
        String title,
        String contentType,
        String diff,
        ProposalDTO.Status status
) {
    public static ProposalVO from(ProposalDTO proposalDTO) {
        return ProposalVO.builder()
                .proposalId(proposalDTO.id())
                .operation(proposalDTO.operation().name())
                .knowledgeDocumentId(proposalDTO.knowledgeDocumentId())
                .title(proposalDTO.title())
                .contentType(proposalDTO.contentType())
                .diff(proposalDTO.diff())
                .status(proposalDTO.status())
                .build();
    }
}
