# Sprint Context

## Purpose

The **orchestrator** creates and maintains sprint context for each workflow run. This context is passed to subagents when delegating tasks. Project-specific rules, folder structure, and memory paths are derived from this context.

## Location

**Path**: `memory/workflows/[project]/sprint_[sprint_id]_context.json`

**Example**: `memory/workflows/orchestration-training/sprint_001_context.json`

## Schema

```json
{
  "sprint_id": "001",
  "workflow_name": "Minimal Demo Workflow",
  "workflow_path": "orchestration-training/workflow-engine/workflows/minimal-workflow.yaml",
  "project": "orchestration-training",
  "started_at": "2025-02-05T14:30:00",
  "current_task_index": 0,
  "retry_counts": {},
  "status": "running"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `sprint_id` | string | Unique ID for this run (e.g., `001`, `20250205-1430`) |
| `workflow_name` | string | From workflow YAML |
| `workflow_path` | string | Path to workflow YAML (relative to workspace) |
| `project` | string | Project name |
| `started_at` | string | ISO 8601 timestamp |
| `current_task_index` | number | 0-based index of current task |
| `retry_counts` | object | `{ "task_id": count }` |
| `status` | string | `running`, `paused`, `complete`, `failed` |

## Memory Paths (Derived)

From sprint context, the orchestrator derives memory paths for each role:

- `memory/workflows/[project]/developer_sprint_[sprint_id].md`
- `memory/workflows/[project]/reviewer_sprint_[sprint_id].md`
- etc.

## When to Create

- **Orchestrator** creates sprint context at workflow start
- Generates `sprint_id` (e.g., from timestamp or run counter)

## When to Update

- **Orchestrator** updates `current_task_index`, `retry_counts`, `status` as execution progresses

## When to Clear

- **Orchestrator** can archive or leave context file after workflow completes (for audit/history)
- Or delete when no longer needed (optional)

## Project-Specific vs Shared

| Item | Location | Notes |
|------|----------|-------|
| Subagents | Workspace `.cursor/agents/` | Shared across projects |
| Sprint context | `memory/workflows/[project]/` | Project-specific |
| Agent memory | `memory/workflows/[project]/` | Project-specific |
| Rules subagents use | Project `.cursor/rules/` | Project-specific (e.g., workflow-engine) |
| Artifacts folder | Project path (e.g., `workflow-engine/artifacts/`) | Project-specific |

## Related Documentation

- [agent-memory.md](agent-memory.md) - Agent memory convention
- [workflow-state.md](workflow-state.md) - Paused state (resume-sprint)
- [workflow-execution-log.md](workflow-execution-log.md) - Execution log
