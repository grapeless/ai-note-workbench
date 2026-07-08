# Database Draft

## Core Tables

- `workspaces`: knowledge base containers.
- `documents`: uploaded files and parse/index status.
- `chunks`: text chunks, source locations, token count, metadata.
- `chunk_embeddings`: vector embedding per chunk.
- `conversations`: chat sessions.
- `messages`: user, assistant, and system messages.
- `tool_calls`: auditable tool execution records.
- `index_jobs`: async parse and embedding jobs.

## Reserved Tables

- `workflows`: reusable fixed processes.
- `mcp_servers`: external MCP server configuration.
- `eval_cases`: retrieval and answer quality checks.
