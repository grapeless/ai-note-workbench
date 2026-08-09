package com.lim.noteworkbench.tool;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import com.lim.noteworkbench.config.VectorStoreConfig.VectorStoreRegistry;
import com.lim.noteworkbench.model.constant.AgentToolContextKey;
import com.lim.noteworkbench.model.constant.KnowledgeMetadataKey;
import com.lim.noteworkbench.model.entity.KnowledgeCollection;
import com.lim.noteworkbench.model.entity.KnowledgeDocument;
import com.lim.noteworkbench.rag.etl.KnowledgeDocumentExtractor;
import com.lim.noteworkbench.service.KnowledgeCollectionService;
import com.lim.noteworkbench.service.KnowledgeDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.document.Document;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@SuppressWarnings("unused")
@Component
@RequiredArgsConstructor
public class ResearchTools {

    private final KnowledgeCollectionService knowledgeCollectionService;
    private final VectorStoreRegistry vectorStoreRegistry;
    private final KnowledgeDocumentService knowledgeDocumentService;
    private final KnowledgeDocumentExtractor knowledgeDocumentExtractor;

    //todo 优化检索参数
    @Tool(description = """
            在当前知识库中检索与研究问题相关的文档片段。
            当结果不足时，可以调整查询内容并再次调用。
            """)
    public List<SearchResult> searchKnowledge(
            @ToolParam(description = "本次需要检索的问题、概念或关键词") String query,
            ToolContext toolContext) {

        Long collectionId = (Long) toolContext.getContext().get(AgentToolContextKey.COLLECTION_ID);
        KnowledgeCollection knowledgeCollection = knowledgeCollectionService.getById(collectionId);
        return vectorStoreRegistry.get(knowledgeCollection.getEmbeddingProvider(), knowledgeCollection.getEmbeddingModel())
                .similaritySearch(SearchRequest.builder()
                        .query(query)
                        .similarityThreshold(0.5)
                        .topK(5)
                        .filterExpression(new FilterExpressionBuilder()
                                .eq(KnowledgeMetadataKey.COLLECTION_ID, collectionId)
                                .build())
                        .build()).stream()
                .map(document -> {
                    Map<String, Object> metadata = document.getMetadata();
                    long knowledgeDocumentId = ((Number) metadata.get(KnowledgeMetadataKey.KNOWLEDGE_DOCUMENT_ID)).longValue();
                    int chunkOrder = ((Number) metadata.get(KnowledgeMetadataKey.ORDER)).intValue();

                    return new SearchResult(
                            "D" + knowledgeDocumentId + "-C" + chunkOrder,
                            knowledgeDocumentId,
                            chunkOrder,
                            (String) metadata.get(KnowledgeMetadataKey.SOURCE_LOCATOR),
                            document.getText()
                    );
                })
                .toList();
    }

    public record SearchResult(
            String citationId,
            Long documentId,
            Integer chunkOrder,
            String sourceLocator,
            String content
    ) {
    }


    @Tool(description = """
            列出当前知识库中的文档清单。
            当用户询问知识库有哪些文档、需要确认资料范围或选择特定文档时使用。
            查找文档内容时应使用 searchKnowledge。
            """)
    public List<DocumentSummary> listKnowledgeDocuments(ToolContext toolContext) {
        Long collectionId = (Long) toolContext.getContext().get(AgentToolContextKey.COLLECTION_ID);

        return knowledgeDocumentService.listByCollectionId(collectionId).stream()
                .map(document -> new DocumentSummary(
                        document.getId(),
                        document.getTitle(),
                        document.getContentType(),
                        document.getStatus()
                ))
                .toList();
    }
    public record DocumentSummary(
            Long documentId,
            String title,
            String contentType,
            String status
    ) {
    }

    @Tool(description = """
          按原始文档的自然分段读取指定内容，例如 PDF 的某一页或 Markdown 的某一部分。
          当检索片段不足以支撑结论、需要查看上下文或用户指定了某份文档时使用。
          partIndex 从 0 开始，返回结果可以作为回答引用。
          """)
    public DocumentPart readKnowledgeDocumentPart(
            @ToolParam(description = "要读取的文档 ID") Long documentId,
            @ToolParam(description = "要读取的分段序号，从 0 开始") Integer partIndex, ToolContext toolContext
    ) {
        Long collectionId = (Long) toolContext.getContext().get(AgentToolContextKey.COLLECTION_ID);
        KnowledgeDocument knowledgeDocument = knowledgeDocumentService.getByIdInCollection(collectionId, documentId);

        List<Document> parts = knowledgeDocumentExtractor.extract(knowledgeDocument);

        if (partIndex < 0 || partIndex >= parts.size()) {
            throw new BusinessException(ResultCode.PARAMS_ERROR,
                    "分段序号超出范围，当前文档共有 " + parts.size() + " 个分段");
        }

        return new DocumentPart(
                "D" + documentId + "-P" + partIndex,
                documentId,
                knowledgeDocument.getTitle(),
                partIndex,
                parts.size(),
                parts.get(partIndex).getText()
        );
    }

    public record DocumentPart(
            String citationId,
            Long documentId,
            String title,
            Integer partIndex,
            Integer partCount,
            String content
    ) {
    }
}
