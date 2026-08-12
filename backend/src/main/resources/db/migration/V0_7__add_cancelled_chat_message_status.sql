ALTER TABLE chat_message
    DROP CONSTRAINT chat_message_status_check;

ALTER TABLE chat_message
    ADD CONSTRAINT chat_message_status_check
        CHECK (status IN ('GENERATING', 'COMPLETED', 'CANCELLED', 'FAILED'));
