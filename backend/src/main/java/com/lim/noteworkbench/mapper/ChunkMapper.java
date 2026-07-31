package com.lim.noteworkbench.mapper;

import com.lim.noteworkbench.model.entity.Chunk;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ChunkMapper {
    int deleteByDocumentId(@Param("documentId") Long documentId);

    int batchInsert(@Param("chunks") List<Chunk> chunks);

    List<Chunk> findByDocumentId(@Param("documentId") Long documentId);
}
