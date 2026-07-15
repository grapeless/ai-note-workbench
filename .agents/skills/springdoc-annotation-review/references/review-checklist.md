# Review checklist

## Project setup

- Springdoc or Swagger v3 annotations are already available.
- Existing dependency versions and imports are preserved.
- Legacy Swagger 2 annotations are not silently mixed with Swagger v3 annotations.

## Controller

- Each public Controller has one concise `@Tag(name = "...")`.
- `@Tag` contains no generated `description`.
- Each public endpoint has one concise `@Operation(summary = "...")`.
- `@Operation` contains no generated `description`, response list, tags, or operation ID.
- Path, query, and header parameters use short `@Parameter` descriptions when useful.
- Framework-only parameters are left undocumented.

## Request body

- Spring MVC `@RequestBody` behavior is unchanged.
- Springdoc `@RequestBody` uses only a short description.
- The two `RequestBody` annotations do not create an import collision.
- Body parameters are not redundantly documented with `@Parameter`.

## Models

- Public request DTOs, response DTOs, query objects, and VOs use concise `@Schema` descriptions where useful.
- Entity classes are not annotated by default.
- Existing validation and Jackson annotations are preserved.
- Examples, formats, allowed values, requiredness, and limits are not guessed.

## Quality

- Chinese wording is short and consistent.
- No duplicate or contradictory annotations were added.
- No endpoint behavior, field name, type, or serialization rule changed.
- Unclear meanings are reported instead of invented.
- Imports compile, especially the two different `RequestBody` annotations.
- Relevant compile or test command passes.
