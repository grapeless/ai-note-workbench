package com.lim.noteworkbench.service;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import com.lim.noteworkbench.mapper.CollectionMapper;
import com.lim.noteworkbench.model.dto.CreateCollectionDTO;
import com.lim.noteworkbench.model.entity.KnowledgeCollection;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CollectionService {
    private final CollectionMapper collectionMapper;

    @Transactional
    public KnowledgeCollection create(CreateCollectionDTO request) {
        LocalDateTime now = LocalDateTime.now();

        KnowledgeCollection collection = KnowledgeCollection.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createTime(now)
                .updateTime(now)
                .build();

        int affectedRows = collectionMapper.insert(collection);

        if (affectedRows != 1) throw new IllegalStateException("集合记录插入失败");
        if (collection.getId() == null) throw new IllegalStateException("数据库没有回填集合 ID");

        KnowledgeCollection savedCollection = collectionMapper.findById(collection.getId());

        if (savedCollection == null) throw new IllegalStateException("插入成功，但没有查询到集合记录");

        return savedCollection;
    }

    public KnowledgeCollection getById(Long id) {
        KnowledgeCollection collection = collectionMapper.findById(id);
        if (collection == null) throw new BusinessException(ResultCode.NOT_FOUND_ERROR, "集合不存在");

        return collection;
    }

    public List<KnowledgeCollection> list() {
        return collectionMapper.findAll();
    }

    public void delete(Long id) {
        int affectedRows = collectionMapper.deleteById(id);

        if (affectedRows == 0) throw new BusinessException(ResultCode.NOT_FOUND_ERROR, "集合不存在");
        if (affectedRows != 1) throw new IllegalStateException("集合删除结果异常");
    }
}
