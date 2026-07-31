package com.lim.noteworkbench.etl;

import com.lim.noteworkbench.mapper.KnowledgeChunkMapper;
import com.lim.noteworkbench.mapper.KnowledgeCollectionMapper;
import com.lim.noteworkbench.model.entity.KnowledgeChunk;
import com.lim.noteworkbench.model.entity.KnowledgeCollection;
import com.lim.noteworkbench.model.entity.KnowledgeDocument;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

@Component
public class KnowledgeDocumentLoader {

    private final KnowledgeChunkMapper knowledgeChunkMapper;
    private final Map<String, Map<String, PgVectorStore>> pgVectorStores;
    private final KnowledgeCollectionMapper knowledgeCollectionMapper;

    public KnowledgeDocumentLoader(KnowledgeChunkMapper knowledgeChunkMapper,
                                   @Qualifier("pgVectorStores") Map<String, Map<String, PgVectorStore>> pgVectorStores,
                                   KnowledgeCollectionMapper knowledgeCollectionMapper) {
        this.knowledgeChunkMapper = knowledgeChunkMapper;
        this.pgVectorStores = pgVectorStores;
        this.knowledgeCollectionMapper = knowledgeCollectionMapper;
    }

    /**
     * 将chunkDocuments解析为knowledgeChunks和真实向量数据，然后存储。
     *
     * @param knowledgeDocument 文档实体
     * @param chunkDocuments transform来的Documents
     */
    @Transactional
    public void load(KnowledgeDocument knowledgeDocument, List<Document> chunkDocuments) {
        PgVectorStore pgVectorStore = resolveVectorStore(knowledgeDocument.getCollectionId());

        //构造咱们的KnowledgeChunks，信息来源于上一步transform出来的Documents
        List<KnowledgeChunk> knowledgeChunks = chunkDocuments.stream()
                .map(document -> KnowledgeChunk.builder()
                        .knowledgeDocumentId(knowledgeDocument.getId())
                        .order((Integer) document.getMetadata().get("order")) //todo 元信息硬编码有点多
                        .sourceLocator((String) document.getMetadata().get("sourceLocator"))
                        .build())
                .toList();

        //删除再重建（咱们自己的KnowledgeChunk）吗，是的，因为一个文档部分改动，不可能单独对该部分做向量化处理
        knowledgeChunkMapper.deleteByKnowledgeDocumentId(knowledgeDocument.getId());
        knowledgeChunkMapper.batchInsert(knowledgeChunks);
        List<KnowledgeChunk> newKnowledgeChunks = knowledgeChunkMapper.findByKnowledgeDocumentId(knowledgeDocument.getId());

        //构造真正向量表的chunk并写入
        //不要使用doAdd，使用add，前者类似Thread的run，而后者是start，应该通过后者调用
        pgVectorStore.add(IntStream.range(0,chunkDocuments.size())
                .mapToObj(index -> chunkDocuments.get(index).mutate()
                        .id(newKnowledgeChunks.get(index).getId().toString())
                        .build()
                ).toList());
    }

    /**
     * 根据知识集合ID获取其嵌入配置对应的向量存储实例。
     *
     * @param collectionId 知识集合ID
     * @return 对应的向量存储实例
     * @throws IllegalStateException 当知识集合不存在时抛出
     */
    private PgVectorStore resolveVectorStore(Long collectionId) {
        KnowledgeCollection knowledgeCollection = knowledgeCollectionMapper.findById(collectionId);
        if (knowledgeCollection == null) throw new IllegalStateException("不存在的知识库");

        return pgVectorStores.get(knowledgeCollection.getEmbeddingProvider())
                .get(knowledgeCollection.getEmbeddingModel());
    }

}
