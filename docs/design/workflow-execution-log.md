# Workflow Execution Log

## Purpose

The **Workflow Execution Log** records every action taken during workflow execution. It provides an audit trail for debugging, compliance, and understanding what happened in each run.

## Location

**Always project-specific**: `memory/workflows/<project>/execution-log.md`

| Project | Log File |
|---------|----------|
| orchestration-training | `memory/workflows/orchestration-training/execution-log.md` |
| [any project] | `memory/workflows/<project>/execution-log.md` |

**When running a workflow**: Infer project from workflow path or current directory. Always write to `memory/workflows/<project>/execution-log.md`.

**Walking skeleton validation** (Definition 1): For workflows with HITL gates, the log must show `hitl_reached` (before wait) and `hitl_response` (after user responds) for each gate. A run without these events is invalid—HITL was bypassed. See [walking-skeleton.md](walking-skeleton.md) for full definition.

**Legacy**: `memory/projects/<project>/workflow-execution-log.md` was used previously. All new runs use `memory/workflows/<project>/execution-log.md`.

## Log Format

### Run Header

At workflow start, append:

```markdown
---
## Run: [workflow-name] | [YYYY-MM-DD HH:MM]
**Project**: [project-name]
**Workflow**: [path/to/workflow.yaml]
**Status**: started
---
```

### LOG_ROW_PROTOCOL (per event)

Execute this sequence for each event. Do not batch.

```
LOG_ROW_PROTOCOL:
  1. RUN: date +"%Y-%m-%d %H:%M"  (Windows: Get-Date -Format "yyyy-MM-dd HH:mm")
     — MUST invoke via terminal. No exceptions. The executor uses run_terminal_cmd before each append.
  2. ASSIGN: t = stdout
  3. APPEND: | t | stage | event | task_id | details |
  4. DO NOT reuse t, copy previous timestamp, or manually increment (09:10, 09:11...). These are WORKAROUNDS. Invalid.
  5. Proceed to next event (repeat from step 1 — each event requires a new RUN)
```

**Anti-patterns (NOT PERMITTED)**:
- Copying the previous row's timestamp
- Manually incrementing (e.g., 09:10, 09:11, 09:12 for sequential events)
- Guessing or deriving timestamps without running the command

**Stage**: Task index and name, e.g. `1/4 Create Demo File`, `2/4 Modify File`.

**Event types**:

| Event | When | Details |
|-------|------|---------|
| `workflow_start` | Workflow begins | — |
| `task_start` | Task execution begins | task_id, action, role |
| `action_done` | Action completed | task_id, result summary |
| `hitl_reached` | HITL gate shown | task_id, type, message |
| `hitl_response` | User responded | task_id, response, branch (if any) |
| `adhoc_hitl_reached` | Ad-hoc HITL shown (AI stopped to ask) | task_id, question |
| `adhoc_hitl_response` | User responded to ad-hoc | task_id, response, param_filled |
| `task_complete` | Task finished | task_id, outcome |
| `retry` | Retry triggered | task_id, retry_count |
| `branch` | Branch taken | from_task, to_task, reason |
| `workflow_complete` | Workflow ended | status (success/failed) |

### Run Footer

At workflow end, append:

```markdown
**Status**: complete | failed
**End**: [YYYY-MM-DD HH:MM]
**Deliverables**:
  - [path/to/artifact1]
  - [path/to/artifact2]
---
```

**Deliverables**: List all files or artifacts produced during the run (e.g. `orchestration-training/workflow-engine/artifacts/demo.txt` for minimal-workflow).

## Example Log Entry

