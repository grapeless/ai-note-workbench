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

- 后端的redis与postgres(pgvetor)部署在服务器上，其余是本地环境。
- 前端命令在 `frontend/` 目录执行，后端命令在 `backend/` 目录执行。

## 验证与重操作

- 每次代码或文档更改后，无需自动执行编译、打包、测试、代码生成、启动服务、构建容器、安装或下载依赖等耗时操作。
- 默认仅进行与本次修改直接相关的静态检查、差异检查和必要的文件内容核对。
- 仅在用户明确要求时执行上述重操作；如果 AI 认为确有必要，应先说明原因并征得用户同意。
- 不要在连续的小修改之间重复验证；需要验证时，应在修改完成后集中执行用户指定的检查。

## 前端目录与命名规则

AI 在新增、移动或重构文件时，必须遵循以下规范：
1. 自己的React 组件名称必须使用 PascalCase。 组件名称必须以大写字母开头，例如 UserCard、LoginForm、SidebarMenu，禁止使用 userCard、user-card 等名称。
2. 路由页面统一放在 src/pages/ 下。
    - 每个路由页面必须创建独立文件夹，文件夹名称使用 PascalCase，并与页面组件名称一致；页面入口统一命名为 index.tsx。 例如：src/pages/Home/index.tsx、src/pages/Login/index.tsx、src/pages/NotFound/index.tsx。
    - 二级及多级路由按父子关系组织。 子路由页面放在父级页面目录下；需要对多个子页面分类时，使用小写的 kebab-case 文件夹作为分类目录，实际路由页面仍使用 PascalCase 文件夹，并在其中创建 index.tsx。 示例结构：src/pages/Home/sidebar-menu1/Role1/index.tsx、src/pages/Home/sidebar-menu1/Role2/index.tsx。
    - 分类目录只负责组织文件，名称使用小写字母和连字符，例如 user-management、system-setting；不要使用 UserManagement、userManagement 或下划线命名。
    - 当一级路由页面较复杂时，必须在该页面目录内部进行拆分。index.tsx 仅作为路由页面入口，负责组合子组件，不应包含大量业务逻辑或超长 JSX。 页面内部拆出的组件不能放进 pages 下伪装成新的路由页面。
3. 路由配置统一放在 src/router/ 下。 路由入口文件为 src/router/index.tsx，页面组件中不得重复维护全局路由配置。
4. 状态管理统一放在 src/store/ 下。 Store 文件必须使用 useXxxStore.ts 格式命名，导出的 Store Hook 名称必须与文件名一致，例如 useUserStore.ts 导出 useUserStore。
5. 自定义 Hook 统一放在 src/hooks/ 下。 Hook 文件及导出函数必须以 use 开头，并使用 camelCase，例如 useAuth.ts、useUserInfo.ts、useTablePagination.ts。一个文件原则上只维护一个主要 Hook。
6. 通用组件统一放在 src/components/ 下。 路由页面不得放进 components；仅被某个页面使用的局部组件，可放在该页面目录的 components/ 子目录中。
7. API 统一放在 src/api/ 下，数据模型优先使用interface定义，只用需要type时才使用type声明类型，使用函数表达式定义api。
