CREATE TABLE chat_citation
(
    assistant_message_id UUID      NOT NULL
        REFERENCES chat_message (id) ON DELETE CASCADE,
    citation_id          TEXT      NOT NULL,
    document_id          BIGINT    NOT NULL,
    document_version     TIMESTAMP NOT NULL,
    document_title       TEXT      NOT NULL,
    document_type        TEXT      NOT NULL,
    source_locator       TEXT,
    page_number          INTEGER,
    quote                TEXT      NOT NULL,
    create_time          TIMESTAMP NOT NULL DEFAULT now(),

    PRIMARY KEY (assistant_message_id, citation_id)
);