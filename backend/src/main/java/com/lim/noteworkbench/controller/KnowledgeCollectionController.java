package com.lim.noteworkbench.controller;

import com.lim.noteworkbench.common.response.Result;
import com.lim.noteworkbench.model.dto.CreateCollectionDTO;
import com.lim.noteworkbench.model.entity.KnowledgeCollection;
import com.lim.noteworkbench.service.KnowledgeCollectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "集合")
@RestController
@RequestMapping("/collections")
@RequiredArgsConstructor
public class KnowledgeCollectionController {
    private final KnowledgeCollectionService knowledgeCollectionService;

    @Operation(summary = "创建集合")
    @PostMapping
    public Result<KnowledgeCollection> create(@RequestBody @Valid CreateCollectionDTO request) {
        return Result.success(knowledgeCollectionService.create(request));
    }

    @Operation(summary = "查询集合列表")
    @GetMapping("/list")
    public Result<List<KnowledgeCollection>> list() {
        return Result.success(knowledgeCollectionService.list());
    }

    @Operation(summary = "查询集合详情")
    @GetMapping("/{id}")
    public Result<KnowledgeCollection> getById(@Parameter(description = "集合 ID") @PathVariable Long id) {
        return Result.success(knowledgeCollectionService.getById(id));
    }

    @Operation(summary = "删除集合")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@Parameter(description = "集合 ID") @PathVariable Long id) {
        knowledgeCollectionService.delete(id);
        return Result.success();
    }
}
