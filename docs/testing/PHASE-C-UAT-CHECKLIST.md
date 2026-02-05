# Phase C UAT Checklist

**User sign-off at each gate. No push to main until final UAT approved.**

---

## Gate 1 (After Piece 1)

- [ ] Server starts: `cd web-status-ui && npm run start`
- [ ] Open http://localhost:3456
- [ ] WAITING_ON.md content displayed for orchestration-training
- [ ] Code quality: `npm run lint` passes
- [ ] **Approve to proceed to Piece 2**

---

## Gate 2 (After Piece 2)

- [ ] workflow-state.json displayed when workflow paused
- [ ] execution-log last run status displayed
- [ ] **Approve to proceed to Piece 3**

---

## Gate 3 (After Piece 3)

- [ ] Project list displayed
- [ ] Pending gates shown per project
- [ ] **Approve Phase C complete**

---

## Final UAT

- [ ] Full Phase C validated
- [ ] **Approve to allow push to main** (no push until approved)
