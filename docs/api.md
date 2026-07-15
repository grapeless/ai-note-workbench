# API 草案

## 文档

- `POST /api/documents`: 上传文档。
- `GET /api/documents`: 获取文档列表及索引状态。
- `GET /api/documents/{id}`: 获取文档详情。
- `POST /api/documents/{id}/reindex`: 重新构建分块和向量嵌入。

## 会话

- `POST /api/conversations`: 创建聊天会话。
- `GET /api/conversations`: 获取聊天会话列表。
- `GET /api/conversations/{id}/messages`: 获取消息列表。
- `POST /api/conversations/{id}/messages`: 提问。

## 工具

- `GET /api/tools`: 获取已注册工具列表。
- `GET /api/tool-calls`: 查看最近的工具执行日志。

## 健康检查

- `GET /api/health`: 后端健康检查。
