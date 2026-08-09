ALTER TABLE knowledge_document
    DROP CONSTRAINT knowledge_document_type_check;

UPDATE knowledge_document
SET document_type = 'PLAIN_TEXT'
WHERE document_type = 'TEXT';

ALTER TABLE knowledge_document
    ADD CONSTRAINT knowledge_document_type_check
        CHECK (document_type IN ('PDF', 'PLAIN_TEXT', 'MARKDOWN'));