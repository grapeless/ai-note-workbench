package com.lim.noteworkbench.model.vo;

public record ChatResponseVO(
        String providerCode,
        String modelCode,
        String content
) {
}
