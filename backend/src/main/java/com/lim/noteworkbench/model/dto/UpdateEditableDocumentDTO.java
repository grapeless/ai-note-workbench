package com.lim.noteworkbench.model.dto;

public record UpdateEditableDocumentDTO(
        String expectedContentHash,
        String content
) {
}
