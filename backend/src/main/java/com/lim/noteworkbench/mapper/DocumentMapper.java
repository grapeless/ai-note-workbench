package com.lim.noteworkbench.mapper;

import com.lim.noteworkbench.model.entity.Document;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface DocumentMapper {
    int insert(Document document);

    Document findById(@Param("id") Long id);

    List<Document> findByWorkspaceId(@Param("workspaceId") Long workspaceId);

    int updateStatus(@Param("id") Long id,
                     @Param("status") String status,
                     @Param("errorMessage") String errorMessage);

    int deleteById(@Param("id") Long id);
}