```markdown
---
## Run: Minimal Demo Workflow | 2025-02-05 14:30
**Project**: orchestration-training
**Workflow**: orchestration-training/workflow-engine/workflows/minimal-workflow.yaml
**Status**: started
---

| Date/Time | Stage | Event | Task | Details |
|-----------|-------|-------|------|---------|
| 2025-02-05 14:30 | — | workflow_start | — | — |
| 2025-02-05 14:30 | 1/4 Create Demo File | task_start | create_file | action=create_file, role=developer |
| 2025-02-05 14:30 | 1/4 Create Demo File | action_done | create_file | Created demo.txt |
| 2025-02-05 14:30 | 1/4 Create Demo File | hitl_reached | create_file | type=approval |
| 2025-02-05 14:32 | 1/4 Create Demo File | hitl_response | create_file | response=yes, branch=next |
| 2025-02-05 14:32 | 1/4 Create Demo File | task_complete | create_file | outcome=next |
| 2025-02-05 14:32 | 2/4 Modify File | task_start | modify_file | action=modify_file, role=developer |
| 2025-02-05 14:32 | 2/4 Modify File | action_done | modify_file | Appended content |
| 2025-02-05 14:32 | 2/4 Modify File | hitl_reached | modify_file | type=question, options=yes,no |
| 2025-02-05 14:33 | 2/4 Modify File | hitl_response | modify_file | response=yes, branch=next |
| 2025-02-05 14:33 | 2/4 Modify File | task_complete | modify_file | outcome=next |
| 2025-02-05 14:33 | 3/4 Review Work | task_start | review | action=review, role=reviewer |
| 2025-02-05 14:33 | 3/4 Review Work | action_done | review | Reviewed demo.txt |
| 2025-02-05 14:33 | 3/4 Review Work | hitl_reached | review | type=question, options=pass,fail |
| 2025-02-05 14:34 | 3/4 Review Work | hitl_response | review | response=pass, branch=next |
| 2025-02-05 14:34 | 3/4 Review Work | task_complete | review | outcome=complete |
| 2025-02-05 14:34 | 4/4 Workflow Complete | task_start | complete | action=complete |
| 2025-02-05 14:34 | 4/4 Workflow Complete | action_done | complete | Info gate, auto_continue |
| 2025-02-05 14:34 | — | workflow_complete | — | status=success |

**Status**: complete
**End**: 2025-02-05 14:34
**Deliverables**:
  - orchestration-training/workflow-engine/artifacts/demo.txt
---
```

## Who Logs What

| Component | Events to Log |
|-----------|---------------|
| **Workflow Executor** | workflow_start, workflow_complete |
| **Task AI** | task_start, action_done, task_complete, retry, branch |
| **HITL AI** | hitl_reached, hitl_response |

**Single responsibility**: The AI executing the workflow (using workflow-executor rule) performs all logging. It appends to the log file at each step.

## Integration with Component AIs

- **Workflow AI**: When coordinating execution, ensure executor logs workflow_start and workflow_complete
- **Task AI**: When executing tasks, ensure executor logs task_start, action_done, task_complete
- **HITL AI**: When handling gates, ensure executor logs hitl_reached, hitl_response

**Note**: The workflow executor (the AI reading the YAML and executing) is responsible for appending to the log. Component AI rules instruct the executor to log at each intersection.

## Paused Workflows (Resume-Sprint)

When a workflow is paused at a HITL gate (e.g., user closed Cursor), the last run has `Status: started` and no `workflow_complete` event. State is persisted in `memory/projects/<project>/workflow-state.json`. User can say "resume-sprint" to re-enter and continue. See [workflow-state.md](workflow-state.md).

## Querying the Log

**User can ask**:
- "What happened in the last workflow run?"
- "Show me the execution log for minimal-workflow"
- "What did I respond at the review gate?"

**Project AI / Workflow AI**: Read `memory/workflows/<project>/execution-log.md` to answer.

## Related Documentation

- `.cursor/rules/workflow-executor.mdc` - Logging instructions for executor
- [machine-language-convention.md](machine-language-convention.md) - LOG_ROW_PROTOCOL format
- [how-it-works.md](../architecture/how-it-works.md) - Execution flow
- [component-ai-architecture.md](../architecture/component-ai-architecture.md) - Component responsibilities
