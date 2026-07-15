package com.lim.noteworkbench.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "创建工作区参数")
public class CreateWorkspaceDTO {
    @Schema(description = "工作区名称")
    @NotBlank(message = "工作区名称不能为空")
    @Size(max = 100, message = "工作区名称长度不能超过100个字符")
    private String name;

    @Schema(description = "工作区描述")
    @Size(max = 1000, message = "工作区描述长度不能超过1000个字符")
    private String description;
}
