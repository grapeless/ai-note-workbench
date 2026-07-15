# 数据库草案

## 核心表

- `workspaces`：知识库容器。
- `documents`：上传的文件及解析/索引状态。
- `chunks`：文本分块、来源位置、token 计数、元数据。
- `chunk_embeddings`：每个分块对应的向量嵌入。
- `conversations`：聊天会话。
- `messages`：用户、助手和系统消息。
- `tool_calls`：可审计的工具执行记录。
- `index_jobs`：异步解析与嵌入任务。

## 预留表

- `workflows`：可复用的固定流程。
- `mcp_servers`：外部 MCP 服务器配置。
- `eval_cases`：检索与回答质量检查。
