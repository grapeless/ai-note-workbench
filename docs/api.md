# API Draft

## Documents

- `POST /api/documents`: upload a document.
- `GET /api/documents`: list documents and index status.
- `GET /api/documents/{id}`: get document detail.
- `POST /api/documents/{id}/reindex`: rebuild chunks and embeddings.

## Conversations

- `POST /api/conversations`: create a chat session.
- `GET /api/conversations`: list chat sessions.
- `GET /api/conversations/{id}/messages`: list messages.
- `POST /api/conversations/{id}/messages`: ask a question.

## Tools

- `GET /api/tools`: list registered tools.
- `GET /api/tool-calls`: inspect recent tool execution logs.

## Health

- `GET /api/health`: backend health check.
