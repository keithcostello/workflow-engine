# Walking Skeleton Validation Test

**Purpose**: Formal test to validate both walking skeleton definitions are followed.  
**Reference**: [walking-skeleton.md](../design/walking-skeleton.md)

---

## Definition 1: Execution Path (Run Validation)

**Walking skeleton** = end-to-end flow through the full system. No bypasses.

### Checklist (after running a workflow)

| Check | Pass Criteria |
|-------|---------------|
| WS1.1 | Run was triggered via "Execute workflow" (not terminal bypass) |
| WS1.2 | Orchestrator delegated (no direct execution by orchestrator) |
| WS1.3 | Execution log has `workflow_start` |
| WS1.4 | For each task with HITL: log has `hitl_reached` before `hitl_response` |
| WS1.5 | For each task with HITL: log has `hitl_response` after user responded |
| WS1.6 | Execution log has `workflow_complete` |
| WS1.7 | No `action_done` without prior `task_start` for that task |
| WS1.8 | Deliverables section present in run footer |

**Fail if**: Any check fails. Run is invalid.

---

## Definition 2: Incremental Software Building (Workflow Structure)

**Walking skeleton** = piece → validate → piece → validate. No skipping validation.

### Checklist (when designing or validating a workflow YAML)

| Check | Pass Criteria |
|-------|---------------|
| WS2.1 | Each build/deliverable task has a subsequent validation (HITL or tester task) |
| WS2.2 | No task advances to next piece without validation (HITL or explicit test) |
| WS2.3 | Workflow follows pattern: [Piece] → [Validate] → [Piece] → [Validate] |
| WS2.4 | On validation failure: workflow branches back (on_no, on_fail) or escalates |

**Fail if**: Workflow structure violates piece → validate pattern.

---

## Test Procedure

1. Run `minimal-workflow.yaml` or `docker-hello-workflow.yaml` via "Execute workflow"
2. Respond at each HITL gate (approve, yes, pass, etc.)
3. After completion, open `memory/workflows/orchestration-training/execution-log.md`
4. Find the run for the workflow just executed
5. Execute Definition 1 checklist (WS1.1–WS1.8)
6. For Definition 2: Review workflow YAML structure against WS2.1–WS2.4
7. Record pass/fail below

---

## Test Results

| Date | Workflow | Definition 1 | Definition 2 | Notes |
|------|----------|--------------|--------------|-------|
| 2025-02-05 | minimal-workflow (Test B) | PASS | PASS | See execution log run at 08:23; WS1.1–WS1.8 all pass |
| 2025-02-05 | docker-hello-workflow (Test C) | PASS | PASS | See execution log run at 08:26; info/auto_continue has no hitl_response (implicit) |
| 2025-02-05 | **Validation run** | **PASS** | **PASS** | Both definitions validated against Test B + Test C runs |
| 2026-02-05 | phase-b-mcp-sprint-workflow | PASS | PASS | See execution log run at 10:24; WS1.1–WS1.8 all pass; piece→HITL pattern |

**Definition 1 validation** (Test B): workflow_start ✓, delegated ✓, hitl_reached/hitl_response for create_file, modify_file, review ✓, workflow_complete ✓, task_start before each action_done ✓, Deliverables ✓

**Definition 2 validation** (minimal-workflow): create_file→HITL→modify_file→HITL→review→HITL→complete; on_no/on_fail branch back ✓

**Definition 1 validation** (Phase B 2026-02-05): workflow_start ✓, hitl_reached/hitl_response for all 7 HITL gates ✓, workflow_complete ✓, task_start before each action_done ✓, Deliverables ✓

**Definition 2 validation** (phase-b-mcp-sprint-workflow): pm→HITL→architect→HITL→piece1→HITL→piece2→HITL→piece3→HITL→reviewer→HITL→tester→HITL→complete; on_fail branches to dev_piece_3 ✓

---

## Related

- [walking-skeleton.md](../design/walking-skeleton.md) — Definitions
- [workflow-execution-log.md](../design/workflow-execution-log.md) — Log format
- [SUBAGENT-ORCHESTRATION-ALIGNMENT.md](../design/SUBAGENT-ORCHESTRATION-ALIGNMENT.md) — Testing checklist
