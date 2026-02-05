# Bug Report Convention

**Purpose**: When AI code review or AI UAT fails, the reviewer/validator writes a bug report. The developer must address all issues and resubmit.

---

## Location

`memory/workflows/<project>/bug_reports/<task_id>_<timestamp>.md`

**Examples**:
- `memory/workflows/orchestration-training/bug_reports/piece_1_code_review_20260205-143022.md`
- `memory/workflows/orchestration-training/bug_reports/piece_2_ai_uat_20260205-144531.md`

**Timestamp format**: `YYYYMMDD-HHMMSS` (ISO-like, no colons for filesystem safety)

---

## Format

```markdown
# Bug Report: [task_id]
**Task**: [task name]
**Date**: [ISO timestamp]
**Result**: FAIL

## Issues
- [Issue 1]
- [Issue 2]

## Required Fixes
- [Action 1]
- [Action 2]

## Resubmit
Developer must address all issues, then resubmit. Delete this file when fixed.
```

---

## Who Writes

- **Reviewer** (code review): On `result: fail`, writes bug report before returning.
- **Validator** (AI UAT, Phase C/D): On `result: fail`, writes bug report before returning.
- **Tester** (UAT, Phase B): On `result: fail`, writes bug report before returning.

---

## Developer Flow

1. Workflow branches back to `piece_N` when code review or AI UAT fails.
2. Developer receives `bug_report_path` in params (or discovers it in `memory/workflows/<project>/bug_reports/`).
3. Developer reads bug report, fixes all issues.
4. Developer deletes bug report (or marks resolved) when fixes are complete.
5. Developer resubmits (workflow continues from `piece_N`; code review runs again).

---

## Return Convention

Reviewer, Validator, and Tester must return a structured result the orchestrator can use for conditions:

- **Pass**: `{ result: "pass" }`
- **Fail**: `{ result: "fail", bug_report_path: "memory/workflows/<project>/bug_reports/<task_id>_<timestamp>.md" }`

The orchestrator evaluates `conditions` (e.g., `result == 'pass'` → next task; `result == 'fail'` → `piece_N`) and passes `bug_report_path` to the developer task when branching back.
