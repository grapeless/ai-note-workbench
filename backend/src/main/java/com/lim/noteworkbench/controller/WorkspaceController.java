package com.lim.noteworkbench.controller;

import com.lim.noteworkbench.common.response.Result;
import com.lim.noteworkbench.model.dto.CreateWorkspaceDTO;
import com.lim.noteworkbench.model.entity.Workspace;
import com.lim.noteworkbench.service.WorkspaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "工作区")
@RestController
@RequestMapping("/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {
    private final WorkspaceService workspaceService;

    @Operation(summary = "创建工作区")
    @PostMapping
    public Result<Workspace> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "创建工作区参数")
            @RequestBody
            @Valid CreateWorkspaceDTO request) {
        return Result.success(workspaceService.create(request));
    }

    @Operation(summary = "查询工作区列表")
    @GetMapping("/list")
    public Result<List<Workspace>> list() {
        return Result.success(workspaceService.list());
    }

    @Operation(summary = "查询工作区详情")
    @GetMapping("/{id}")
    public Result<Workspace> getById(
            @Parameter(description = "工作区 ID")
            @PathVariable
            @Positive(message = "工作区ID必须为正数") Long id) {
        return Result.success(workspaceService.getById(id));
    }

    @Operation(summary = "删除工作区")
    @DeleteMapping("/{id}")
    public Result<Void> delete(
            @Parameter(description = "工作区 ID")
            @PathVariable
            @Positive(message = "工作区ID必须为正数") Long id) {
        workspaceService.delete(id);
        return Result.success();
    }

}
