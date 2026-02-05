# Workflow State (Resume-Sprint)

## Purpose

Persist workflow execution state when paused at a HITL gate so that when Cursor is closed and reopened, the user can re-enter and continue the workflow via "resume-sprint".

## Location

| Context | State File |
|---------|------------|
| Project context | `memory/projects/<project>/workflow-state.json` |
| orchestration-training | `memory/projects/orchestration-training/workflow-state.json` |

The state file lives in project memory so it survives Cursor restart and is project-scoped.

## Schema

```json
{
  "status": "paused",
  "workflow_path": "orchestration-training/workflow-engine/workflows/minimal-workflow.yaml",
  "project": "orchestration-training",
  "current_task_index": 1,
  "retry_counts": {},
  "last_event": "hitl_reached",
  "last_task_id": "modify_file",
  "paused_at": "2025-02-05T06:45:00"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `"paused"` when waiting at HITL |
| `workflow_path` | string | Path to workflow YAML (relative to workspace) |
| `project` | string | Project name (e.g., orchestration-training) |
| `current_task_index` | number | 0-based index of current task |
| `retry_counts` | object | `{ "task_id": count }` |
| `last_event` | string | `hitl_reached`, `adhoc_hitl_reached` |
| `last_task_id` | string | Task ID at which we paused |
| `paused_at` | string | ISO 8601 timestamp when paused |

Gate details (message, options, type) are **not** persisted. They are derived from the workflow YAML by loading the task at `current_task_index`.

## Lifecycle

### When to Write

**Before** showing any HITL prompt and waiting for user:

1. Approval gate (`hitl_reached`)
2. Question gate (`hitl_reached`)
3. Ad-hoc HITL (`adhoc_hitl_reached`)

Write the state file **immediately** when the gate is reached, before displaying the prompt. This ensures state is on disk even if the user closes Cursor while waiting.

### When to Clear

1. **After user responds** and before moving to next task: Delete the state file (or overwrite with empty/complete)
2. **On workflow_complete** (success or failed): Delete the state file
3. **On escalate** (retry exhausted): Delete the state file

### Resume Flow

1. User says "resume-sprint", "resume project [project_name]", or equivalent
2. Executor resolves project (from command or context) and reads that project's `workflow-state.json`
3. If exists and `status == "paused"`: Load workflow YAML, set `current_task_index` and `retry_counts` from state
4. Re-show the HITL prompt for the current task (from YAML)
5. Wait for user response
6. Process response, continue execution, clear state when advancing

## Edge Cases

- **State file exists but workflow YAML changed**: Resume may fail; user should restart workflow
- **Multiple projects**: State is per-project; infer project from context or state file path
- **User says "resume project X" but X has no paused workflow**: Report "No paused workflow in project X. Say 'Which projects have paused workflows?' to discover."
- **User doesn't know which project**: Say "Which projects have paused workflows?" → Project AI lists them; then say "resume project [name]"

## Related

- [workflow-execution-log.md](workflow-execution-log.md) - Execution log at `memory/workflows/<project>/execution-log.md`; last run may have Status=started when paused
- [workflow-executor.mdc](../../.cursor/rules/workflow-executor.mdc) - Executor writes/clears state, handles resume
