ALTER TABLE knowledge_document
    RENAME COLUMN content_type TO document_type;

UPDATE knowledge_document
SET document_type = CASE document_type
                        WHEN 'application/pdf' THEN 'PDF'
                        WHEN 'text/plain' THEN 'TEXT'
                        WHEN 'text/markdown' THEN 'MARKDOWN'
                        ELSE 'UNKNOWN'
    END;

ALTER TABLE knowledge_document
    ADD CONSTRAINT knowledge_document_type_check
        CHECK (document_type IN ('PDF', 'TEXT', 'MARKDOWN', 'UNKNOWN'));
