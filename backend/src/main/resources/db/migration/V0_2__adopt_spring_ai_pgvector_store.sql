DROP TABLE chunk_embedding;

-- 给collection新增了两个字段用于记录使用的嵌入模型信息
ALTER TABLE knowledge_collection
    ADD COLUMN embedding_provider TEXT,
    ADD COLUMN embedding_model    TEXT;

-- 重命名了两个主表，方便与框架区分
ALTER TABLE document
    RENAME TO knowledge_document;

ALTER TABLE chunk
    RENAME TO knowledge_chunk;

-- 移除了原chunk表的两个字段，这两个字段将交给框架生成向量表管理
ALTER TABLE knowledge_chunk
    DROP COLUMN content,
    DROP COLUMN metadata;

-- 重命名了原chunk表的两个字段，方便与框架区分和理解
ALTER TABLE knowledge_chunk
    RENAME COLUMN document_id TO knowledge_document_id;

ALTER TABLE knowledge_chunk
    RENAME COLUMN chunk_index TO chunk_order;

-- 后面是一些级联更新（重命名），不用看
ALTER TABLE knowledge_document
    RENAME CONSTRAINT document_pkey TO knowledge_document_pkey;

ALTER TABLE knowledge_document
    RENAME CONSTRAINT document_collection_id_fkey TO knowledge_document_collection_id_fkey;

ALTER TABLE knowledge_document
    RENAME CONSTRAINT document_status_check TO knowledge_document_status_check;

ALTER TABLE knowledge_chunk
    RENAME CONSTRAINT chunk_pkey TO knowledge_chunk_pkey;

ALTER TABLE knowledge_chunk
    RENAME CONSTRAINT chunk_document_id_fkey TO knowledge_chunk_knowledge_document_id_fkey;

ALTER TABLE knowledge_chunk
    RENAME CONSTRAINT chunk_document_id_chunk_index_key
        TO knowledge_chunk_knowledge_document_id_chunk_order_key;

ALTER INDEX idx_document_collection_id
    RENAME TO idx_knowledge_document_collection_id;

ALTER INDEX idx_chunk_document_id
    RENAME TO idx_knowledge_chunk_knowledge_document_id;

ALTER SEQUENCE document_id_seq
    RENAME TO knowledge_document_id_seq;

ALTER SEQUENCE chunk_id_seq
    RENAME TO knowledge_chunk_id_seq;



-- BAAI/bge-m3 生成的向量表
CREATE TABLE vector_store_siliconflow_bge_m3
(
    id        BIGINT PRIMARY KEY REFERENCES knowledge_chunk (id) ON DELETE CASCADE,
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
    id        BIGINT PRIMARY KEY REFERENCES knowledge_chunk (id) ON DELETE CASCADE,
    content   TEXT         NOT NULL,
    metadata  JSONB        NOT NULL DEFAULT '{}'::jsonb,
    embedding vector(1024) NOT NULL
);

CREATE INDEX idx_vector_store_dashscope_qwen37_embedding
    ON vector_store_dashscope_qwen37
        USING hnsw (embedding vector_cosine_ops);
