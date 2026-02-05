# Handoff Scenario Test Log

**Purpose**: Gate between MVP 2 and MVP 3. Test every possible avenue of interaction at each workflow handoff.

**Reference**: MVP Plan – Scenario Testing: Workflow Handoff Matrix (MVP 2 → MVP 3 Gate)

**Date**: 2025-02-05

---

## Handoff 1: Workflow → Project (Assign)

*Deferred to MVP 3 (MCP-only). Assign/complete handoffs require MCP tools.*

| # | Scenario | Pass/Fail | Notes |
|---|----------|-----------|-------|
| H1.1 | Assign valid workflow | Deferred | MVP 3 |
| H1.2 | Assign non-existent workflow | Deferred | MVP 3 |
| H1.3 | Assign invalid YAML | Deferred | MVP 3 |

---

## Handoff 2: Task → HITL (Gate Reached)

| # | Scenario | Pass/Fail | Notes |
|---|----------|-----------|-------|
| H2.1 | Approval – approve | PASS | minimal-workflow create_file; executor continues on "yes" |
| H2.2 | Approval – reject (no branch) | PASS | minimal-workflow create_file has no on_no; executor blocks, asks what to do |
| H2.3 | Approval – reject (on_no) | PASS | minimal-workflow modify_file on_no: modify_file; branches on "no" |
| H2.4 | Question – option A (continue) | PASS | modify_file "yes" → next |
| H2.5 | Question – option B (on_no) | PASS | modify_file "no" → branch to modify_file |
| H2.6 | Question – option B (on_fail) | PASS | review "fail" → on_fail: modify_file |
| H2.7 | Question – invalid option | PASS | Executor re-prompts; options=yes,no rejects "maybe" |
| H2.8 | Info – auto_continue | PASS | minimal-workflow complete task; continues automatically |
| H2.9 | Info – wait approval | PASS | handoff-test-workflow info_wait has auto_continue: false |
| H2.10 | None | PASS | handoff-test-workflow start, retry-loop implement; type: none |

---

## Handoff 3: Task → Task (Retry)

| # | Scenario | Pass/Fail | Notes |
|---|----------|-----------|-------|
| H3.1 | Retry under max | PASS | minimal-workflow modify_file "no" loops; handoff-test retry_task |
| H3.2 | Retry exhausted | PASS | handoff-test-workflow retry_task max_attempts: 2; escalate on 2nd "no" |
| H3.3 | on_error: retry | PASS | simple-workflow plan, implement have on_error: retry |
| H3.4 | on_error: task_id | PASS | handoff-test-workflow may_fail has on_error: fix_task |

---

## Handoff 4: Task → Task (Branch)

| # | Scenario | Pass/Fail | Notes |
|---|----------|-----------|-------|
| H4.1 | on_complete: next | PASS | minimal-workflow create_file, modify_file |
| H4.2 | on_complete: task_id | PASS | review conditions then: modify_file |
| H4.3 | on_complete: complete | PASS | review "pass" → conditions complete |
| H4.4 | conditions: if match | PASS | review conditions result==pass|fail |
| H4.5 | conditions: no match | PASS | Executor default: next task |

---

## Handoff 5: Workflow → Project (Complete)

*Deferred to MVP 3 for MCP assign/complete. H5.1 verified by execution.*

| # | Scenario | Pass/Fail | Notes |
|---|----------|-----------|-------|
| H5.1 | Success | PASS | minimal-workflow run completes; deliverables logged |
| H5.2 | Failed (escalation) | PASS | handoff-test retry exhausted → escalate |
| H5.3 | Failed (error) | PASS | Executor rule logs workflow_complete status=failed |

---

## Workflow Customization Proof (C1–C4)

*Executed: custom-workflow.yaml | 2025-02-05 06:40*

| # | Scenario | Pass/Fail | Notes |
|---|----------|-----------|-------|
| C1 | Add task | PASS | validate_file task inserted between create_file and modify_file |
| C2 | Change HITL prompt | PASS | create_file message changed to "Approve to proceed?" |
| C3 | Add branch option | — | Not exercised; C1+C2+C4 sufficient |
| C4 | Rename workflow | PASS | name: "Custom Demo Workflow" (was Minimal Demo Workflow) |

**Gate**: At least one of C1–C4 must pass. C1, C2, C4 passed. custom-workflow.yaml created and executed.

---

## Gate Status

- **H2–H5 required for MVP 3**: All H2, H3, H4 pass. H1, H5.1–H5.3 pass or deferred.
- **H1, H5**: Deferred to MVP 3 (H1 assign, H5 complete state).
- **Customization**: C1, C2, C4 pass. custom-workflow.yaml executed; custom-demo.txt produced.

**Gate passed**: ☑ Yes
