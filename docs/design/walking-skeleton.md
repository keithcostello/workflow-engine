# Walking Skeleton

## Purpose

This document defines **walking skeleton** for the workflow engine. Two definitions apply: (1) execution path validation, and (2) incremental software building. Both must be satisfied for valid workflow runs.

---

## Definition 1: Execution Path (Run Validation)

**Walking skeleton** = end-to-end flow through the full system. No bypasses.

### Valid Run

```
User: "Execute workflow"
    → Orchestrator loads YAML
    → Orchestrator delegates to Subagent (never executes)
    → Subagent performs action
    → Orchestrator shows HITL gate
    → User responds
    → Orchestrator continues
    → ... until workflow_complete
```

### Invalid Run

- Running `docker build` / `docker run` directly in terminal (bypasses orchestrator)
- Orchestrator executing actions (write, search_replace, run_terminal_cmd) instead of delegating
- Skipping HITL gates (no user response)
- Any shortcut that bypasses orchestrator → subagent → HITL → user

### Enforcement (Unchanged)

- **workflow-executor.mdc**: Do NOT proceed past a HITL gate without user response. Block until the human responds. Log `hitl_reached` before wait, `hitl_response` after.
- **workflow-execution-log.md**: For workflows with HITL gates, the log must show `hitl_reached` and `hitl_response` for each gate. A run without these events is invalid.

---

## Definition 2: Incremental Software Building (Sprint/Phase Structure)

**Walking skeleton** = sprint or phase broken into functional pieces; each piece is tested and validated before the next is added; full testing at each step; cycle repeats until phase/sprint complete.

### Principles

| Principle | Meaning |
|-----------|---------|
| **Functional pieces** | Sprint/phase is broken into discrete tasks (pieces). Each task produces a deliverable. |
| **Validate before next** | Each piece is tested and validated as correct before moving to the next. HITL gates enforce human validation. |
| **Additive construction** | The next piece is added to the last validated piece. No skipping. |
| **Full testing at each step** | After adding piece B, validate A+B. After adding C, validate A+B+C. Regression at each step. |
| **Cycle repeats** | Build → Validate → (Full test) → Next piece. Repeat until phase/sprint complete. |

### Workflow Pattern

When building software in walking-skeleton style, structure workflows as:

```
[Piece 1] → HITL validate → [Piece 2] → HITL validate → [Piece 3] → HITL validate → ...
```

Or with explicit tester step:

```
[Piece 1] → HITL validate → [Test A] → [Piece 2] → HITL validate → [Test A+B] → [Piece 3] → ...
```

### Example: minimal-workflow.yaml

- **Piece 1**: create_file (demo.txt)
- **Validate 1**: HITL approval
- **Piece 2**: modify_file (append)
- **Validate 2**: HITL question (yes/no)
- **Validate 1+2**: review task (reviewer validates whole)
- **Validate 1+2**: HITL pass/fail
- **Complete**: developer completes

### Example: workflow-definition.yaml (PM-Developer)

- create_project → HITL
- create_prd → HITL
- pm_validate_prd → HITL (on_no: loop back to create_prd)
- create_sub_sprints → HITL
- ... (additive, each validated before next)

### Sprint Semantics

| Term | In Workflow Engine | In Software Building |
|------|--------------------|----------------------|
| **Sprint** | Single workflow execution (one run of a YAML) | Development period with N functional pieces |
| **Piece** | One task in the workflow | One deliverable/feature |

**Reconciliation**: A workflow run = one "sprint" in engine terms. To model a development sprint with multiple pieces, design the workflow YAML so each task is a functional piece with HITL validation before the next. The workflow itself is the walking skeleton for that development cycle.

---

## Both Definitions Apply

For a run to be valid:

1. **Definition 1**: Full path (orchestrator → subagent → HITL → user). No bypassing. hitl_reached + hitl_response in log.
2. **Definition 2**: When building software, structure workflows as piece → validate → piece → validate. Use HITL and tester roles. No skipping validation.

---

## Related Documentation

- [workflow-executor.mdc](../../.cursor/rules/workflow-executor.mdc) - Walking skeleton enforcement (Definition 1)
- [workflow-execution-log.md](workflow-execution-log.md) - Log validation (Definition 1)
- [WALKING-SKELETON-TEST.md](../testing/WALKING-SKELETON-TEST.md) - Formal validation test (Definition 1 + 2)
- [agent-memory.md](agent-memory.md) - Sprint context
- [sprint-context.md](sprint-context.md) - Sprint schema
- [workflows/minimal-workflow.yaml](../../workflows/minimal-workflow.yaml) - Example piece-by-piece with validation
- [workflows/workflow-definition.yaml](../../workflows/workflow-definition.yaml) - Full PM-Developer pattern
