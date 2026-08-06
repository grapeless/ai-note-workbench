-- 会话表
CREATE TABLE chat_conversation
(
    id            UUID PRIMARY KEY,
    collection_id BIGINT    NOT NULL REFERENCES knowledge_collection (id) ON DELETE CASCADE,
    title         TEXT      NOT NULL,
    create_time   TIMESTAMP NOT NULL DEFAULT now(),
    update_time   TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_conversation_collection_update_time
    ON chat_conversation (collection_id, update_time DESC);

-- 消息表
CREATE TABLE chat_message
(
    id                UUID PRIMARY KEY,
    conversation_id   UUID      NOT NULL REFERENCES chat_conversation (id) ON DELETE CASCADE,
    sequence_id       BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE,
    role              TEXT      NOT NULL,
    content           TEXT      NOT NULL DEFAULT '',
    reasoning_content TEXT,
    provider_code     TEXT,
    model_code        TEXT,
    mode              TEXT,
    status            TEXT      NOT NULL,
    create_time       TIMESTAMP NOT NULL DEFAULT now(),
    update_time       TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT chat_message_role_check
        CHECK (role IN ('USER', 'ASSISTANT')),
    CONSTRAINT chat_message_mode_check
        CHECK (mode IS NULL OR mode IN ('PLAIN', 'RAG', 'AUTO')),
    CONSTRAINT chat_message_status_check
        CHECK (status IN ('GENERATING', 'COMPLETED', 'FAILED'))
);

CREATE INDEX idx_chat_message_conversation_sequence
    ON chat_message (conversation_id, sequence_id);
