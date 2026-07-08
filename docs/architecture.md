# Architecture

## Principle

The system is an AI workbench, not only a RAG app. RAG is exposed as a tool named `knowledge_search`, so later Function Calling, MCP, Agent orchestration, and Workflow execution can share the same tool boundary.

## Layers

```text
Frontend Interaction
  React Web, chat, document library, citation cards, tool trace panel

Backend Application
  API gateway, users, documents, conversations, tasks

AI Orchestration
  Agent orchestrator, tool registry, workflow engine

AI Capabilities
  knowledge_search, summarize_document, study_plan, index_rebuild

Model Access
  LLM gateway, provider adapters, embedding provider

Data And Infrastructure
  PostgreSQL, pgvector, Redis, local file storage, logs
```

## Backend Module Plan

- `auth`: identity and future permissions
- `workspace`: knowledge spaces and settings
- `document`: upload, metadata, parse status
- `chunk`: chunk metadata and retrieval payloads
- `conversation`: sessions and messages
- `ai`: model gateway, embeddings, prompt assembly
- `tool`: tool registry and tool call logs
- `agent`: orchestrator placeholder
- `workflow`: reusable workflow placeholder

## First Milestone

Keep deployment simple: one Spring Boot service, one React app, one worker path inside the backend, PostgreSQL with pgvector, Redis for async jobs.
