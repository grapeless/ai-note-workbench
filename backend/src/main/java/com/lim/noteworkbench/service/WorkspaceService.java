package com.lim.noteworkbench.service;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import com.lim.noteworkbench.mapper.WorkspaceMapper;
import com.lim.noteworkbench.model.dto.CreateWorkspaceDTO;
import com.lim.noteworkbench.model.entity.Workspace;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkspaceService {
    private final WorkspaceMapper workspaceMapper;

    @Transactional
    public Workspace create(CreateWorkspaceDTO request) {
        LocalDateTime now = LocalDateTime.now();

        Workspace workspace = Workspace.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createTime(now)
                .updateTime(now)
                .build();

        int affectedRows = workspaceMapper.insert(workspace);

        if (affectedRows != 1) throw new IllegalStateException("工作区记录插入失败");
        if (workspace.getId() == null) throw new IllegalStateException("数据库没有回填工作区 ID");

        Workspace savedWorkspace = workspaceMapper.findById(workspace.getId());

        if (savedWorkspace == null) throw new IllegalStateException("插入成功，但没有查询到工作区记录");

        return savedWorkspace;
    }

    public Workspace getById(Long id) {
        Workspace workspace = workspaceMapper.findById(id);
        if (workspace == null) throw new BusinessException(ResultCode.NOT_FOUND_ERROR, "工作区不存在");

        return workspace;
    }

    public List<Workspace> list() {
        return workspaceMapper.findAll();
    }

    public void delete(Long id) {
        int affectedRows = workspaceMapper.deleteById(id);

        if (affectedRows == 0) throw new BusinessException(ResultCode.NOT_FOUND_ERROR, "工作区不存在");
        if (affectedRows != 1) throw new IllegalStateException("工作区删除结果异常");
    }
}
