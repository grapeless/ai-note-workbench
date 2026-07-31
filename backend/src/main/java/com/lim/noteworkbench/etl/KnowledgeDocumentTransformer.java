package com.lim.noteworkbench.etl;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import com.lim.noteworkbench.model.entity.Chunk;
import com.lim.noteworkbench.model.entity.KnowledgeDocument;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.stream.IntStream;

/**
 * 知识文档转换器，负责将提取的文档按Token切分为文本块，并构建为Chunk实体列表。
 */
@Component
@RequiredArgsConstructor
public class KnowledgeDocumentTransformer {

    private final TokenTextSplitter tokenTextSplitter;

    /**
     * 将提取的文档 {@link Document} 切分为文本块 {@link Chunk}。
     *
     * @param knowledgeDocument 知识文档实体
     * @param extractedDocuments  提取出的文档列表
     */
    public List<Chunk> transform(KnowledgeDocument knowledgeDocument, List<Document> extractedDocuments) {
        List<Document> splitDocuments = tokenTextSplitter.apply(extractedDocuments);

        if (splitDocuments.isEmpty()) throw new BusinessException(ResultCode.SYSTEM_ERROR, "文档切分结果为空");

        return IntStream.range(0, splitDocuments.size())
                .mapToObj(index -> {
                    Document document = splitDocuments.get(index);
                    HashMap<String, Object> metadata = new HashMap<>(document.getMetadata());
                    //移除两个SpringAI生成的会与咱们自定义的Chunk重复的元信息chunk字段
                    metadata.remove("chunk_index");
                    metadata.remove("parent_document_id");

                    return Chunk.builder()
                            //注意document中是没有业务id的，他是框架的对象
                            .documentId(knowledgeDocument.getId())
                            .chunkIndex(index)
                            .content(document.getText())
                            .sourceLocator(resolveSourceLocator(knowledgeDocument.getContentType(), document, index))
                            //.tokenCount(null)
                            .metadata(metadata)
                            .build();
                })
                .toList();
    }

    private String resolveSourceLocator(String contentType, Document document, int chunkIndex) {
        return switch (contentType) {
            case "text/plain" -> "text" + chunkIndex;
            case "text/markdown" -> {
                Object title = document.getMetadata().get("title");
                yield title == null
                        ? "chunk:" + chunkIndex
                        : "section:" + title;
            }
            case "application/pdf" -> {
                //根据文档元数据中的起始页码解析出定位信息，若未找到页码元数据则返回null
                Object page = document.getMetadata().get(PagePdfDocumentReader.METADATA_START_PAGE_NUMBER);
                yield page == null ? null : "page" + page;
            }
            default -> throw new BusinessException(ResultCode.PARAMS_ERROR, "不支持的文档类型：" + contentType);
        };
    }
}
