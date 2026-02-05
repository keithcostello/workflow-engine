# Resume-Sprint Test

**Purpose**: Verify that when Cursor is closed while a workflow is paused at a HITL gate, the user can re-enter and continue via "resume-sprint".

**Date**: 2025-02-05

---

## Scenario

1. User starts workflow (e.g., minimal-workflow.yaml)
2. Workflow reaches HITL gate (e.g., modify_file question gate)
3. User closes Cursor (or switches away) before responding
4. User reopens Cursor, returns to orchestration-training project
5. User says "resume-sprint" (or "resume workflow", "continue orchestration")
6. Workflow resumes: HITL prompt re-shown, user responds, workflow continues to completion

---

## Prerequisites

- workflow-state.json is written **before** waiting at HITL (executor rule)
- workflow-state.json persists in `memory/projects/orchestration-training/`

---

## Test Steps

### Step 1: Start Workflow and Pause

1. Execute: "Execute workflows/minimal-workflow.yaml"
2. Complete create_file (approve)
3. At modify_file: When HITL prompt appears ("File modified. Does it look correct? Options: yes, no"), **do not respond**
4. Verify: `memory/projects/orchestration-training/workflow-state.json` exists with status=paused, last_task_id=modify_file

### Step 2: Simulate Cursor Close

- Close Cursor (or switch to another app). workflow-state.json remains on disk.

### Step 3: Re-enter and Resume

1. Reopen Cursor, open orchestration-training project
2. Ask: "What's the status of orchestration-training?"
3. **Expected**: Project AI reports "Workflow paused at modify_file. Say 'resume-sprint' to continue."
4. Say: "resume-sprint"
5. **Expected**: Workflow Executor loads state, re-shows HITL prompt for modify_file
6. Respond: "yes"
7. **Expected**: Workflow continues through review and complete; workflow-state.json cleared

### Step 4: Verify Completion

- Execution log has workflow_complete
- workflow-state.json deleted
- artifacts/demo.txt has expected content

---

## Pass Criteria

- [ ] workflow-state.json written when HITL gate reached (before wait)
- [ ] Project AI surfaces "resume-sprint" when status queried and workflow paused
- [ ] "resume-sprint" loads state, re-shows prompt, continues
- [ ] workflow-state.json cleared after response and on workflow_complete

---

## Alternative: Status-Only Test

If full close/reopen is impractical:
1. Start workflow, pause at modify_file
2. Verify workflow-state.json exists
3. Say "resume-sprint" in same session
4. Verify prompt re-shown, respond, workflow completes
