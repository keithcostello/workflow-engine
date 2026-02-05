# Machine Language Convention for AI Instructions

## Purpose

Machine language is a structured, procedural format for AI instructions. It reduces ambiguity and interpretation errors by using explicit verbs, one action per step, and no implied behavior.

## When to Use

- **Use machine language** when the instruction is procedural, must be executed step-by-step, or has common failure modes (e.g., reusing a value instead of recalculating).
- **Use prose** when explaining concepts, context, or "why" rather than "how."

## Syntax

| Keyword | Meaning | Example |
|---------|---------|---------|
| `RUN:` | Execute command via terminal; capture output. NOT "simulate" or "increment"—actual invocation required. | `RUN: date +"%Y-%m-%d %H:%M"` |
| `ASSIGN:` | Set variable | `ASSIGN: t = stdout` |
| `APPEND:` | Write content to file | `APPEND: one row to log file` |
| `IF` | Conditional | `IF status == "paused": load state` |
| `DO NOT` | Explicit prohibition | `DO NOT reuse t for next row` |
| `REPEAT` | Loop (with exit condition) | `REPEAT: steps 1-4 until complete` |

## Principles

1. **One instruction per line** — No compound steps.
2. **No implied steps** — Every action is explicit.
3. **Explicit "do not"** — State common mistakes to avoid.
4. **Copy-pasteable commands** — Commands should work as written (e.g., `date +"%Y-%m-%d %H:%M"`).

## Example: LOG_ROW_PROTOCOL

From [workflow-execution-log.md](workflow-execution-log.md):

```
LOG_ROW_PROTOCOL:
  1. RUN: date +"%Y-%m-%d %H:%M"  (Windows: Get-Date -Format "yyyy-MM-dd HH:mm")
  2. ASSIGN: t = stdout
  3. APPEND: | t | stage | event | task_id | details |
  4. DO NOT reuse t for next row
  5. Proceed to next event (repeat from step 1)
```

This protocol fixes the timestamp reuse bug: step 4 explicitly forbids reusing `t`, copying, or manually incrementing. Step 5 forces a return to step 1 (and thus a fresh terminal `RUN`) for each event. **RUN means actual terminal invocation**—not simulation, not increment.

## Related

- [workflow-execution-log.md](workflow-execution-log.md) — LOG_ROW_PROTOCOL
- [workflow-executor.mdc](../../.cursor/rules/workflow-executor.mdc) — References LOG_ROW_PROTOCOL
