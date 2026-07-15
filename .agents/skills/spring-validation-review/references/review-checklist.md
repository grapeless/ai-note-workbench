# Review checklist

## Dependency and namespace

- Validation starter or equivalent implementation exists.
- Imports match the Spring Boot generation: `jakarta.validation` for Boot 3/4, `javax.validation` for Boot 2.
- No mixed `javax` and `jakarta` validation imports remain in the same module.

## DTO

- Required strings use `@NotBlank`, not only `@NotNull`.
- Required wrapper/object fields use `@NotNull`.
- Numeric constraints match whether zero is allowed.
- `BigDecimal` uses decimal-aware bounds where appropriate.
- Limits are evidence-based, not guessed.
- Nested objects and container elements cascade with `@Valid` where needed.
- Error messages are useful and consistent.

## Controller

- Constrained request DTOs are annotated with `@Valid` or the intended `@Validated` group.
- Direct path/query/header parameters have only contract-backed constraints.
- Path variables declared in the route are actually represented by method parameters.
- Default-required path variables do not carry redundant `@NotNull` constraints unless another documented invocation path can supply `null`.
- Missing path segments, missing required request values, type-conversion failures, and Bean Validation failures are classified separately.
- Optional path variables are backed by route patterns that can actually omit the variable.
- Primitive parameters do not carry nullability constraints.
- The Spring Framework version is known before choosing MVC-native or AOP method validation.
- Spring Framework 6.1+ Controllers have no unnecessary class-level `@Validated`; validation groups and deliberate AOP use are documented exceptions.

## Exception handling

- Routing and binding failures have the intended response path when the API promises a unified parameter-error response.
- Invalid object input through `@Valid` has a `MethodArgumentNotValidException` response path.
- Invalid direct parameters have a `HandlerMethodValidationException` response path when MVC-native method validation is used.
- Both paths preserve the repository's parameter-error status, response shape, and useful constraint message.
- Obsolete `ConstraintViolationException` handling is removed only when no AOP-validated boundary still needs it.

## Service/domain

- All callers are inspected before duplicate manual input guards are added or retained.
- A Service that is not an independent boundary does not repeat Controller-guaranteed null, blank, or range checks without a documented reason.
- A Service that is an independent boundary validates its contract consistently rather than partially duplicating input rules.
- Cheap, side-effect-free input checks run before database queries and external calls.
- Database and authorization rules remain explicit business checks.
- Persistence consistency and infrastructure failures remain internal errors rather than client validation errors.
- Method validation is added only when non-HTTP callers need the same preconditions.
- Existing exception conventions are preserved.

## Verification

- Valid request reaches the method.
- A missing required path segment is evaluated as route matching, not assumed to trigger `@NotNull`.
- A malformed scalar value is evaluated as a conversion failure, not assumed to trigger a numeric Bean Validation constraint.
- Invalid DTO produces the expected validation response.
- Invalid direct parameter produces the expected validation response.
- Relevant unit/integration tests pass.
- Uncertain requirements are reported instead of guessed.
