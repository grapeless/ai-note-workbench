package com.lim.noteworkbench.rag.etl;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import com.lim.noteworkbench.model.constant.KnowledgeMetadataKey;
import com.lim.noteworkbench.model.entity.KnowledgeDocument;
import com.lim.noteworkbench.model.enums.DocumentType;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

@Component
@RequiredArgsConstructor
public class KnowledgeDocumentTransformer {

    private final TokenTextSplitter tokenTextSplitter;

    /**
     *负责将提取结果切分为适合嵌入和检索的（依然是）Document，并补充业务元数据。
     *
     * @param knowledgeDocument 知识文档实体
     * @param extractedDocuments  提取出的文档列表
     * @return 适合后续向量化处理的文本块文档
     */
    public List<Document> transform(KnowledgeDocument knowledgeDocument, List<Document> extractedDocuments) {
        List<Document> chunkDocuments = tokenTextSplitter.apply(extractedDocuments);

        if (chunkDocuments.isEmpty()) throw new BusinessException(ResultCode.SYSTEM_ERROR, "文档切分结果为空");

        return IntStream.range(0, chunkDocuments.size())
                .mapToObj(order -> enrichMetadata(knowledgeDocument, chunkDocuments.get(order), order))
                .toList();
    }


    //todo 继续打磨sourceLocator和未知metadata的构造

    /**
     * 为文本块文档补充集合、文档、索引及来源定位等元数据信息。
     *
     * @param knowledgeDocument 知识文档实体
     * @param chunkDocument 被tokenTextSplitter处理过的文档 {@link Document}
     * @param order 文本块在知识文档中的顺序
     * @return 补充元数据后的文本块文档
     */
    private Document enrichMetadata(KnowledgeDocument knowledgeDocument, Document chunkDocument, int order) {
        HashMap<String, Object> metadata = new HashMap<>(chunkDocument.getMetadata());
        metadata.remove("chunk_index");
        metadata.remove("parent_document_id");
        metadata.putAll(Map.of(
                KnowledgeMetadataKey.COLLECTION_ID, knowledgeDocument.getCollectionId(),
                KnowledgeMetadataKey.KNOWLEDGE_DOCUMENT_ID, knowledgeDocument.getId(),
                KnowledgeMetadataKey.ORDER, order
        ));
        String sourceLocator = resolveSourceLocator(knowledgeDocument.getDocumentType(), chunkDocument, order);
        if (sourceLocator != null) metadata.put(KnowledgeMetadataKey.SOURCE_LOCATOR, sourceLocator);

        return chunkDocument.mutate().metadata(metadata).build();
    }

    /**
     * 根据文档类型和元数据解析文本块的来源定位信息
     *
     * @param documentType 文档类型
     * @param chunkDocument 被tokenTextSplitter处理过的文档 {@link Document}
     * @param order 文本块在知识文档中的顺序
     * @return 来源定位信息，若无法解析则返回 null
     */
    private String resolveSourceLocator(DocumentType documentType, Document chunkDocument, int order) {
        return switch (documentType) {
            case PLAIN_TEXT -> "text" + order;
            case MARKDOWN -> {
                Object title = chunkDocument.getMetadata().get("title");
                yield title == null
                        ? "chunk:" + order
                        : "section:" + title;
            }
            case PDF -> {
                //根据文档元数据中的起始页码解析出定位信息，若未找到页码元数据则返回null
                Object page = chunkDocument.getMetadata().get(PagePdfDocumentReader.METADATA_START_PAGE_NUMBER);
                yield page == null ? null : "page" + page;
            }
        };
    }
}
