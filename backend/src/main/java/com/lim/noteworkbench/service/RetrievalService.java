package com.lim.noteworkbench.service;

import com.lim.noteworkbench.model.constant.KnowledgeMetadataKey;
import com.lim.noteworkbench.model.entity.KnowledgeCollection;
import com.lim.noteworkbench.model.vo.RetrievalResultVO;
import com.lim.noteworkbench.rag.VectorStoreRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RetrievalService {

    private final KnowledgeCollectionService knowledgeCollectionService;
    private final VectorStoreRegistry vectorStoreRegistry;

    public List<RetrievalResultVO> retrieve(Long collectionId, String query, int topK) {
        KnowledgeCollection collection = knowledgeCollectionService.getById(collectionId);

        return vectorStoreRegistry.get(collection.getEmbeddingProvider(), collection.getEmbeddingModel())
                .similaritySearch(SearchRequest.builder()
                        .query(query)
                        .topK(topK)
                        //.similarityThreshold()
                        .filterExpression(new FilterExpressionBuilder().
                                eq(KnowledgeMetadataKey.COLLECTION_ID, collectionId)
                                .build())
                        .build()).stream()
                .map(this::toResult)
                .toList();
    }

    private RetrievalResultVO toResult(Document document) {
        Map<String, Object> metadata = document.getMetadata();

        return RetrievalResultVO.builder()
                .knowledgeDocumentId(((Number) metadata.get(KnowledgeMetadataKey.KNOWLEDGE_DOCUMENT_ID)).longValue())
                .order(((Number) metadata.get(KnowledgeMetadataKey.ORDER)).intValue())
                .sourceLocator((String) metadata.get(KnowledgeMetadataKey.SOURCE_LOCATOR))
                .chunkId(Long.valueOf(document.getId()))
                .content(document.getText())
                .score(document.getScore())
                .build();
    }
}
