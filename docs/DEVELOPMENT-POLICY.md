# Workflow-Engine Development Policy

**Effective**: All development on workflow-engine

---

## Git

- All development is **branch- or worktree-based**. No direct work on `main`.
- PRD and workflow YAML MUST contain the correct git information (branch name, worktree path if used, project path).
- On workflow initiation: branch or worktree MUST be created and setup before any development work.
- If ANY AI works outside the designated branch or worktree, the sprint or phase is **invalidated**.

---

## UAT and Merge

- **AI code review** and **AI UAT** (agent-browser) are automated pass/fail gates. No user approval per piece.
- On fail: reviewer or validator writes a bug report; developer fixes and resubmits.
- Final stage is **always** user UAT (HITL). **No push to main** until user approves.

---

## Orchestration

- All development must be done using orchestration (workflow-driven).
- Workflows define tasks, gates, and HITL. No ad-hoc development outside workflows.
