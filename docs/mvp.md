# MVP Scope

## Goal

Build a local-note knowledge base loop:

1. Upload documents.
2. Parse and chunk content.
3. Create embeddings and vector index.
4. Ask questions.
5. Answer with citations.

## Supported Files

Phase 1 supports Markdown first. PDF and Word are reserved for the parser interface, but not required for the first usable loop.

## Question Flow

The user asks in a chat panel. The backend stores the conversation, searches relevant chunks through `knowledge_search`, asks the model to answer, and returns source citations.

## Citation Rules

Every answer should include references to document title, chunk position, and source path when available. If retrieval confidence is low, the answer should say that the current knowledge base does not have enough evidence.

## Index Failure Handling

Failed uploads or indexing jobs should be visible in the document list with a retry action. The chat experience should not use documents whose latest index status is failed or pending.

## Out Of Scope For MVP

- Multi-user permissions
- Full Agent autonomy
- MCP server hosting
- Complex workflow editor
- Fine-grained eval dashboard
