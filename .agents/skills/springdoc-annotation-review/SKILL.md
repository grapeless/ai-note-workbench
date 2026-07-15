---
name: springdoc-annotation-review
description: Review, add, and simplify Springdoc OpenAPI annotations for Spring Boot Controllers, request DTOs, response DTOs, and method parameters. Use when asked to 添加 springdoc 注解、补全接口文档、生成 @Tag/@Operation/@Parameter/@Parameters/@RequestBody/@Schema、检查 OpenAPI 注解. Keep documentation concise, use only the allowed common annotations, and never change runtime behavior merely for documentation.
---

# Springdoc Annotation Review

Add the smallest useful set of Springdoc OpenAPI annotations to the current Spring Boot codebase. Preserve API behavior, method signatures, validation rules, and serialization behavior.

## Allowed annotations

Use only these Springdoc/Swagger annotations unless the user explicitly expands the scope:

- `@Tag`
- `@Operation`
- `@Parameter`
- `@Parameters`
- `@io.swagger.v3.oas.annotations.parameters.RequestBody`
- `@Schema`

Do not introduce `@ApiResponse`, `@Content`, `@ArraySchema`, `@SecurityRequirement`, `@Hidden`, callbacks, links, examples, or custom OpenAPI configuration by default.

## Required style

- Controller tags use only `name`: `@Tag(name = "工作区")`.
- Endpoint operations use only `summary`: `@Operation(summary = "创建一个工作区")`.
- `@Parameter` uses a short `description` only unless the repository already requires another property.
- Springdoc `@RequestBody` uses a short `description` only.
- `@Schema` normally uses a short `description` only.
- Keep Chinese text concise, natural, and free of trailing punctuation.
- Prefer domain nouns such as “工作区”, not “工作区管理接口” or “工作区相关接口”.
- Prefer verb-object summaries such as “创建一个工作区”, “查询工作区详情”, “更新工作区”, and “删除工作区”.

## Workflow

1. Inspect the build file and nearby code before editing.
   - Confirm Springdoc is already present or the repository has an established OpenAPI setup.
   - Preserve the existing Springdoc major version and annotation import style.
   - Do not add or upgrade dependencies unless the user requests it or compilation proves the dependency is missing.
   - Do not migrate legacy Swagger 2 annotations automatically unless migration is part of the request.

2. Trace each public HTTP endpoint:
   - Controller class and base route;
   - endpoint method and HTTP mapping;
   - path, query, and header parameters;
   - request DTO;
   - response DTO or VO;
   - nested DTOs used by the public API.

3. Add a concise class-level tag:
   - Add one `@Tag(name = "...")` to each documented Controller.
   - Derive the name from the domain represented by the Controller.
   - Remove suffixes such as `Controller`, “接口”, “相关接口”, and “管理” unless “管理” is truly part of the domain name.
   - Do not add `description` to `@Tag`.

4. Add a concise operation summary:
   - Add one `@Operation(summary = "...")` to each public endpoint method.
   - Derive the summary from the HTTP action and business meaning, not only the Java method name.
   - Do not add `description`, `operationId`, tags, responses, or security fields.
   - Keep the summary short and distinguish endpoints that otherwise look similar.

5. Document simple method parameters:
   - Add `@Parameter(description = "...")` to meaningful `@PathVariable`, `@RequestParam`, and `@RequestHeader` parameters.
   - Prefer annotating the parameter directly.
   - Use method-level `@Parameters` only when the repository already prefers grouped declarations or direct parameter annotation is impractical.
   - Do not document framework-only parameters such as `HttpServletRequest`, `HttpServletResponse`, `Principal`, `Authentication`, `BindingResult`, pagination resolvers, or internal context objects unless the user asks.
   - Do not add `@Parameter` to a JSON body parameter when Springdoc `@RequestBody` is used.

6. Document request bodies carefully:
   - Keep Spring MVC `org.springframework.web.bind.annotation.RequestBody` unchanged.
   - When adding the Springdoc annotation, avoid import collisions by using the fully qualified annotation unless the repository has another established convention:
     `@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "创建工作区参数")`.
   - Add only a short `description`.
   - Do not add inline `content`, schema declarations, examples, or required flags by default.

7. Add schemas to API models:
   - Prefer request DTOs, response DTOs, query objects, and VOs used by documented endpoints.
   - Do not add API documentation annotations to JPA entities by default.
   - Add class-level `@Schema(description = "...")` when the model purpose is useful.
   - Add field or record-component `@Schema(description = "...")` for public API fields.
   - Do not invent examples, allowed values, formats, default values, or required status without evidence.
   - Preserve Jackson, Lombok, validation, persistence, and serialization annotations.

8. Keep documentation trustworthy:
   - Use routes, validation constraints, enum values, tests, database definitions, and existing documentation as evidence.
   - If a field or endpoint meaning is unclear, do not guess. Leave it unchanged and list it under “Needs confirmation”.
   - Do not use documentation annotations to change requiredness, validation, nullability, or runtime behavior.
   - Do not add duplicate annotations that express the same documentation.

9. Verify the change:
   - Remove unused imports and resolve `RequestBody` name collisions.
   - Run the narrowest relevant compile or test command when practical.
   - Check that the application still compiles and the generated OpenAPI document can be produced if an existing test or endpoint is available.

## Output contract

After editing, report:

- files changed;
- Controllers and models documented;
- concise annotation decisions made;
- unclear items left for confirmation;
- build or test commands run and their result.

Keep the implementation focused. Do not rewrite endpoint names, DTO fields, business logic, validation, or response structures just to improve documentation.
