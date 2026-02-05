# Not Used Sprint Test — Exact Steps

**Purpose**: Test OT5 (Resume), OT21 (Branch on_fail), OT24–OT27 (Query System), OT31–OT32 (Docker) without missing steps.

**Workflows**: `orchestration-validation-workflow.yaml` (Phases 1–2), `docker-hello-workflow.yaml` (Phase 3)

---

## Before You Start

- **Prerequisite for Phase 3**: Docker installed and running
- **Clear state**: Ensure `memory/projects/orchestration-training/workflow-state.json` does NOT exist (delete if present)
- **Artifact**: Phase 1–2 use `artifacts/validation-demo.txt`; it will be created/overwritten

---

## Phase 1: OT5 (Resume) + OT24–OT27 (Query System)

**Workflow**: orchestration-validation-workflow.yaml

### Step 1.1 — Start the workflow

**You say:**
```
Execute workflows/orchestration-validation-workflow.yaml
```
*or*
```
Run orchestration-validation-workflow
```

**Expected**: AI shows task info, delegates to developer, creates `validation-demo.txt`.

---

### Step 1.2 — STOP HERE (do not respond)

**You will see:**
```
[HITL] Approval: File created. Approve to continue? (Pause here to test resume-sprint.)
⏸️  Waiting for your response: "yes"/"approve" or "no"/"reject"
```

**You do:** Nothing. Do not type "yes" or "no". Do not respond.

---

### Step 1.3 — Verify workflow-state.json exists

**Check:** Open `memory/projects/orchestration-training/workflow-state.json`

**Expected content:**
```json
{
  "status": "paused",
  "last_task_id": "create_file",
  ...
}
```

If the file does not exist, the test fails. The orchestrator should have written it before waiting.

---

### Step 1.4 — Query tests (OT24–OT27)

**While still paused**, ask each of these in a new message. Note which AI responds.

| # | You say | OT | Expected: Correct AI responds |
|---|---------|-----|-------------------------------|
| 1 | `What's the status of orchestration-training?` | OT24 | Project AI |
| 2 | `What task is running?` | OT25 | Task AI |
| 3 | `What gate is waiting?` | OT26 | HITL AI |
| 4 | `Ask Project AI: What's the status?` | OT27 | Query Router routes to Project AI |

**Expected for #1–3**: Status shows workflow paused at create_file; gate waiting for approval.

**Expected for #4**: Query Router routes to Project AI; Project AI returns status.

---

### Step 1.5 — Resume (OT5)

**You say:**
```
resume project orchestration-training
```
*or*
```
resume-sprint
```

**Expected**: AI re-shows the same HITL prompt:
```
[HITL] Approval: File created. Approve to continue?
⏸️  Waiting for your response: "yes"/"approve" or "no"/"reject"
```

---

### Step 1.6 — Respond to continue

**You say:**
```
yes
```

**Expected**: Workflow continues to Stage 2 (Modify with Ad-hoc HITL). Phase 1 complete.

---

## Phase 2: OT21 (Branch on_fail)

**Same workflow run** (continues from Phase 1)

### Step 2.1 — Ad-hoc HITL (provide content)

**You will see:**
```
[ADHOC HITL] ⏸️  I need your input before I can proceed.
What content should I append? (Ad-hoc HITL - I must ask before proceeding.)
```

**You say:**
```
Phase 2 test content
```
*(or any text you like)*

**Expected**: AI appends content, then shows question gate.

---

### Step 2.2 — Question gate (modify done)

**You will see:**
```
[HITL] Question: Modification done. Continue?
Options: yes, no
⏸️  Waiting for your selection
```

**You say:**
```
yes
```

**Expected**: Workflow continues to Stage 3 (Review Work).

---

### Step 2.3 — STOP HERE — Choose "fail" (not "pass")

**You will see:**
```
[HITL] Question: Review complete. Pass or fail?
Options: pass, fail
⏸️  Waiting for your selection
```

**You say:**
```
fail
```

**Expected**: Workflow branches back to Stage 2 (modify_with_adhoc) per `on_fail: modify_with_adhoc`. You will see the ad-hoc HITL again.

---

### Step 2.4 — Ad-hoc HITL again (second time)

**You will see:**
```
[ADHOC HITL] ⏸️  I need your input before I can proceed.
What content should I append?
```

**You say:**
```
Branch test - second append
```
*(or any text)*

**Expected**: AI appends, then shows "Modification done. Continue?"

---

### Step 2.5 — Question gate again

**You will see:**
```
[HITL] Question: Modification done. Continue?
Options: yes, no
```

**You say:**
```
yes
```

**Expected**: Workflow continues to Stage 3 (Review) again.

---

### Step 2.6 — Review gate — Choose "pass"

**You will see:**
```
[HITL] Question: Review complete. Pass or fail?
Options: pass, fail
```

**You say:**
```
pass
```

**Expected**: Workflow continues to Stage 4 (Complete), then finishes. Phase 2 complete.

---

### Step 2.7 — Verify completion

**Check:**
- Execution log has `workflow_complete` with `status=success`
- `workflow-state.json` is deleted
- `artifacts/validation-demo.txt` contains both appends (Phase 2 test content + Branch test - second append)

---

## Phase 3: OT31–OT32 (Docker)

**Workflow**: docker-hello-workflow.yaml

**Prerequisite**: Docker installed and running.

---

### Step 3.1 — Start Docker workflow

**You say:**
```
Execute workflows/docker-hello-workflow.yaml
```
*or*
```
Run docker-hello-workflow
```

**Expected**: AI delegates to developer, builds Docker image from `workflows/docker-hello/`.

---

### Step 3.2 — OT31 — Approve after build

**You will see:**
```
[HITL] Approval: Image built. Approve to run container?
⏸️  Waiting for your response: "yes"/"approve" or "no"/"reject"
```

**You say:**
```
yes
```

**Expected**: OT31 pass — Image `docker-hello:latest` built. Workflow continues to run container.

---

### Step 3.3 — OT32 — Container runs

**Expected**: Container runs automatically (info gate with auto_continue). Output shows "Hello from Docker!" or similar.

**Check:** Execution log has `action_done` for run with "Container ran successfully" or equivalent.

---

### Step 3.4 — Workflow complete

**Expected**: Info message "Docker orchestration demo complete!" — workflow ends. Phase 3 complete.

---

## Checklist Summary

| Phase | OT | Where you stop | What you say |
|-------|-----|----------------|--------------|
| 1 | OT5, OT24–27 | create_file approval | STOP (no response) → run queries → "resume project orchestration-training" → "yes" |
| 2 | OT21 | review gate (first time) | "fail" → ad-hoc content → "yes" → review gate (second time) → "pass" |
| 3 | OT31, OT32 | — | "yes" at build approval; container runs automatically |

---

## If You Miss a Step

- **Phase 1**: If you responded "yes" at create_file before pausing, you cannot test OT5 or OT24–27 in this run. Start over.
- **Phase 2**: If you said "pass" at the first review gate, you skipped OT21. Start over from Phase 1 (or from modify_with_adhoc if you can re-enter there).
- **Phase 3**: Independent; can run anytime after Phase 2.

---

## Related

- [ORCHESTRATION-TOOL-VALIDATION.md](ORCHESTRATION-TOOL-VALIDATION.md) — Full OT0–OT33 checklist
- [RESUME-SPRINT-TEST.md](RESUME-SPRINT-TEST.md) — Resume-from-disk variant (close Cursor at Step 1.2)
