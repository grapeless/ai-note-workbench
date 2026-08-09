package com.lim.noteworkbench.model.vo;

import com.lim.noteworkbench.model.dto.ProposalDTO;
import com.lim.noteworkbench.model.enums.DocumentType;

import java.util.UUID;

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
    public ProposalVO(ProposalDTO proposalDTO) {
        this(proposalDTO.id(),
                proposalDTO.assistantMessageId(),
                proposalDTO.operation().name(),
                proposalDTO.knowledgeDocumentId(),
                proposalDTO.title(),
                proposalDTO.documentType(),
                proposalDTO.diff(),
                proposalDTO.status()
        );
    }
}
