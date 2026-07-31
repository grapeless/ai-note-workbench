package com.lim.noteworkbench.etl;

import com.lim.noteworkbench.mapper.ChunkMapper;
import com.lim.noteworkbench.model.entity.Chunk;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class KnowledgeDocumentLoader {

    private final ChunkMapper chunkMapper;

    /**
     * 将某个文档的Chunk数据，完整替换为本次的ETL结果
     */
    @Transactional
    public void replaceChunks(Long knowledgeDocumentId, List<Chunk> chunks){
        chunkMapper.deleteByDocumentId(knowledgeDocumentId);
        chunkMapper.batchInsert(chunks);

    }


}
