package com.lim.noteworkbench.service;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import com.lim.noteworkbench.config.properties.EmbeddingModelProperties;
import com.lim.noteworkbench.mapper.KnowledgeCollectionMapper;
import com.lim.noteworkbench.model.dto.CreateCollectionDTO;
import com.lim.noteworkbench.model.dto.UpdateCollectionDTO;
import com.lim.noteworkbench.model.entity.KnowledgeCollection;
import com.lim.noteworkbench.model.vo.EmbeddingModelProviderVO;
import com.lim.noteworkbench.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class KnowledgeCollectionService {
    private final KnowledgeCollectionMapper knowledgeCollectionMapper;
    private final EmbeddingModelProperties embeddingModelProperties;
    private final ChatHistoryService chatHistoryService;
    private final StorageService storageService;

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

        knowledgeCollectionMapper.insert(collection);

        return knowledgeCollectionMapper.findById(collection.getId());
    }

    public KnowledgeCollection getById(Long id) {
        KnowledgeCollection collection = knowledgeCollectionMapper.findById(id);
        if (collection == null) throw new BusinessException(ResultCode.NOT_FOUND_ERROR, "集合不存在");

        return collection;
    }

    public List<KnowledgeCollection> list() {
        return knowledgeCollectionMapper.findAll();
    }

    public List<EmbeddingModelProviderVO> listEmbeddingModels() {
        return embeddingModelProperties.getProviders().entrySet().stream()
                .map(entry -> new EmbeddingModelProviderVO(
                        entry.getKey(),
                        entry.getValue().getModels().stream()
                                .map(EmbeddingModelProperties.ModelProperties::getCode)
                                .toList()
                ))
                .toList();
    }

    public KnowledgeCollection update(Long id, UpdateCollectionDTO request) {
        KnowledgeCollection collection = getById(id);
        collection.setName(request.name());
        collection.setDescription(request.description());
        knowledgeCollectionMapper.update(collection);

        return knowledgeCollectionMapper.findById(id);
    }

    @Transactional
    public void delete(Long id) {
        chatHistoryService.deleteByCollectionId(id);
        knowledgeCollectionMapper.deleteById(id);
        storageService.deleteCollection(id);
    }
}
