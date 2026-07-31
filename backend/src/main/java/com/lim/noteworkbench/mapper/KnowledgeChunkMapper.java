package com.lim.noteworkbench.mapper;

import com.lim.noteworkbench.model.entity.KnowledgeChunk;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface KnowledgeChunkMapper {
    int deleteByKnowledgeDocumentId(@Param("knowledgeDocumentId") Long knowledgeDocumentId);

    int batchInsert(@Param("knowledgeChunks") List<KnowledgeChunk> knowledgeChunks);

    List<KnowledgeChunk> findByKnowledgeDocumentId(@Param("knowledgeDocumentId") Long knowledgeDocumentId);
}
