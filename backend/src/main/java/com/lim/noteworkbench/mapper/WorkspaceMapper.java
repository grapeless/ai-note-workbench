package com.lim.noteworkbench.mapper;

import com.lim.noteworkbench.model.entity.Workspace;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface WorkspaceMapper {
    int insert(Workspace workspace);

    Workspace findById(@Param("id") Long id);

    List<Workspace> findAll();

    int update(Workspace workspace);

    int deleteById(@Param("id") Long id);
}
