package com.lim.noteworkbench.config;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import com.lim.noteworkbench.config.properties.EmbeddingModelProperties;
import org.springframework.ai.document.MetadataMode;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.openai.OpenAiEmbeddingModel;
import org.springframework.ai.openai.OpenAiEmbeddingOptions;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * <pre>
 *   EmbeddingModelProperties
 *           ↓
 *   OpenAiEmbeddingModel
 *           ↓
 *   PgVectorStore
 * </pre>
 */
@Configuration
public class VectorStoreConfig {

    @Bean
    public VectorStoreRegistry vectorStoreRegistry(JdbcTemplate jdbcTemplate, EmbeddingModelProperties properties) {
        Map<String, Map<String, PgVectorStore>> whichProvider = new LinkedHashMap<>();
        properties.getProviders().forEach((providerCode, providerProperties) -> {
            Map<String, PgVectorStore> whichModel = new LinkedHashMap<>();
            providerProperties.getModels().forEach(modelProperties -> {
                EmbeddingModel embeddingModel = buildEmbeddingModel(providerProperties, modelProperties);

                PgVectorStore pgVectorStore = PgVectorStore.builder(jdbcTemplate, embeddingModel)
                        // 使用 KnowledgeChunk 的 BIGINT 主键作为向量记录 ID，与向量表到 knowledge_chunk(id) 的外键保持一致
                        .idType(PgVectorStore.PgIdType.BIGSERIAL)
                        .dimensions(modelProperties.getDimension())
                        //使用余弦距离计算文本语义相似度
                        .distanceType(PgVectorStore.PgDistanceType.COSINE_DISTANCE)
                        //HNSW（Hierarchical Navigable Small World）分层导航地图，是一种近似最近邻搜索算法，常用于向量数据库里快速找最相似的向量
                        .indexType(PgVectorStore.PgIndexType.HNSW)
                        //数据库扩展、表和索引已经交给Flyway管理，禁止Spring AI自动建表
                        .initializeSchema(false)
                        //启动时校验配置的schema和向量表名称是否合法且真实存在
                        .vectorTableValidationsEnabled(true)
                        .vectorTableName(modelProperties.getVectorTableName())
                        //在PostgreSQL默认的public schema中创建向量表
                        .schemaName("public")
                        .build();

                whichModel.put(modelProperties.getCode(), pgVectorStore);
            });

            whichProvider.put(providerCode, Map.copyOf(whichModel));
        });

        return new VectorStoreRegistry(Map.copyOf(whichProvider));
    }

    private EmbeddingModel buildEmbeddingModel(EmbeddingModelProperties.ProviderProperties providerProperties, EmbeddingModelProperties.ModelProperties modelProperties) {
        return OpenAiEmbeddingModel.builder()
                .options(OpenAiEmbeddingOptions.builder()
                        .baseUrl(providerProperties.getBaseUrl())
                        .apiKey(providerProperties.getApiKey())
                        .model(modelProperties.getCode())
                        .build())
                .metadataMode(MetadataMode.NONE) //生成向量时，要不要把Document的metadata一起发给Embedding模型
                .build();
    }

    public static final class VectorStoreRegistry {
        private final Map<String, Map<String, PgVectorStore>> vectorStores;

        private VectorStoreRegistry(Map<String, Map<String, PgVectorStore>> vectorStores) {
            this.vectorStores = vectorStores;
        }

        public PgVectorStore get(String providerCode, String modelCode) {
            Map<String, PgVectorStore> providerStores = vectorStores.get(providerCode);
            if (providerStores == null) {
                throw new BusinessException(ResultCode.PARAMS_ERROR, "不支持的模型提供商" + providerCode);
            }

            PgVectorStore vectorStore = providerStores.get(modelCode);
            if (vectorStore == null) {
                throw new BusinessException(ResultCode.PARAMS_ERROR, "不支持的嵌入模型" + modelCode);
            }

            return vectorStore;
        }
    }
}


