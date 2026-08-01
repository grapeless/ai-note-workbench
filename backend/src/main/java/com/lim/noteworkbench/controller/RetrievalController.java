package com.lim.noteworkbench.controller;

import com.lim.noteworkbench.common.response.Result;
import com.lim.noteworkbench.model.vo.RetrievalResultVO;
import com.lim.noteworkbench.service.RetrievalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "RAG检索")
@RestController
@RequestMapping("/retrieve")
@RequiredArgsConstructor
public class RetrievalController {

    private final RetrievalService retrievalService;

    @Operation(summary = "执行检索")
    @GetMapping("/search")
    public Result<List<RetrievalResultVO>> retrieve(Long collectionId,
                                                  String query,
                                                  @RequestParam(defaultValue = "5") int topK) {
        return Result.success(retrievalService.retrieve(collectionId, query, topK));
    }
}
