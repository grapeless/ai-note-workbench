package com.lim.noteworkbench.rag.etl;

import com.lim.noteworkbench.config.VectorStoreConfig.VectorStoreRegistry;
import com.lim.noteworkbench.mapper.KnowledgeChunkMapper;
import com.lim.noteworkbench.mapper.KnowledgeCollectionMapper;
import com.lim.noteworkbench.model.constant.KnowledgeMetadataKey;
import com.lim.noteworkbench.model.entity.KnowledgeChunk;
import com.lim.noteworkbench.model.entity.KnowledgeCollection;
import com.lim.noteworkbench.model.entity.KnowledgeDocument;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.IntStream;

@Component
@RequiredArgsConstructor
public class KnowledgeDocumentLoader {

    private final KnowledgeChunkMapper knowledgeChunkMapper;
    private final VectorStoreRegistry vectorStoreRegistry;
    private final KnowledgeCollectionMapper knowledgeCollectionMapper;

    /**
     * 将chunkDocuments解析为knowledgeChunks和真实向量数据，然后存储。
     *
     * @param knowledgeDocument 文档实体
     * @param chunkDocuments transform来的Documents
     */
    @Transactional
    public void load(KnowledgeDocument knowledgeDocument, List<Document> chunkDocuments) {
        KnowledgeCollection knowledgeCollection = knowledgeCollectionMapper.findById(knowledgeDocument.getCollectionId());

        PgVectorStore pgVectorStore = vectorStoreRegistry.get(knowledgeCollection.getEmbeddingProvider(),
                knowledgeCollection.getEmbeddingModel());

        //构造咱们的KnowledgeChunks，信息来源于上一步transform出来的Documents
        List<KnowledgeChunk> knowledgeChunks = chunkDocuments.stream()
                .map(document -> KnowledgeChunk.builder()
                        .knowledgeDocumentId(knowledgeDocument.getId())
                        .order((Integer) document.getMetadata().get(KnowledgeMetadataKey.ORDER))
                        .sourceLocator((String) document.getMetadata().get(KnowledgeMetadataKey.SOURCE_LOCATOR))
                        .build())
                .toList();

        //删除再重建（咱们自己的KnowledgeChunk）吗，是的，因为一个文档部分改动，不可能单独对该部分做向量化处理
        knowledgeChunkMapper.deleteByKnowledgeDocumentId(knowledgeDocument.getId());
        knowledgeChunkMapper.batchInsert(knowledgeChunks);
        List<KnowledgeChunk> newKnowledgeChunks = knowledgeChunkMapper.findByKnowledgeDocumentId(knowledgeDocument.getId());

        //构造真正向量表的chunk并写入
        //不要使用doAdd，使用add，前者类似Thread的run，而后者是start，应该通过后者调用
        pgVectorStore.add(IntStream.range(0, chunkDocuments.size())
                .mapToObj(index -> chunkDocuments.get(index).mutate()
                        .id(newKnowledgeChunks.get(index).getId().toString())
                        .build()
                ).toList());
    }

}
