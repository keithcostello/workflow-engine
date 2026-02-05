# Phase D Web Workflow Builder — Sprint PRD

**Sprint**: Phase D — Web Workflow Builder  
**Project**: orchestration-training  
**Source**: ORCHESTRATION-ROADMAP.md  
**Methodology**: Walking skeleton (piece → validate)  
**Status**: Ready for execution  
**UI Spec**: [PHASE-D-UI-SPEC.md](PHASE-D-UI-SPEC.md)

---

## Git Information (Canonical — Required)

| Field | Value |
|-------|-------|
| **Branch** | `feature/phase-d-web-workflow-builder` |
| **Worktree path** (optional) | `../workflow-engine-phase-d` |
| **Project path** | `workflow-engine/` (or workspace root) |
| **Rule** | All development on this branch/worktree. Work outside = sprint invalidated. No push to main until user UAT approves. |

---

## Walking Skeleton Methodology

**Reference**: [docs/design/walking-skeleton.md](../design/walking-skeleton.md)

- **Piece 0**: setup_git + validate_git (branch/worktree created and verified)
- **Piece 1**: Minimal web app; list workflows from `workflows/`; view YAML (read-only)
- **Piece 2**: Edit workflow name, version; add/edit/remove roles
- **Piece 3**: Add/edit/remove tasks; configure HITL (type, message, options); configure on_complete routing
- **Dashboard**: Project status with project selector; pending messages (extends Phase C web-status-ui)
- **Gates**: Code review (AI) → AI UAT (agent-browser) at each piece. Fail → bug report → developer fixes and resubmits. Final stage = user UAT (HITL). No push to main until user approves.

---

## Goals and Success Criteria

- Web app to build/edit workflow YAML
- Project status dashboard with project selector (multiple projects)
- Pending messages display (HITL gates awaiting user response)
- Add tasks, agents, HITL requirements
- Web-first; location: extend `workflow-engine/web-status-ui/` or add `workflow-builder/`

---

## UI Expectations

All UI screens, functions, and visual quality expectations are defined in [PHASE-D-UI-SPEC.md](PHASE-D-UI-SPEC.md). That document is the canonical spec for look, feel, and behavior.

---

## Sprint Phases

| Phase | Task | Gate |
|-------|------|------|
| 0 | setup_git (create branch/worktree) + validate_git | Automated pass or STOP |
| 1 | Piece 1: List workflows + view YAML (read-only) | Code review (AI) → AI UAT (agent-browser). Fail → bug report → resubmit |
| 2 | Piece 2: Edit workflow name, version; add/edit/remove roles | Code review (AI) → AI UAT (agent-browser). Fail → bug report → resubmit |
| 3 | Piece 3: Add/edit/remove tasks; configure HITL; on_complete routing | Code review (AI) → AI UAT (agent-browser). Fail → bug report → resubmit |
| 4 | Dashboard: Project selector + pending messages | Code review (AI) → AI UAT (agent-browser). Fail → bug report → resubmit |
| 5 | User UAT (final) | HITL — no push to main until approved |

**Per-piece gate sequence**: Developer implements → Code review (reviewer, pass/fail) → AI UAT (validator, agent-browser). On fail: bug report written; developer fixes and resubmits. User UAT only at final.

---

## Invalidation Rule

If ANY AI works outside the designated branch or worktree, the entire Phase D sprint is **invalidated**. No exceptions.
