package com.lim.noteworkbench.rag.etl;

import com.lim.noteworkbench.model.entity.KnowledgeDocument;
import com.lim.noteworkbench.model.enums.DocumentStatus;
import com.lim.noteworkbench.service.KnowledgeDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class EtlPipeline {
    private final KnowledgeDocumentService knowledgeDocumentService;
    private final KnowledgeDocumentExtractor extractor;
    private final KnowledgeDocumentTransformer transformer;
    private final KnowledgeDocumentLoader loader;

    public KnowledgeDocument process(Long knowledgeDocumentId) {
        //从数据库中获取详细业务文档对象
        KnowledgeDocument knowledgeDocument = knowledgeDocumentService.getById(knowledgeDocumentId);
        //将文档状态更新为解析中
        knowledgeDocumentService.updateStatus(knowledgeDocumentId, DocumentStatus.PARSING, null);

        try {
            //E
            List<Document> extractedDocuments = extractor.extract(knowledgeDocument);
            //T
            List<Document> chunkDocuments = transformer.transform(knowledgeDocument, extractedDocuments);
            //将文档状态更新为解析完毕
            knowledgeDocumentService.updateStatus(knowledgeDocumentId, DocumentStatus.PARSED, null);
            //L，该步需要更新数据库，但事务放在该方法本身，而不是process方法
            loader.load(knowledgeDocument, chunkDocuments);
            //将文档状态更新为嵌入完毕
            knowledgeDocumentService.updateStatus(knowledgeDocumentId, DocumentStatus.EMBEDDED, null);

            //返回该文档
            return knowledgeDocumentService.getById(knowledgeDocumentId);
        } catch (RuntimeException e) {
            //将文档状态更新为解析失败
            knowledgeDocumentService.updateStatus(knowledgeDocumentId, DocumentStatus.FAILED, e.getMessage());
            throw e;
        }
    }
}
