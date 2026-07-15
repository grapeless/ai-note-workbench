---
name: spring-validation-review
description: Review, add, and fix Spring Boot Bean Validation for Java DTOs, Controller parameters, nested request objects, Service method boundaries, and validation exception handling. Use when asked to 补全校验、添加校验注解、检查 @Valid/@Validated、审查请求参数、识别不会触发或重复绑定规则的校验、处理 MethodArgumentNotValidException/HandlerMethodValidationException、修复 jakarta.validation or javax.validation usage. Keep basic input validation separate from database-dependent business rules; do not add constraints to JPA entities by default.
---

# Spring Validation Review

Apply the smallest correct validation change for the current repository. Preserve existing API behavior unless the user explicitly requests a contract change.

## Workflow

1. Inspect the relevant `pom.xml`, `build.gradle`, or version catalog before editing.
   - Spring Boot 3 or 4: use `jakarta.validation.*`.
   - Spring Boot 2: preserve `javax.validation.*` unless migration is requested.
   - Determine the actual Spring Framework version before deciding whether Controller method validation is MVC-native or AOP-based. Spring Framework 6.1+ has built-in MVC method validation.
   - Confirm a validation implementation is available, normally `spring-boot-starter-validation`. Do not add or upgrade dependencies without explaining why.

2. Trace the request path before adding annotations:
   - request DTO or record;
   - Controller method and binding annotation;
   - nested DTOs;
   - every caller of the Service method and existing business checks;
   - global exception handling and tests.

3. Classify every rule:
   - **Structural/input rule:** nullability, blank text, length, format, numeric range, collection size, simple date direction. Prefer Bean Validation annotations.
   - **Business rule:** database existence, uniqueness, permission, ownership, stock, budget, state transition, cross-aggregate consistency. Keep it in Service/domain logic.
   - **Uncertain rule:** do not invent it. Preserve the code and list it under “Needs confirmation”.

4. Add constraints conservatively using `references/annotation-rules.md`.
   - Never invent arbitrary maximum lengths or ranges from field names alone.
   - Add a Chinese `message` consistent with the repository style.
   - Avoid duplicate annotations that express the same condition.
   - Check routing, required binding, type conversion, and default-value behavior before adding a constraint. Remove constraints whose invalid state cannot reach Bean Validation through the actual HTTP mapping.
   - Keep imports minimal and remove obsolete imports.

5. Wire validation at the correct boundary:
   - Add `@Valid` to a Controller `@RequestBody` DTO when that DTO contains constraints.
   - Add `@Valid` to nested object, collection, array, map value, or `Optional` elements when cascading is required.
   - Combine `@NotNull` and `@Valid` when the nested object itself is required.
   - Add direct constraints to `@PathVariable`, `@RequestParam`, or `@RequestHeader` only when the contract is clear.
   - Do not add `@NotNull` to a default required `@PathVariable`: a missing path segment normally does not match the route, so the method and Bean Validation are never reached. Keep value constraints such as `@Positive` when they validate successfully bound values.
   - Treat optional mappings deliberately. `@PathVariable(required = false)`, multiple route patterns, or non-HTTP/AOP invocation can make `null` reachable and may justify `@NotNull` or a different API design.
   - On Spring Framework 6.1+, prefer MVC-native method validation for annotated Controllers. Remove class-level `@Validated` unless validation groups or deliberate AOP method validation require it.
   - Keep `@Valid` on constrained body DTOs after removing class-level `@Validated`; direct parameter constraints such as `@Positive` trigger MVC method validation without it.
   - Use `@Validated(Group.class)` only when the repository intentionally uses validation groups, and preserve the selected validation path consistently.

6. Preserve validation error handling:
   - Distinguish routing failures, missing required values, and type-conversion failures from Bean Validation failures; they may raise different Spring MVC exceptions or fail to match an endpoint at all.
   - `@Valid` object validation normally raises `MethodArgumentNotValidException` when method validation is not otherwise required.
   - Direct parameter or return-value constraints trigger MVC method validation and raise `HandlerMethodValidationException`; this path also covers nested constraints reached through `@Valid` on that method.
   - When a global exception handler exists, verify that it handles both exception types with the repository's parameter-error response contract.
   - If removing Controller-level `@Validated`, check for obsolete `ConstraintViolationException` handling from the prior AOP path. Preserve it only when other AOP-validated boundaries still use it.
   - Do not introduce a global exception handler solely for consistency unless the repository design requires one or the user requests it; otherwise report the gap.

7. Handle Service validation intentionally:
   - Prefer manual/domain checks for business rules.
   - Use Service-level `@Validated` only when public methods declare Bean Validation constraints and callers may bypass HTTP boundaries.
   - Inspect all callers before retaining manual null, blank, or range guards. If every call passes through the same validated Controller boundary, remove duplicate guards unless a documented defensive boundary requires them.
   - If the Service is a real independent boundary, validate its preconditions consistently rather than retaining only a partial duplicate such as null checks without the corresponding range rules.
   - Run cheap, side-effect-free input checks before database queries, file writes, or external calls.
   - Keep database existence, authorization, and state-transition failures as business exceptions. Keep impossible persistence results and infrastructure failures as internal errors rather than relabeling them as client validation failures.

8. Protect persistence models:
   - Prefer request DTO validation over adding API-specific constraints to JPA entities.
   - Add constraints to entities only when they represent genuine domain invariants or the user explicitly requests it.

9. Verify the change:
   - Run the narrowest relevant tests, then the project compile/test command when practical.
   - For each changed endpoint, consider one valid request and one invalid request.
   - Test invalid DTO input and invalid direct method parameters separately because they may raise different exception types.
   - Do not silently fix unrelated defects; report them separately.

## Output contract

After editing, report:

- files changed and the validation added;
- assumptions made;
- rules left for Service/domain logic;
- validation exception paths reviewed;
- unreachable or binding-redundant constraints removed;
- items needing confirmation;
- tests or build commands run and their result.

Keep the implementation focused. Do not add a custom constraint, validation group, or global exception handler unless the existing design requires it or the user asks for it.
