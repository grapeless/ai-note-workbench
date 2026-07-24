package com.lim.noteworkbench.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatRequestDTO(
        @NotBlank String providerCode,
        @NotBlank String modelCode,
        @NotBlank @Size(max = 20_000) String message
) {
}
