package com.lim.noteworkbench.etl;

import com.lim.noteworkbench.mapper.DocumentMapper;
import com.lim.noteworkbench.model.entity.KnowledgeDocument;
import com.lim.noteworkbench.model.enums.DocumentStatus;
import com.lim.noteworkbench.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EtlPipeline {
    private final DocumentService documentService;
    private final DocumentMapper documentMapper;
    private final KnowledgeDocumentExtractor extractor;
    private final KnowledgeDocumentTransformer transformer;
    private final KnowledgeDocumentLoader loader;

    public KnowledgeDocument process(Long knowledgeDocumentId) {
        //从数据库中获取业务文档对象后将文档状态设置为解析中
        KnowledgeDocument knowledgeDocument = documentService.getById(knowledgeDocumentId);
        documentMapper.updateStatus(knowledgeDocumentId, DocumentStatus.PARSING.name(), null);

        try {

            loader.replaceChunks(knowledgeDocumentId,
                    transformer.transform(knowledgeDocument,
                            extractor.extract(knowledgeDocument)));

            documentMapper.updateStatus(knowledgeDocumentId, DocumentStatus.PARSED.name(), null);
            return documentService.getById(knowledgeDocumentId);
        } catch (RuntimeException e) {
            documentMapper.updateStatus(knowledgeDocumentId, DocumentStatus.FAILED.name(), e.getMessage());
            throw e;
        }
    }
}
