package com.lim.noteworkbench.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(description = "聊天请求参数")
public record ChatRequestDTO(
        @Schema(description = "集合 ID")
        @NotNull Long collectionId,

        @Schema(description = "聊天模型提供商编码")
        @NotBlank String providerCode,

        @Schema(description = "聊天模型编码")
        @NotBlank String modelCode,

        @Schema(description = "用户消息内容")
        @NotBlank @Size(max = 20_000) String message,

        @Schema(description = "会话 ID")
        @NotNull UUID conversationId,

        @Schema(description = "本轮助手消息 ID")
        @NotNull UUID assistantMessageId
) {
}
