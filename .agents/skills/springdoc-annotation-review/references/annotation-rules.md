# Springdoc annotation rules

## Import map

| Purpose | Import |
|---|---|
| Controller grouping | `io.swagger.v3.oas.annotations.tags.Tag` |
| Endpoint summary | `io.swagger.v3.oas.annotations.Operation` |
| Simple parameter | `io.swagger.v3.oas.annotations.Parameter` |
| Grouped parameters | `io.swagger.v3.oas.annotations.Parameters` |
| API request body | `io.swagger.v3.oas.annotations.parameters.RequestBody` |
| DTO or field schema | `io.swagger.v3.oas.annotations.media.Schema` |

Springdoc `RequestBody` and Spring MVC `org.springframework.web.bind.annotation.RequestBody` have the same simple class name. Prefer keeping the Spring MVC import and writing the Springdoc annotation with its fully qualified name.

## Placement rules

| Code location | Preferred annotation | Minimal form |
|---|---|---|
| Controller class | `@Tag` | `@Tag(name = "工作区")` |
| Endpoint method | `@Operation` | `@Operation(summary = "创建一个工作区")` |
| Path/query/header parameter | `@Parameter` | `@Parameter(description = "工作区 ID")` |
| Multiple method-level parameters | `@Parameters` | Container of concise `@Parameter` declarations |
| JSON body parameter | Springdoc `@RequestBody` | `description` only |
| Request/response DTO class | `@Schema` | `description` only |
| DTO field or record component | `@Schema` | `description` only |

## Naming rules

### Tag names

Use a short domain noun:

- `WorkspaceController` → `工作区`
- `CouponController` → `优惠券`
- `UserController` → `用户`

Avoid names such as “工作区相关接口”, “工作区管理接口”, or a copied Java class name.

### Operation summaries

Prefer short verb-object phrases:

- POST collection → `创建一个工作区`
- GET item → `查询工作区详情`
- GET collection → `查询工作区列表`
- GET page → `分页查询工作区`
- PUT/PATCH item → `更新工作区`
- DELETE item → `删除工作区`
- state action → `启用工作区`, `停用工作区`

Do not end summaries with punctuation. Do not copy low-information method names such as `query`, `handle`, or `execute` without interpreting the endpoint.

### Parameter descriptions

Use the business noun plus identifier or meaning:

- `id` → `工作区 ID`
- `pageNo` → `页码`
- `pageSize` → `每页数量`
- `status` → `工作区状态`

Do not add `required`, `example`, `schema`, or `allowEmptyValue` merely because the annotation supports them.

### Schema descriptions

Use short noun phrases:

- class: `工作区创建参数`
- class: `工作区详情`
- field `name`: `工作区名称`
- field `createdAt`: `创建时间`

Do not infer examples, maximum lengths, enum meanings, or requiredness from field names alone.

## Request body example

Keep the Spring MVC annotation unchanged and avoid the import collision:

```java
@Operation(summary = "创建一个工作区")
@PostMapping
public void create(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "创建工作区参数")
        @org.springframework.web.bind.annotation.RequestBody WorkspaceCreateDTO dto) {
    // existing code
}
```

When the Spring MVC `RequestBody` is already imported, keep that import and use the fully qualified Springdoc annotation only.

## Exclusions

Do not add annotations to:

- private helper methods;
- Service, Repository, Mapper, or domain methods that are not HTTP endpoints;
- JPA entities by default;
- framework-only parameters;
- fields excluded from JSON with `@JsonIgnore` unless they are deliberately part of the documented contract.

Do not introduce response documentation, security documentation, examples, callbacks, or custom OpenAPI configuration unless the user explicitly asks.
