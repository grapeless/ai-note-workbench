package com.lim.noteworkbench.model.vo;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "聊天流式响应")
public record ChatResponseVO(
        @Schema(description = "响应内容类型")
        Type type,
        @Schema(description = "响应内容")
        String content
) {
    @Schema(description = "聊天响应内容类型")
    public enum Type {
        REASONING_DELTA,
        ANSWER_DELTA
    }
}
