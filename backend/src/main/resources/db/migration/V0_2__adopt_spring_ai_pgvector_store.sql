DROP TABLE chunk_embedding;

ALTER TABLE knowledge_collection
    ADD COLUMN embedding_provider TEXT,
    ADD COLUMN embedding_model    TEXT;

-- BAAI/bge-m3 生成的向量表
CREATE TABLE vector_store_siliconflow_bge_m3
(
    id        BIGINT PRIMARY KEY REFERENCES chunk (id) ON DELETE CASCADE,
    content   TEXT         NOT NULL,
    metadata  JSONB        NOT NULL DEFAULT '{}'::jsonb,
    embedding vector(1024) NOT NULL
);

CREATE INDEX idx_vector_store_siliconflow_bge_m3_embedding
    ON vector_store_siliconflow_bge_m3
        USING hnsw (embedding vector_cosine_ops);

-- qwen3.7-text-embedding 生成的向量表
CREATE TABLE vector_store_dashscope_qwen37
(
    id        BIGINT PRIMARY KEY REFERENCES chunk (id) ON DELETE CASCADE,
    content   TEXT         NOT NULL,
    metadata  JSONB        NOT NULL DEFAULT '{}'::jsonb,
    embedding vector(1024) NOT NULL
);

CREATE INDEX idx_vector_store_dashscope_qwen37_embedding
    ON vector_store_dashscope_qwen37
        USING hnsw (embedding vector_cosine_ops);
