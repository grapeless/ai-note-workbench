package com.lim.noteworkbench.model.vo;

import lombok.Builder;

@Builder
public record RetrievalResultVO(
        Long chunkId,
        Long knowledgeDocumentId,
        Integer order,
        String content,
        String sourceLocator,
        Double score
) {
}