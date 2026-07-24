# AI Note Workbench

面向本地笔记与文档的 AI 知识库工作台。

## 技术栈

- 前端：React 19.2 + Tailwindcss 4.3 + Shadcn/ui 4.13 + Zustand 5.0 + React Router 7.18 + TypeScript 6.0 + Vite 8.1
- 后端：Java 21 + Spring Boot 4.1
- 存储：PostgreSQL + pgvector、Redis、本地对象存储目录

## 项目结构

```text
ai-note-workbench/
├─ frontend/             # React Web 应用
├─ backend/              # Spring Boot API，已完成初始化
├─ docs/                 # 产品、架构、API、数据库说明文档
├─ storage/              # 本地上传文件与解析产物
└─ docker-compose.yml    # 用于本地开发的 PostgreSQL/pgvector + Redis
```

## 本地开发

启动基础设施：

```bash
docker compose up -d
```

启动前端：

```bash
cd frontend
npm install
npm run dev
```

启动后端：

```bash
cd backend
./mvnw spring-boot:run
```

