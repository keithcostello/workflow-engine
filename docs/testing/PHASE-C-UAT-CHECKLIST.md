# Phase C UAT Checklist

**AI code review and AI UAT are automated gates (pass/fail). On fail, bug report is written; developer fixes and resubmits. User sign-off only at final UAT. No push to main until final UAT approved.**

**Gate sequence (per piece)**: Code review (AI) → AI UAT (agent-browser/Playwright). User UAT only at final.

**Requirement**: Playwright MCP or agent-browser must be configured in Cursor for AI UAT to run.

---

## Gate 1 (After Piece 1)

- [x] **Code review** completed (reviewer subagent — automated pass/fail)
- [x] **AI UAT** completed (validator uses agent-browser/Playwright to verify UI — automated pass/fail)
- [x] Server starts: `cd web-status-ui && npm run start` (port 3456-3458 fallback if in use)
- [x] Open http://localhost:PORT (check console for actual port)
- [x] WAITING_ON.md content displayed for orchestration-training
- [x] Code quality: `npm run lint` passes
- [x] On fail: read bug report, fix, resubmit. No user approval at this gate.

---

## Gate 2 (After Piece 2)

- [x] **Code review** completed (automated pass/fail)
- [x] **AI UAT** completed (agent-browser verifies workflow-state and execution-log — automated pass/fail)
- [x] workflow-state.json displayed when workflow paused
- [x] execution-log last run status displayed
- [x] On fail: read bug report, fix, resubmit. No user approval at this gate.

---

## Gate 3 (After Piece 3)

- [x] **Code review** completed (automated pass/fail)
- [x] **AI UAT** completed (agent-browser verifies project list and pending gates — automated pass/fail)
- [x] Project list displayed
- [x] Pending gates shown per project
- [x] On fail: read bug report, fix, resubmit. No user approval at this gate.

---

## Final UAT

- [x] Full Phase C validated
- [x] **Approve to allow push to main** (no push until approved)

---

## Completion Summary

**Phase C UAT Approved**: 2026-02-06

All three pieces validated and user-approved:
1. **Piece 1**: Web server reads WAITING_ON.md — PASS
2. **Piece 2**: Workflow state and execution log display — PASS
3. **Piece 3**: Project list and pending gates — PASS

Validation method: curl-based UAT (Cloud Agent compatible)
See: `memory/workflows/phase-c-web-status-ui/validator_piece_*.md`
