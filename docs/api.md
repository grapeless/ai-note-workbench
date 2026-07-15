# API 文档

本文档以当前后端 Controller 的实际映射为准。后端不包含统一的 `/api` 前缀。

## 通用响应

所有接口均返回统一响应结构：

```json
{
  "code": 0,
  "data": null,
  "message": "ok"
}
```

## 集合

### 创建集合

- 方法：`POST`
- 路径：`/collections`
- Content-Type：`application/json`

请求体：

```json
{
  "name": "技术研究",
  "description": "技术文档与研究笔记"
}
```

### 查询集合列表

- 方法：`GET`
- 路径：`/collections/list`

### 查询集合详情

- 方法：`GET`
- 路径：`/collections/{id}`

### 删除集合

- 方法：`DELETE`
- 路径：`/collections/{id}`

## 文档

### 上传文档

- 方法：`POST`
- 路径：`/documents/upload`
- Content-Type：`multipart/form-data`

表单字段：

- `collectionId`：集合 ID，必须为正整数。
- `file`：上传文件，当前支持 PDF、TXT、MD 和 Markdown。

### 查询文档详情

- 方法：`GET`
- 路径：`/documents/{id}`

## 前端直连配置

本地开发时，前端通过 `VITE_API_BASE_URL` 指定后端地址：

```env
VITE_API_BASE_URL=http://localhost:8080
```

前端直接请求完整后端地址，后端通过 CORS 允许 `http://localhost:5173` 访问。
