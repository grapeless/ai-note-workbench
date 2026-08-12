package com.lim.noteworkbench.mapper;

import com.lim.noteworkbench.model.entity.KnowledgeDocument;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface KnowledgeDocumentMapper {
    int insert(KnowledgeDocument document);

    KnowledgeDocument findById(@Param("id") Long id);

    List<KnowledgeDocument> findByCollectionId(@Param("collectionId") Long collectionId);

    int updateStatus(@Param("id") Long id,
                     @Param("status") String status,
                     @Param("errorMessage") String errorMessage);

    int deleteById(@Param("id") Long id);

    int updateTitle(@Param("id") Long id, @Param("title") String title);
}
