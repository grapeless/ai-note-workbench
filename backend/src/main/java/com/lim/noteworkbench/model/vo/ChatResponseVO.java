package com.lim.noteworkbench.model.vo;

public record ChatResponseVO(
        String providerCode,
        String model,
        String content
) {
}
