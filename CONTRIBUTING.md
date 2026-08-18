# 参与贡献

感谢你关注 AI Note Workbench。下面是AI写的，AI说最好要有一个这样的文件。
项目仍处于早期开发阶段，欢迎通过 Issue、文档改进和 Pull Request 参与建设。

## 开始之前

- Bug、文档修正和范围明确的小改动可以直接提交 Pull Request。
- 新功能、架构调整、依赖替换或大范围重构，请先创建 Issue 说明动机、目标和可能影响。
- 安全问题不要发布到公开 Issue；在项目补充正式的安全报告渠道前，请通过仓库维护者的 GitHub 主页联系。

## 开发环境

本地环境要求和启动方式请参考 [README 的本地开发章节](README.md#本地开发)。

开始修改前，请确认前端、后端以及 PostgreSQL、Redis 能够在本地正常启动。所有本地密码和 API Key 应放在已被 Git 忽略的 `.env` 或 `application-local.yml` 中。

## 分支与开发流程

`main` 是生产部署分支，推送到 `main` 会触发生产 CI/CD。请从最新的 `main` 创建独立分支，并通过 Pull Request 合并：

```bash
git switch main
git pull --ff-only
git switch -c feature/your-feature
```

推荐使用以下分支前缀：

- `feature/`：新增功能。
- `fix/`：修复缺陷。
- `docs/`：文档调整。
- `refactor/`：不改变外部行为的重构。
- `chore/`：构建、依赖和工程维护。

一个 Pull Request 应尽量只解决一个明确问题。不要混入无关的格式化、重命名或依赖升级。

## 提交信息

项目使用“Gitmoji + 简短中文摘要”的提交格式：

```text
✨ 支持取消正在进行的 AI 对话
🐛 修复引用跳转定位错误
📝 完善本地开发文档
🔧 调整生产环境配置
♻️ 重构文档处理流水线
```

摘要应描述最终产生的变化，避免使用“修改代码”“更新文件”等缺少信息的表述。

## 代码组织

### 前端

- React 组件使用 PascalCase。
- 路由页面放在 `frontend/src/pages/`，路由配置放在 `frontend/src/router/`。
- 通用组件、API、Store 和自定义 Hook 分别放在既有目录中。
- 页面内部状态优先保留在页面或组件中，不为简单逻辑增加 Store 或自定义 Hook。
- 避免只因文件较长而过度拆分组件。

### 后端

- 保持现有 Controller、Service、Mapper、配置和模型职责边界。
- 数据库结构变化应通过新的 Flyway migration 完成，不修改已发布的历史迁移。
- API Key、密码和环境地址不得硬编码到受 Git 管理的配置文件中。
- 不在同一 Pull Request 中进行与目标无关的大范围格式化。

更详细的项目约定可参考 [AGENTS.md](AGENTS.md)。

## 验证要求

只运行与改动范围相关的检查，并在 Pull Request 中说明已经执行的命令和结果。

前端改动：

```bash
cd frontend
npm run lint
npm run build
```

后端改动：

```bash
cd backend
mvn test
```

Compose 或部署配置改动：

```bash
docker compose config --no-interpolate --quiet
```

纯文档修改通常只需检查链接、命令、拼写和 Markdown 渲染，不要求执行完整构建。涉及界面变化时，请在 Pull Request 中附上修改前后的截图。

## Pull Request 清单

提交前请确认：

- 改动范围单一，标题能够说明结果。
- 已解释改动动机、主要实现和潜在影响。
- 已完成与改动范围相关的静态检查、构建或测试。
- 新增配置同步更新了示例文件和相关文档。
- 界面改动附有截图。
- 没有提交 `.env`、`application-local.yml`、日志、运行时数据或任何密钥。
- 没有无意中修改生产部署配置或数据库数据。

## License

向本项目提交贡献，即表示你同意该贡献按照项目的 [MIT License](LICENSE) 进行许可。
