package com.lim.noteworkbench.rag;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class VectorStoreRegistry {
    private final Map<String, Map<String, PgVectorStore>> vectorStores;

    public VectorStoreRegistry(@Qualifier("pgVectorStores") Map<String, Map<String, PgVectorStore>> vectorStores) {
        this.vectorStores = vectorStores;
    }

    public PgVectorStore get(String providerCode, String modelCode) {
        if (providerCode == null || providerCode.isBlank()) {
            throw new IllegalArgumentException("providerCode must not be blank");}

        if (modelCode == null || modelCode.isBlank()) {
            throw new IllegalArgumentException("modelCode must not be blank");
        }

        Map<String, PgVectorStore> providerStores = vectorStores.get(providerCode);
        if (providerStores == null) {
            throw new BusinessException(ResultCode.PARAMS_ERROR, "Unsupported providerCode: " + providerCode);
        }

        PgVectorStore vectorStore = providerStores.get(modelCode);
        if (vectorStore == null) {
            throw new BusinessException(ResultCode.PARAMS_ERROR,
                    "Vector store not found, providerCode=%s, modelCode=%s".formatted(providerCode, modelCode));
        }

        return vectorStore;
    }

}
