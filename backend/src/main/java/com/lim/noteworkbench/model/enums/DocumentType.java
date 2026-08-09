package com.lim.noteworkbench.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DocumentType {
    PDF("pdf", false),
    PLAIN_TEXT("txt", true),
    MARKDOWN("md", true);

    private final String extension;
    private final boolean editable;
}
