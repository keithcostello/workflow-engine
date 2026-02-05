# Phase C Web Status UI — Sprint PRD

**Sprint**: Phase C — Web Status UI  
**Project**: orchestration-training  
**Source**: ORCHESTRATION-ROADMAP.md  
**Methodology**: Walking skeleton (piece → validate)  
**Status**: Ready for execution  
**Workflow**: [phase-c-web-status-ui-workflow.yaml](../../workflows/phase-c-web-status-ui-workflow.yaml)

---

## Git Information (Canonical — Required)

| Field | Value |
|-------|-------|
| **Branch** | `feature/phase-c-web-status-ui` |
| **Worktree path** (optional) | `../workflow-engine-phase-c` |
| **Project path** | `workflow-engine/` (or workspace root) |
| **Rule** | All development on this branch/worktree. Work outside = sprint invalidated. No push to main until user UAT approves. |

---

## Walking Skeleton Methodology

**Reference**: [docs/design/walking-skeleton.md](../design/walking-skeleton.md)

- **Piece 0**: setup_git + validate_git (branch/worktree created and verified)
- **Piece 1**: Minimal server + read WAITING_ON.md
- **Piece 2**: Add workflow-state.json + execution-log
- **Piece 3**: Project list + pending gates UI
- **Gates**: UAT + code quality at each piece. Final stage = user UAT (HITL). No push to main until user approves.

---

## Goals and Success Criteria

- Web app reads memory files (WAITING_ON.md, workflow-state.json, execution-log.md)
- Local only; user passes workspace path
- Project status, pending gates displayed
- Location: `workflow-engine/web-status-ui/`

---

## Sprint Phases

| Phase | Task | Gate |
|-------|------|------|
| 0 | setup_git (create branch/worktree) + validate_git | Automated pass or STOP |
| 1 | Piece 1: Minimal server + WAITING_ON | Code review → AI UAT (agent-browser) → User UAT (HITL) |
| 2 | Piece 2: workflow-state.json + execution-log | Code review → AI UAT (agent-browser) → User UAT (HITL) |
| 3 | Piece 3: Project list + pending gates | Code review → AI UAT (agent-browser) → User UAT (HITL) |
| 4 | User UAT (final) | HITL — no push to main until approved |

**Per-piece gate sequence**: Developer implements → Code review (reviewer) → AI UAT (validator, agent-browser/Playwright) → User UAT (HITL)

---

## Invalidation Rule

If ANY AI works outside the designated branch or worktree, the entire Phase C sprint is **invalidated**. No exceptions.
