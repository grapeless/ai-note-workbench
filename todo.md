# AI Note Workbench 进度

> 更新时间：2026-07-19。新对话开始时先阅读本文件，并结合当前代码和 Git 差异确认实际进度。

## 当前目标

完成“集合 → 上传 → 文档列表 → 文档详情”的真实数据闭环，统一使用 `Collection` 和 `collectionId`。

## 已完成

- [x] 后端新增 `GET /documents/list?collectionId={id}`。
- [x] `DocumentService.listByCollectionId` 校验集合并查询文档。
- [x] `docs/api.md` 已同步文档列表接口。
- [x] 前端通用 Fetch 封装支持 `VITE_API_BASE_URL` 和统一响应处理。
- [x] 已定义 `KnowledgeCollection`、`KnowledgeDocument` 类型。
- [x] 已封装集合列表、文档列表、文档上传和文档详情 API。

## 下一步

- [x] 扩展 `useWorkbenchStore`：管理集合、文档、详情、选择状态及各自的加载/错误状态。
- [x] `CollectionsPanel` 接入真实集合，默认选择第一项，处理加载、空数据、失败和切换状态。
- [x] 将 `DocumentsPanel` 改为真实文档列表，展示标题、类型、上传时间、状态，并过滤真实文档。
- [x] 接入多文件逐个上传，展示等待/上传中/成功/失败，失败文件可重试，成功后刷新列表。
- [x] `DocumentDetailsPanel` 接入文档详情，展示真实元数据和错误信息，不读取正文。
- [x] 清理集合、文档和选择状态相关的模拟数据及旧 `Note` 命名。
- [x] 静态核对字段、空状态、错误状态、异步切换和 Git 差异。

## 实施约定

- 路由页面目录使用 `frontend/src/pages/Workbench/`，不使用旧名称 `WorkbenchPage`。
- API 统一放在 `frontend/src/api/`，不新增页面级 `services` 目录。
- Store 使用 `frontend/src/store/useWorkbenchStore.ts`。
- 上传进度按文件阶段展示；当前 Fetch 封装不提供字节百分比。
- 快速切换集合或文档时，旧请求结果不得覆盖当前选择。
- 按项目约定，不自动执行构建、测试、启动服务或安装依赖。

## 本轮不做

- 新建或删除集合
- 正文解析和 Markdown 渲染
- Embedding、pgvector 检索
- AI 问答接入

## 验收标准

- 页面能显示数据库中的集合。
- 选择集合后能显示该集合的真实文档。
- 上传文件成功后文档列表会刷新，失败文件可以重试。
- 点击文档后能显示真实元数据。
