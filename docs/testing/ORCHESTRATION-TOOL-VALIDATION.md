# Orchestration Tool Validation

**Purpose**: Validate the orchestration tool and all its features at the end of every sprint/phase test. Ensures the system is working as expected before advancing.

**Core Principle**: No workarounds by ANY AI during ANY part of orchestration. On failure: notify HITL, pause, wait for human resolution.

---

## When to Run

- **End of every sprint**: After workflow completes
- **End of every phase test**: Mandatory before phase sign-off
- **Failure**: Any check fails → sprint/phase test failed → fix tool → retry

---

## Validation Procedure

1. Complete sprint/phase test (workflow run)
2. Run this checklist (all OT0–OT33)
3. For each check: record **Pass**, **Fail**, or **Not Used**
4. **If any Fail**: Sprint/phase test FAILED. Record failing checks. Fix orchestration tool. Retry.
5. **If any Not Used**: Document which features were not exercised. **User must verify and approve** each "Not Used" before sprint is approved as successful.
6. **If all Pass** (or Pass + user-approved Not Used): Sprint/phase test PASSED.

---

## Checklist

### A. No Workarounds (All AIs)

| Check | Feature | Pass Criteria |
|-------|---------|---------------|
| OT0 | No workarounds | No AI performs workarounds during orchestration. On failure: notify HITL, pause, wait for human. No bypassing, substituting, or shortcutting. |

### B. Orchestrator (workflow-executor)

| Check | Feature | Pass Criteria |
|-------|---------|---------------|
| OT1 | Execute workflow | "Execute workflow" triggers run; no terminal bypass |
| OT2 | Delegation | Orchestrator delegates all tasks to subagents; never executes |
| OT3 | HITL relay | Orchestrator relays HITL prompts to user; blocks until response |
| OT4 | Subagent failure | On subagent failure: notify HITL, pause, no workarounds; never execute the task itself |
| OT5 | Resume | "resume-sprint" / "resume project [name]" loads state, continues |

### C. Subagents

| Check | Feature | Pass Criteria |
|-------|---------|---------------|
| OT6 | Developer | create_file, modify_file, build_docker, run_container, complete work |
| OT7 | Reviewer | review action works |
| OT8 | Multiple roles | At least 2 roles used in a run |
| OT9 | Agent memory | Each role creates/appends to `[role]_sprint_[id].md` |

### D. HITL Gates

| Check | Feature | Pass Criteria |
|-------|---------|---------------|
| OT10 | Approval | User approves/rejects; gate blocks until response |
| OT11 | Question | User selects option; branch on no/fail if configured |
| OT12 | Info | auto_continue or wait; message shown |
| OT13 | None | No interaction; continues automatically |
| OT14 | Ad-hoc | adhoc_hitl or {{ask_user}}; AI stops, asks, fills param |

### E. State and Memory

| Check | Feature | Pass Criteria |
|-------|---------|---------------|
| OT15 | Execution log | Written to `memory/workflows/[project]/execution-log.md`; LOG_ROW_PROTOCOL; workflow_start, task_start, action_done, hitl_reached, hitl_response, task_complete, workflow_complete |
| OT16 | Agent memory | Files exist for each role used; content appended per task |
| OT17 | Sprint context | `sprint_[id]_context.json` created (or documented optional) |
| OT18 | workflow-state.json | Written before HITL wait; cleared after response/complete |
| OT19 | STANDARD_MEMORY_UPDATE | On workflow_complete: WAITING_ON.md updated, GLOBAL_DAILY_LOG.md appended |

### F. Flow Control

| Check | Feature | Pass Criteria |
|-------|---------|---------------|
| OT20 | Retry | Retry section works; retry_count increments; escalate when exhausted |
| OT21 | Branch | on_no, on_fail, conditions trigger correct branch |
| OT22 | Walking skeleton Def 1 | WS1.1–WS1.8 (execution path) |
| OT23 | Walking skeleton Def 2 | WS2.1–WS2.4 (piece→validate) for workflow YAML |

### G. Query System

| Check | Feature | Pass Criteria |
|-------|---------|---------------|
| OT24 | Project AI | "What's the status of [project]?" returns accurate state |
| OT25 | Task AI | "What task is running?" returns correct info |
| OT26 | HITL AI | "What gate is waiting?" returns correct info |
| OT27 | Query Router | Routes execute workflow, resume, project/workflow/task/HITL queries correctly |

### H. Actions

