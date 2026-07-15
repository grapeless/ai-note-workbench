# 架构

## 设计原则

该系统是一个 AI 工作台，而不只是一个 RAG 应用。RAG 能力会以 `knowledge_search` 工具的形式暴露出来，这样后续的 Function Calling、MCP、Agent 编排和工作流执行都可以复用同一套工具边界。

## 分层

```text
前端交互层
  React Web、聊天、文档库、引用卡片、工具调用轨迹面板

后端应用层
  API 网关、用户、文档、会话、任务

AI 编排层
  Agent 编排器、工具注册表、工作流引擎

AI 能力层
  knowledge_search、summarize_document、study_plan、index_rebuild

模型访问层
  LLM 网关、模型供应商适配器、Embedding 供应商

数据与基础设施层
  PostgreSQL、pgvector、Redis、本地文件存储、日志
```

## 后端模块规划

- `auth`: 身份认证和后续权限能力。
- `workspace`: 知识空间和配置。
- `document`: 上传、元数据、解析状态。
- `chunk`: 分块元数据和检索载荷。
- `conversation`: 会话和消息。
- `ai`: 模型网关、向量嵌入、Prompt 组装。
- `tool`: 工具注册表和工具调用日志。
- `agent`: Agent 编排器占位模块。
- `workflow`: 可复用工作流占位模块。

## 第一阶段里程碑

保持部署简单：一个 Spring Boot 服务、一个 React 应用、后端内部的一条 worker 执行路径、带 pgvector 的 PostgreSQL，以及用于异步任务的 Redis。
