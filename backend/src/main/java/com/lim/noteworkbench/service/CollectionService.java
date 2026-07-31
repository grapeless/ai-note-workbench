package com.lim.noteworkbench.service;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import com.lim.noteworkbench.config.properties.EmbeddingModelProperties;
import com.lim.noteworkbench.mapper.CollectionMapper;
import com.lim.noteworkbench.model.dto.CreateCollectionDTO;
import com.lim.noteworkbench.model.entity.KnowledgeCollection;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CollectionService {
    private final CollectionMapper collectionMapper;
    private final EmbeddingModelProperties embeddingModelProperties;

    @Transactional
    public KnowledgeCollection create(CreateCollectionDTO request) {
        //依旧是参数校验，防止符合格式校验但不存在的提供商/模型
        EmbeddingModelProperties.ProviderProperties provider = embeddingModelProperties.getProviders().get(request.embeddingProvider());

        if (provider == null) {
            throw new BusinessException(ResultCode.PARAMS_ERROR, "不支持的嵌入模型提供商：" + request.embeddingProvider());
        }

        boolean supported = provider.getModels().stream()
                .anyMatch(model -> Objects.equals(model.getCode(), request.embeddingModel()));

        if (!supported) {
            throw new BusinessException(ResultCode.PARAMS_ERROR, "不支持该提供商的嵌入模型：" + request.embeddingModel());
        }

        KnowledgeCollection collection = KnowledgeCollection.builder()
                .name(request.name())
                .description(request.description())
                .embeddingProvider(request.embeddingProvider())
                .embeddingModel(request.embeddingModel())
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
