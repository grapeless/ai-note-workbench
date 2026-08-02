package com.lim.noteworkbench.model.dto;

import com.lim.noteworkbench.model.enums.ChatMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ChatRequestDTO(
        @NotBlank String providerCode,
        @NotBlank String modelCode,
        @NotNull ChatMode mode,
        @NotBlank @Size(max = 20_000) String message,
        @NotNull Long collectionId
) {
}
