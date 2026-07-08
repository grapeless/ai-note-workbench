# AI Note Workbench

AI knowledge base workbench for local notes and documents.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Java + Spring Boot
- Storage: PostgreSQL + pgvector, Redis, local object storage directory

## Project Layout

```text
ai-note-workbench/
├─ frontend/             # React web app
├─ backend/              # Spring Boot API, already initialized
├─ docs/                 # Product, architecture, API, database notes
├─ storage/              # Local uploaded files and parsed artifacts
└─ docker-compose.yml    # PostgreSQL/pgvector + Redis for local development
```

## Local Development

Start infrastructure:

```bash
docker compose up -d
```

Start frontend:

```bash
cd frontend
npm install
npm run dev
```

Start backend:

```bash
cd backend
./mvnw spring-boot:run
```

On Windows without Maven Wrapper, use your local Maven command:

```bash
mvn spring-boot:run
```
