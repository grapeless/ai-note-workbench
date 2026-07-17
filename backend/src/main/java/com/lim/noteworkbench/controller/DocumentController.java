package com.lim.noteworkbench.controller;

import com.lim.noteworkbench.common.response.Result;
import com.lim.noteworkbench.model.entity.Document;
import com.lim.noteworkbench.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
@Tag(name = "文档")
public class DocumentController {
    private final DocumentService documentService;

    @Operation(summary = "上传文档")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<Document> upload(
            @Parameter(description = "集合 ID")
            @RequestParam("collectionId")
            @Positive(message = "集合ID必须为正数") Long collectionId,
            @Parameter(description = "文档文件")
            @RequestPart("file") MultipartFile file) {
        Document document = documentService.upload(collectionId, file);
        return Result.success(document);
    }

    @Operation(summary = "查询集合下的文档列表")
    @GetMapping("/list")
    public Result<List<Document>> list(
            @Parameter(description = "集合 ID")
            @RequestParam("collectionId")
            @Positive(message = "集合ID必须为正数") Long collectionId) {
        return Result.success(documentService.listByCollectionId(collectionId));
    }

    @Operation(summary = "查询文档详情")
    @GetMapping("/{id}")
    public Result<Document> getById(
            @Parameter(description = "文档 ID")
            @PathVariable
            @Positive(message = "文档ID必须为正数") Long id) {
        return Result.success(documentService.getById(id));
    }
}
