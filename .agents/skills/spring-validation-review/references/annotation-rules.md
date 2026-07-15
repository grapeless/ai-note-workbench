# Annotation selection rules

Use repository documentation, OpenAPI/schema definitions, database migrations, existing tests, and nearby code as evidence. Field names alone are weak evidence.

| Intent | Preferred annotation | Notes |
|---|---|---|
| Required text | `@NotBlank` | Rejects `null`, empty, and whitespace-only text. Add `@Size` only when a real limit is known. |
| Required scalar/object | `@NotNull` | Common for wrapper numbers, enums, booleans, dates, and nested objects. |
| Required collection/string not empty | `@NotEmpty` | Use when empty is invalid. For text, usually prefer `@NotBlank`. |
| Positive number | `@Positive` | Use only when zero is invalid. |
| Non-negative number | `@PositiveOrZero` | Useful for quantities or money where zero is allowed. |
| Integer bounds | `@Min` / `@Max` | Do not use for decimal precision rules. |
| Decimal bounds | `@DecimalMin` / `@DecimalMax` | Prefer for `BigDecimal`; set `inclusive` deliberately. |
| Text/collection size | `@Size` | Derive limits from an explicit contract, schema, or test. |
| Email | `@Email` | Add `@NotBlank` separately when required. |
| Pattern | `@Pattern` | Use only with a stable, documented format. Avoid fragile “universal” phone/ID regexes. |
| Past/future instant | `@Past`, `@PastOrPresent`, `@Future`, `@FutureOrPresent` | Use only when the rule is independent of another field. |
| Nested object | `@Valid` | Add `@NotNull` as well when absence is invalid. |
| Collection elements | `List<@Valid ItemDTO>` or `List<@NotBlank String>` | Container element constraints are preferable to manual loops. |
| Boolean must be true | `@AssertTrue` | Suitable for explicit consent/acceptance flags, not general boolean requirements. |

## Type cautions

- Primitive fields such as `int` cannot distinguish “missing” from zero after binding. Prefer wrapper types in request DTOs when absence must be detected.
- `@NotNull` does not reject an empty string or empty collection.
- `@Valid` does not imply `@NotNull`.
- `@Email` does not imply the value is required.
- Cross-field rules such as `startTime < endTime` are not reliably expressed by field annotations. Keep them in domain logic or create a class-level custom constraint only when the rule is stable and reused.
- Validation annotations do not replace authorization, database constraints, transactions, or concurrency control.

## Controller guidance

- `@RequestBody @Valid CreateCouponRequest request`: validate fields inside the DTO.
- `@PathVariable @Positive Long id`: validate a direct method parameter when the API contract requires a positive ID.
- On Spring Framework 6.1+, do not add class-level `@Validated` to a Controller solely for DTO or direct parameter validation. Remove it to use MVC-native method validation unless validation groups or deliberate AOP validation require it.
- `@Valid` object validation normally raises `MethodArgumentNotValidException`; direct method constraints trigger `HandlerMethodValidationException` and supersede object-only validation for that method.
- Keep centralized parameter-error responses consistent across both MVC validation exceptions.
- When groups are already part of the design, use `@Validated(Create.class)` or `@Validated(Update.class)` at the parameter/boundary selected by the repository conventions.

## Routing and binding reachability

Apply Bean Validation only to states that can survive Spring MVC routing and binding:

- A default `@PathVariable` is required. For `@GetMapping("/{id}")`, a request without the path segment normally does not match the endpoint, so `@NotNull Long id` cannot report “ID cannot be null”. Remove the redundant `@NotNull`; retain `@Positive`, `@Min`, or other constraints that validate a bound value.
- A malformed path value such as `/documents/abc` for `Long id` fails type conversion before Bean Validation. Handle the MVC type-mismatch path if the API needs a unified parameter-error response.
- `@PathVariable(required = false)` can make `null` reachable only when the route mappings also allow the variable to be absent. Inspect every mapping pattern before deciding whether `@NotNull` is meaningful.
- Missing default-required `@RequestParam`, `@RequestHeader`, and `@RequestPart` values are normally rejected by their argument resolvers before Bean Validation. Do not duplicate required binding with `@NotNull` merely to customize a message; configure or handle the binding exception instead.
- A default-required `@RequestBody` with no body is rejected during request-body resolution. Use `@Valid` for DTO fields; add parameter-level `@NotNull` only when `null` can actually reach validation under the endpoint's binding configuration.
- Primitive parameters can never be `null`; never add `@NotNull` to them.
- Keep a seemingly redundant constraint only when another real invocation path, such as deliberate AOP method validation outside MVC, can supply the otherwise unreachable value. Document that reason.

For a required numeric path variable, prefer:

```java
public Result<Document> getById(
        @PathVariable
        @Positive(message = "文档ID必须为正数") Long id) {
    // ...
}
```

## Service guidance

Use annotations for stable method preconditions only when the Service is a real external boundary inside the application. Inspect every caller before retaining manual input guards already guaranteed by one validated HTTP boundary. If non-HTTP callers exist, validate the Service contract consistently rather than duplicating only selected constraints.

Run cheap input checks before database or external operations. Keep checks such as “coupon exists”, “status allows issue”, “stock is sufficient”, and “user owns resource” as explicit business logic. Treat impossible mutation counts, missing generated IDs, and missing post-write records as internal consistency failures, not client validation errors.
