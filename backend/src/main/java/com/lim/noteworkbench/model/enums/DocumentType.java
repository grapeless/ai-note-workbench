package com.lim.noteworkbench.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DocumentType {
    PDF("application/pdf", false),
    PLAIN_TEXT("text/plain", true),
    MARKDOWN("text/markdown", true);

    private final String mediaType;
    private final boolean editable;
}
