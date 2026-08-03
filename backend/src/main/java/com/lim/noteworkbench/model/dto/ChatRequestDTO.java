package com.lim.noteworkbench.model.dto;

import com.lim.noteworkbench.model.enums.ChatMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ChatRequestDTO(
        @NotNull Long collectionId,
        @NotBlank String providerCode,
        @NotBlank String modelCode,
        @NotBlank @Size(max = 20_000) String message,
        @NotNull ChatMode mode,
        @NotBlank String conversationId
) {
}
