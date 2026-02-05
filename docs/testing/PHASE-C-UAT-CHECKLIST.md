# Phase C UAT Checklist

**User sign-off at each gate. No push to main until final UAT approved.**

**Gate sequence (per piece)**: Code review → AI UAT (agent-browser/Playwright) → User UAT (HITL)

**Requirement**: Playwright MCP or agent-browser must be configured in Cursor for AI UAT to run.

---

## Gate 1 (After Piece 1)

- [ ] **Code review** completed (reviewer subagent)
- [ ] **AI UAT** completed (validator uses agent-browser/Playwright to verify UI)
- [ ] Server starts: `cd web-status-ui && npm run start` (port 3456-3458 fallback if in use)
- [ ] Open http://localhost:PORT (check console for actual port)
- [ ] WAITING_ON.md content displayed for orchestration-training
- [ ] Code quality: `npm run lint` passes
- [ ] **User UAT: Approve to proceed to Piece 2**

---

## Gate 2 (After Piece 2)

- [ ] **Code review** completed
- [ ] **AI UAT** completed (agent-browser verifies workflow-state and execution-log)
- [ ] workflow-state.json displayed when workflow paused
- [ ] execution-log last run status displayed
- [ ] **User UAT: Approve to proceed to Piece 3**

---

## Gate 3 (After Piece 3)

- [ ] **Code review** completed
- [ ] **AI UAT** completed (agent-browser verifies project list and pending gates)
- [ ] Project list displayed
- [ ] Pending gates shown per project
- [ ] **User UAT: Approve Phase C complete**

---

## Final UAT

- [ ] Full Phase C validated
- [ ] **Approve to allow push to main** (no push until approved)
