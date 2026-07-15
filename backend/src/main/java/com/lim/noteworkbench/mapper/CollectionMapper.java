package com.lim.noteworkbench.mapper;

import com.lim.noteworkbench.model.entity.KnowledgeCollection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CollectionMapper {
    int insert(KnowledgeCollection collection);

    KnowledgeCollection findById(@Param("id") Long id);

    List<KnowledgeCollection> findAll();

    int update(KnowledgeCollection collection);

    int deleteById(@Param("id") Long id);
}
