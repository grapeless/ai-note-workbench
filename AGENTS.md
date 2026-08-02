# AI Note Workbench

AI Note Workbench 是一个面向本地笔记与文档的 AI 知识库工作台。

## 技术栈

- 前端：React、TypeScript、Vite、Tailwind CSS、Shadcn/UI
- 后端：Java、Spring Boot、MyBatis
- 数据与存储：PostgreSQL、pgvector、Redis、本地文件存储

## 项目结构

- `frontend/`：前端应用
- `backend/`：后端应用
- `docs/`：项目文档
- `storage/`：本地存储目录

## 本地开发

- 后端的 Redis 与 PostgreSQL（pgvector）部署在服务器上，其余是本地环境。
- 前端命令在 `frontend/` 目录执行，后端命令在 `backend/` 目录执行。

## 前端代码文件组织规范

AI 在新增、移动或重构文件时，必须遵循以下规范：

1. 自己的 React 组件名称必须使用 PascalCase。组件名称必须以大写字母开头，例如 UserCard、LoginForm、SidebarMenu，禁止使用 userCard、user-card 等名称。
2. 路由页面统一放在 `src/pages/` 下。
   - 每个路由页面必须创建独立文件夹，文件夹名称使用 PascalCase，并与页面组件名称一致；页面入口统一命名为 `index.tsx`。例如：`src/pages/Home/index.tsx`、`src/pages/Login/index.tsx`、`src/pages/NotFound/index.tsx`。
   - 二级及多级路由按父子关系组织。子路由页面放在父级页面目录下；需要对多个子页面分类时，使用小写的 kebab-case 文件夹作为分类目录，实际路由页面仍使用 PascalCase 文件夹，并在其中创建 `index.tsx`。示例结构：`src/pages/Home/sidebar-menu1/Role1/index.tsx`、`src/pages/Home/sidebar-menu1/Role2/index.tsx`。
   - 仅当页面复杂，并且能够识别出两个或以上相对独立的职责边界时，才在页面目录内部拆分文件。可拆分的职责通常应具备独立的数据或状态边界、明确的业务含义、复用价值，或拆分后能显著降低页面理解成本。
3. 路由配置统一放在 `src/router/` 下。路由入口文件为 `src/router/index.tsx`，页面组件中不得重复维护全局路由配置。
4. 状态管理统一放在 `src/store/` 下。Store 文件必须使用 `useXxxStore.ts` 格式命名，导出的 Store Hook 名称必须与文件名一致，例如 `useUserStore.ts` 导出 `useUserStore`。
5. 自定义 Hook 统一放在 `src/hooks/` 下。Hook 文件及导出函数必须以 use 开头，并使用 camelCase，例如 `useAuth.ts`、`useUserInfo.ts`、`useTablePagination.ts`。一个文件原则上只维护一个主要 Hook。
6. 通用组件统一放在 `src/components/` 下。路由页面不得放进 components；仅被某个页面使用的局部组件，可放在该页面目录的 `components/` 子目录中。
7. API 统一放在 `src/api/` 下，数据模型优先使用 interface 定义，只在需要 type 时才使用 type 声明类型，使用函数表达式定义 API。
8. 避免过度拆分文件和过度设计。拆分必须同时满足“当前页面已经具有一定复杂度”和“被拆内容形成了相对独立职责”，不能仅因文件较长、存在一段 JSX 或包含多个 Hook 就拆分。
9. Store 和自定义 Hook 必须按实际职责使用。仅当状态需要跨多个无直接父子关系的组件、跨页面共享，或需要独立持久化与统一管理时，才允许放入 `src/store/`；页面内部状态、表单状态、弹窗状态、筛选条件和分页状态应优先保留在页面或组件内部。仅当一段有状态逻辑需要被多个组件复用，或逻辑复杂到需要与视图分离时，才允许提取为自定义 Hook；禁止为了减少几行代码、包装单个 `useState`/`useEffect`，或仅在一个组件中使用而创建 Hook。
10. 不需要添加无障碍设计或实现

## 异常处理

除非我特殊声明否则不允许做异常校验，抛出异常，校验空值或认为一个值为空等非必要逻辑。

## 一般代码风格/规范
- 变量或函数，除非有被明确的复用可能，或已经被使用了二次以及以上，不然不允许将其独立声明出来
- 