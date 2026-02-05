# Phase C Walking Skeleton Validation

**Reference**: [PHASE-C-PRD.md](../sprints/PHASE-C-PRD.md), [phase-c-web-status-ui-workflow.yaml](../../workflows/phase-c-web-status-ui-workflow.yaml)

---

## Piece 0: setup_git + validate_git

| Check | Pass Criteria |
|-------|---------------|
| WS-C0.1 | setup_git creates/checks out branch feature/phase-c-web-status-ui |
| WS-C0.2 | validate_git exits 0 when on correct branch |
| WS-C0.3 | No development work before both pass |

---

## Piece 1: Minimal server + WAITING_ON

| Check | Pass Criteria |
|-------|---------------|
| WS-C1.1 | Server starts (npm run start in web-status-ui) |
| WS-C1.2 | WORKSPACE_ROOT points to workflow-engine (or correct workspace) |
| WS-C1.3 | Browser at http://localhost:3456 shows WAITING_ON content |
| WS-C1.4 | ESLint passes (npm run lint) |

---

## Piece 2: workflow-state.json + execution-log

| Check | Pass Criteria |
|-------|---------------|
| WS-C2.1 | UI reads workflow-state.json when present |
| WS-C2.2 | UI reads execution-log.md, shows last run status |
| WS-C2.3 | Paused state displayed when workflow paused |

---

## Piece 3: Project list + pending gates

| Check | Pass Criteria |
|-------|---------------|
| WS-C3.1 | UI scans memory/projects/* |
| WS-C3.2 | UI lists all projects |
| WS-C3.3 | UI shows pending gates (paused workflows) per project |
