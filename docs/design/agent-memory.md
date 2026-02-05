# Agent Memory Convention

## Purpose

Each subagent (developer, reviewer, validator, architect, pm, tester) has **persistent memory per sprint**. One file per agent per sprint—not per task. This avoids overwhelming the same agent with many files when it works on multiple tasks in one sprint.

## Path Convention

**Path**: `memory/workflows/[project]/[agent_name]_sprint_[sprint_id].md`

| Segment | Meaning | Example |
|---------|---------|---------|
| `[project]` | Project name | `orchestration-training` |
| `[agent_name]` | Role name | `developer`, `reviewer`, `validator`, `architect`, `pm`, `tester` |
| `[sprint_id]` | Sprint identifier | `001`, `20250205-1430` |

**Example**: `memory/workflows/orchestration-training/developer_sprint_001.md`

## Sprint Definition

**Sprint** = single workflow execution (one run of a workflow YAML). Same developer across create_file, modify_file, review = one sprint, one memory file per role.

**Walking skeleton**: When building software incrementally, structure the workflow so each task is a functional piece with validation before the next. See [walking-skeleton.md](walking-skeleton.md).

## File Format

Each agent memory file is Markdown. Structure:

```markdown
# [Agent Name] — [Project] / Sprint [sprint_id]
**Workflow**: [workflow_name]
**Sprint ID**: [sprint_id]
**Last Updated**: [ISO timestamp]

## Context
- Current sprint, workflow, project
- Relevant params, artifacts, decisions

## Tasks Completed
### Task: [task_id] | [timestamp]
**Action**: [action]
**Result**: [summary]
**Artifacts**: [paths]

### Task: [task_id] | [timestamp]
...
```

Agents **append** to their file as they complete tasks. Do not overwrite—append new task sections.

## When to Create

- **Orchestrator** creates the directory `memory/workflows/[project]/` at workflow start if it doesn't exist
- **Subagent** creates its memory file on first task (or orchestrator can create empty file when delegating)

## When to Read

- **Subagent** reads its memory file at the start of each delegated task (if file exists)
- **Project AI** can read `memory/workflows/[project]/*.md` when answering "what happened in this sprint?"

## When to Update

- **Subagent** appends to its memory file after completing each task

## Relationship to Other Memory

| Location | Purpose |
|----------|---------|
| `memory/projects/[project]/WAITING_ON.md` | Project-level state (blockers, next actions) |
| `memory/workflows/[project]/execution-log.md` | Per-action audit trail |
| `memory/projects/[project]/workflow-state.json` | Paused workflow state (resume-sprint) |
| `memory/workflows/[project]/[agent]_sprint_[id].md` | Per-agent, per-sprint memory |
| `memory/workflows/[project]/sprint_[id]_context.json` | Sprint context (orchestrator) |

## Related Documentation

- [workflow-execution-log.md](workflow-execution-log.md) - Execution audit trail
- [workflow-state.md](workflow-state.md) - Resume-sprint state
- [sprint-context.md](sprint-context.md) - Sprint context schema
- [COMPONENT-AI-ARCHITECTURE.md](../architecture/COMPONENT-AI-ARCHITECTURE.md) - Architecture (updated for subagents)
