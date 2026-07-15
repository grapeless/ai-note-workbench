# Springdoc Annotation Review Skill

用于为 Spring Boot 项目审查并补全简洁的 Springdoc OpenAPI 注解，覆盖 Controller、接口方法、普通参数、请求体、DTO 和 VO。

默认只使用以下常用注解：

- `@Tag`
- `@Operation`
- `@Parameter` / `@Parameters`
- Springdoc `@RequestBody`
- `@Schema`

风格保持精简：`@Tag` 只生成 `name`，`@Operation` 只生成 `summary`，其他注解通常只生成简短的 `description`。

## 安装到当前仓库

将整个 `springdoc-annotation-review` 目录复制到：

`.agents/skills/springdoc-annotation-review/`

## 安装为个人 Skill

将目录复制到：

`$HOME/.agents/skills/springdoc-annotation-review/`

## 调用示例

`$springdoc-annotation-review 检查当前工作区模块，为 Controller、DTO 和 VO 补全简洁的 Springdoc 注解并运行编译。`

也可以直接说：

`按项目规范补全 Springdoc 注解，只使用常用注解，文案保持简短。`
