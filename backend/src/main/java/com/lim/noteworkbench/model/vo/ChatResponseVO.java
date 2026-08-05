package com.lim.noteworkbench.model.vo;

public record ChatResponseVO(
        Type type,
        String content
) {
    public enum Type {
        REASONING_DELTA,
        ANSWER_DELTA
    }
}