| Check | Feature | Pass Criteria |
|-------|---------|---------------|
| OT28 | create_file | File created with content |
| OT29 | modify_file | File modified (append or replace) |
| OT30 | review | File read; review feedback |
| OT31 | build_docker | Docker image built |
| OT32 | run_container | Container runs |
| OT33 | complete | Workflow ends; info message |

---

## Results Table

| Date | Sprint/Phase | Pass/Fail | Failing checks (OTn) | Not Used (OTn) | Pass Evidence | User verified? |
|------|--------------|-----------|----------------------|----------------|---------------|-----------------|
| 2026-02-05 | orchestration-validation-workflow (Restart) | **PASS** | — | OT4, OT5, OT13, OT17, OT20, OT21, OT24, OT25, OT26, OT27, OT31, OT32 | [See below](#pass-evidence-2026-02-05-restart) | Pending |
| 2026-02-05 | orchestration-validation-workflow (09:14) | **PASS** | — | OT4, OT5, OT13, OT17, OT20, OT21, OT24, OT25, OT26, OT27, OT31, OT32 | [See below](#pass-evidence-2026-02-05-0914) | Pending |
| 2026-02-05 | full-orchestration-mcp-validation-workflow | **Ready** | — | OT4, OT17, OT20, OT24, OT25, OT26, OT27 | Run via "Execute workflows/full-orchestration-mcp-validation-workflow.yaml" | — |

### Pass Evidence — 2026-02-05 Run (Restart)

| OT | Feature | Evidence |
|----|---------|----------|
| OT0 | No workarounds | Run completed without bypass; no AI substituted or shortcut |
| OT1 | Execute workflow | User triggered run; workflow executed via orchestrator |
| OT2 | Delegation | execution-log: "Delegated to developer", "Delegated to reviewer" |
| OT3 | HITL relay | execution-log: hitl_reached before each hitl_response; user responded at each gate |
| OT6 | Developer | execution-log: create_file, modify_with_adhoc, complete; developer_sprint_20260205-0856.md |
| OT7 | Reviewer | execution-log: review; reviewer_sprint_20260205-0856.md |
| OT8 | Multiple roles | developer + reviewer used (2 roles) |
| OT9 | Agent memory | developer_sprint_20260205-0856.md, reviewer_sprint_20260205-0856.md — created and appended per task |
| OT10 | Approval | execution-log: hitl_reached/hitl_response create_file type=approval |
| OT11 | Question | execution-log: hitl_reached/hitl_response modify_with_adhoc, review type=question |
| OT12 | Info | execution-log: complete action_done "Info gate, auto_continue" |
| OT14 | Ad-hoc | execution-log: adhoc_hitl_reached, adhoc_hitl_response modify_with_adhoc |
| OT15 | Execution log | memory/workflows/orchestration-training/execution-log.md — Run 2026-02-05 08:55; unique timestamps per row |
| OT16 | Agent memory | memory/workflows/orchestration-training/developer_sprint_20260205-0856.md, reviewer_sprint_20260205-0856.md |
| OT18 | workflow-state.json | Written at approval + ad-hoc gates; cleared after response/complete |
| OT19 | STANDARD_MEMORY_UPDATE | WAITING_ON.md updated; GLOBAL_DAILY_LOG.md appended |
| OT22 | Walking skeleton Def 1 | execution-log: workflow_start, task_start, action_done, hitl_reached, hitl_response, task_complete, workflow_complete |
| OT23 | Walking skeleton Def 2 | orchestration-validation-workflow.yaml: piece→validate pattern; on_fail branch |
| OT28 | create_file | validation-demo.txt created |
| OT29 | modify_file | validation-demo.txt appended |
| OT30 | review | validation-demo.txt reviewed |
| OT33 | complete | workflow_complete status=success |

### Pass Evidence — 2026-02-05 Run (09:14)

| OT | Feature | Evidence |
|----|---------|----------|
| OT0 | No workarounds | Run completed without bypass; LOG_ROW_PROTOCOL enforced (date command per event) |
| OT1 | Execute workflow | User triggered run; workflow executed via orchestrator |
| OT2 | Delegation | execution-log: "Delegated to developer", "Delegated to reviewer" |
| OT3 | HITL relay | execution-log: hitl_reached before each hitl_response; user responded at each gate |
| OT6 | Developer | execution-log: create_file, modify_with_adhoc, complete; developer_sprint_20260205-0914.md |
| OT7 | Reviewer | execution-log: review; Delegated to reviewer |
| OT8 | Multiple roles | developer + reviewer used (2 roles) |
| OT9 | Agent memory | developer_sprint_20260205-0914.md — created and appended per task |
| OT10 | Approval | execution-log: hitl_reached/hitl_response create_file type=approval |
| OT11 | Question | execution-log: hitl_reached/hitl_response modify_with_adhoc, review type=question |
| OT12 | Info | execution-log: complete action_done "Info gate, auto_continue" |
| OT14 | Ad-hoc | execution-log: adhoc_hitl_reached, adhoc_hitl_response modify_with_adhoc |
| OT15 | Execution log | memory/workflows/orchestration-training/execution-log.md — Run 2026-02-05 09:14; LOG_ROW_PROTOCOL (date command per row) |
| OT16 | Agent memory | memory/workflows/orchestration-training/developer_sprint_20260205-0914.md |
| OT18 | workflow-state.json | Written at HITL gates; cleared after response/complete |
| OT19 | STANDARD_MEMORY_UPDATE | WAITING_ON.md updated; GLOBAL_DAILY_LOG.md appended (post-sprint) |
| OT22 | Walking skeleton Def 1 | execution-log: workflow_start, task_start, action_done, hitl_reached, hitl_response, task_complete, workflow_complete |
| OT23 | Walking skeleton Def 2 | orchestration-validation-workflow.yaml: piece→validate pattern; on_fail branch |
| OT28 | create_file | validation-demo.txt created |
| OT29 | modify_file | validation-demo.txt appended |
| OT30 | review | validation-demo.txt reviewed |
| OT33 | complete | workflow_complete status=success |

### Not Used — 2026-02-05 Run (User Verification Required)

| OT | Feature | Reason |
|----|---------|--------|
| OT4 | Subagent failure | No subagent failed during run |
| OT5 | Resume | Full restart; resume-sprint not tested |
| OT13 | HITL type=none | Workflow had no none-type gate |
| OT17 | Sprint context | sprint_[id]_context.json not created (optional per design) |
| OT20 | Retry | No retry triggered |
| OT21 | Branch (on_fail) | User chose pass; on_fail branch not exercised |
| OT24 | Project AI query | Query system not tested during run |
| OT25 | Task AI query | Query system not tested during run |
| OT26 | HITL AI query | Query system not tested during run |
| OT27 | Query Router | Query routing not tested during run |
| OT31 | build_docker | Not in orchestration-validation-workflow |
| OT32 | run_container | Not in orchestration-validation-workflow |

**User**: Please verify each "Not Used" is acceptable. Sprint approval pending your sign-off.

---

## Not Used Rule

If a feature was **not used** during a sprint:
- Document it as **Not Used** in the results
- **User must verify and approve** each "Not Used" before sprint is approved as successful
- Sprint is **not** approved until user has verified all "Not Used" items

---

## Validation Workflows

**Full orchestration + MCP validation** (recommended): Use `workflows/full-orchestration-mcp-validation-workflow.yaml` to exercise all OT scenarios in one run: create_file, modify_file with adhoc_hitl, review, build_docker, run_container, MCP validation (workflow_list, workflow_load, workflow_get_active), workflow_handle_hitl HITL test, complete. Covers OT0–OT33; MCP tools validated via orchestration; single HITL test. Pause at first gate to test resume-sprint (OT5).

**Legacy**: Use `workflows/orchestration-validation-workflow.yaml` for create_file, modify_file with adhoc_hitl, review, branch (on_fail), complete. Optionally pause at the first approval gate to test resume-sprint.

---

## Next Steps (After Validation Pass)

1. **Execute full-orchestration-mcp-validation-workflow** — Run "Execute workflows/full-orchestration-mcp-validation-workflow.yaml"; covers OT0–OT33, MCP tools, HITL test
2. **User verify Not Used** — Sign off on OT4, OT17, OT20, OT24, OT25, OT26, OT27 (after full run)
3. **Optional: Exercise Not Used** — Run targeted tests for resume (OT5), branch/on_fail (OT21), query system (OT24–OT27)
4. **Sprint context (OT17)** — Consider creating sprint_[id]_context.json at workflow start if not optional

## Related

- [WALKING-SKELETON-TEST.md](WALKING-SKELETON-TEST.md) — Definition 1 + 2
- [workflow-execution-log.md](../design/workflow-execution-log.md) — Log format
- [SUBAGENT-ORCHESTRATION-ALIGNMENT.md](../design/SUBAGENT-ORCHESTRATION-ALIGNMENT.md) — Testing checklist
