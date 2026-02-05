# Phase C UAT Checklist

**AI code review and AI UAT are automated gates (pass/fail). On fail, bug report is written; developer fixes and resubmits. User sign-off only at final UAT. No push to main until final UAT approved.**

**Gate sequence (per piece)**: Code review (AI) → AI UAT (agent-browser/Playwright). User UAT only at final.

**Requirement**: Playwright MCP or agent-browser must be configured in Cursor for AI UAT to run.

---

## Gate 1 (After Piece 1)

- [ ] **Code review** completed (reviewer subagent — automated pass/fail)
- [ ] **AI UAT** completed (validator uses agent-browser/Playwright to verify UI — automated pass/fail)
- [ ] Server starts: `cd web-status-ui && npm run start` (port 3456-3458 fallback if in use)
- [ ] Open http://localhost:PORT (check console for actual port)
- [ ] WAITING_ON.md content displayed for orchestration-training
- [ ] Code quality: `npm run lint` passes
- [ ] On fail: read bug report, fix, resubmit. No user approval at this gate.

---

## Gate 2 (After Piece 2)

- [ ] **Code review** completed (automated pass/fail)
- [ ] **AI UAT** completed (agent-browser verifies workflow-state and execution-log — automated pass/fail)
- [ ] workflow-state.json displayed when workflow paused
- [ ] execution-log last run status displayed
- [ ] On fail: read bug report, fix, resubmit. No user approval at this gate.

---

## Gate 3 (After Piece 3)

- [ ] **Code review** completed (automated pass/fail)
- [ ] **AI UAT** completed (agent-browser verifies project list and pending gates — automated pass/fail)
- [ ] Project list displayed
- [ ] Pending gates shown per project
- [ ] On fail: read bug report, fix, resubmit. No user approval at this gate.

---

## Final UAT

- [ ] Full Phase C validated
- [ ] **Approve to allow push to main** (no push until approved)
