package com.lim.noteworkbench.controller;

import com.lim.noteworkbench.common.response.Result;
import com.lim.noteworkbench.model.dto.UpdateEditableDocumentDTO;
import com.lim.noteworkbench.model.entity.KnowledgeDocument;
import com.lim.noteworkbench.model.vo.EditableDocumentVO;
import com.lim.noteworkbench.rag.etl.EtlPipeline;
import com.lim.noteworkbench.service.EditableDocumentService;
import com.lim.noteworkbench.service.KnowledgeDocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "文档")
@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class KnowledgeDocumentController {
    private final KnowledgeDocumentService knowledgeDocumentService;
    private final EditableDocumentService editableDocumentService;
    private final EtlPipeline etlPipeline;

    @Operation(summary = "上传文档")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<KnowledgeDocument> upload(
            @Parameter(description = "集合 ID")
            @RequestParam("collectionId")
            @Positive(message = "集合ID必须为正数") Long collectionId,
            @Parameter(description = "文档文件")
            @RequestPart("file") MultipartFile file) {
        KnowledgeDocument document = knowledgeDocumentService.upload(collectionId, file);
        return Result.success(document);
    }

    @Operation(summary = "查询集合下的文档列表")
    @GetMapping("/list")
    public Result<List<KnowledgeDocument>> list(
            @Parameter(description = "集合 ID")
            @RequestParam("collectionId")
            @Positive(message = "集合ID必须为正数") Long collectionId) {
        return Result.success(knowledgeDocumentService.listByCollectionId(collectionId));
    }

    @Operation(summary = "查询文档详情")
    @GetMapping("/{id}")
    public Result<KnowledgeDocument> getById(
            @Parameter(description = "文档 ID")
            @PathVariable
            @Positive(message = "文档ID必须为正数") Long id) {
        return Result.success(knowledgeDocumentService.getById(id));
    }

    @Operation(summary = "ETL文档")
    @PostMapping("/{id}/process")
    public Result<KnowledgeDocument> process(@PathVariable @Positive(message = "文档ID不合法") Long id) {
        return Result.success(etlPipeline.process(id));
    }

    @Operation(summary = "删除指定文档")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        knowledgeDocumentService.delete(id);
        return Result.success();
    }

    @Operation(summary = "读取可编辑类型文档的正文")
    @GetMapping("/{id}/content")
    public Result<EditableDocumentVO> getEditableContent(Long collectionId, @PathVariable Long id) {
        return Result.success(editableDocumentService.read(collectionId, id));
    }

    @Operation(summary = "修改文档内容")
    @PutMapping("/{id}/content")
    public Result<EditableDocumentVO> updateEditableContent(
            Long collectionId,
            @PathVariable Long id,
            @RequestBody UpdateEditableDocumentDTO updateEditableDocumentDTO
    ) {
        return Result.success(editableDocumentService.update(collectionId, id,
                updateEditableDocumentDTO.expectedContentHash(),
                updateEditableDocumentDTO.content()
        ));
    }

    //todo 值得学习的一个接口
    @Operation(summary = "预览不可修改类型文档（目前只有PDF）")
    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<Resource> previewPdf(Long collectionId, @PathVariable Long id) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(knowledgeDocumentService.loadPdf(collectionId, id));
    }

}
