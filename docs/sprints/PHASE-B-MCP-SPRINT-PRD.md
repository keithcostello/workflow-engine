# Phase B MCP Server — Sprint PRD

**Sprint**: Phase B — MCP Server (MVP 3)  
**Project**: orchestration-training  
**Source**: ORCHESTRATION-ROADMAP.md, IMPLEMENTATION-PLAN.md  
**Methodology**: Walking skeleton (piece → HITL validate)  
**Status**: Ready for execution  
**Workflow**: [phase-b-mcp-sprint-workflow.yaml](../../workflows/phase-b-mcp-sprint-workflow.yaml)

---

## Walking Skeleton Methodology (Required)

> **If we are not building using walking skeleton methodology, we are doing this wrong.**

**Reference**: [docs/design/walking-skeleton.md](../design/walking-skeleton.md)

Phase B **must** be built using walking skeleton:

- **Definition 2**: Sprint broken into functional pieces; each piece is tested and validated before the next is added.
- **Pattern**: `[Piece] → HITL validate → [Piece] → HITL validate → ...`
- **HITL gates** confirm "walking skeleton validated" — human must confirm each piece before proceeding.
- **Validation**: After completion, run [WALKING-SKELETON-TEST.md](../testing/WALKING-SKELETON-TEST.md) checklist.

---

## Goals and Success Criteria

- MCP server exposes tools to Cursor AI: `workflow_get_active`, `workflow_list`, `workflow_load`, `workflow_handle_hitl`
- Works via stdio transport (Cursor spawns process)
- No Python install required
- Validated: `npm install` + `npm run build` + Cursor MCP config → tools available

---

## Sprint Phases (Walking Skeleton Flow)

```mermaid
flowchart LR
    PM[PM PRD] --> H1[HITL]
    H1 --> Arch[Architect]
    Arch --> H2[HITL]
    H2 --> P1[Piece 1]
    P1 --> H3[HITL]
    H3 --> P2[Piece 2]
    P2 --> H4[HITL]
    H4 --> P3[Piece 3]
    P3 --> H5[HITL]
    H5 --> Rev[Reviewer]
    Rev --> H6[HITL]
    H6 --> UAT[UAT]
    UAT --> H7[HITL]
    H7 --> Done[Complete]
```

| Phase | Role      | Task                                 | HITL Gate (Walking Skeleton Confirm)           |
| ----- | --------- | ------------------------------------ | ---------------------------------------------- |
| 1     | PM        | Create PRD                           | "PRD complete. Walking skeleton validated?"    |
| 2     | Architect | Design MCP structure                 | "Design approved. Walking skeleton validated?"  |
| 3a    | Developer | **Piece 1**: package + tsconfig      | "Package builds. Walking skeleton validated?"   |
| 3b    | Developer | **Piece 2**: server.ts (stdio)      | "Server starts. Walking skeleton validated?"    |
| 3c    | Developer | **Piece 3**: workflowManager + tools  | "Tools work. Walking skeleton validated?"       |
| 4     | Reviewer  | Review code                          | "Pass or fail?" (on_fail → Developer)           |
| 5     | Tester    | UAT                                  | "UAT pass or fail?"                             |
| 6     | Developer | Complete                             | Info, auto_continue                             |

---

## Task Details (Walking Skeleton Pieces + HITL)

### Phase 1 — PM

- Create PRD: goals, scope, deliverables, acceptance criteria
- Output: `docs/sprints/PHASE-B-MCP-SPRINT-PRD.md` (this document)
- **HITL**: Approval — "PRD complete. **Walking skeleton validated?** Proceed to Architect?"

### Phase 2 — Architect

- Design: `mcp-server/` structure, package.json, tsconfig, src layout
- Define: workflowManager, server, tools schema
- Output: Architecture section in PRD or `docs/design/MCP-SERVER-ARCHITECTURE.md`
- **HITL**: Approval — "Design approved. **Walking skeleton validated?** Proceed to Developer?"

### Phase 3 — Developer (Walking Skeleton Pieces)

| Piece | Deliverable                               | Validation                                         | HITL Gate                                                                 |
| ----- | ----------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------- |
| **3a** | package.json, tsconfig.json, minimal src/ | `npm install` + `npm run build` succeeds           | "Package builds. **Walking skeleton validated?** Proceed to Piece 2?"      |
| **3b** | server.ts with stdio transport, empty tools | Server starts (no crash)                         | "Server starts. **Walking skeleton validated?** Proceed to Piece 3?"      |
| **3c** | workflowManager.ts + 4 tools              | Tools appear in Cursor, workflow_list returns data | "Tools work. **Walking skeleton validated?** Proceed to Reviewer?"         |

- Dependencies: @modelcontextprotocol/sdk, js-yaml, zod
- **No piece is added until HITL confirms the previous piece.**

### Phase 4 — Reviewer

- Review: code quality, alignment with IMPLEMENTATION-PLAN, error handling
- Output: Review notes, pass/fail
- **HITL**: Question — "Pass or fail?" (on_fail → Phase 3 Developer, last piece)

### Phase 5 — Tester (UAT)

- Run: `npm install`, `npm run build` (PowerShell-compatible)
- Validate: Server starts, tools listed
- Config: Cursor MCP config example
- Output: UAT pass/fail
- **HITL**: Question — "UAT pass or fail?" (on_fail → Phase 3 Developer)

### Phase 6 — Complete

- Update: WAITING_ON.md, GLOBAL_DAILY_LOG.md
- Info gate: Sprint complete
- **Post-validation**: Run WALKING-SKELETON-TEST.md checklist

---

## Deliverables

- `mcp-server/` — TypeScript MCP server (package.json, src/, dist/)
- `docs/sprints/PHASE-B-MCP-SPRINT-PRD.md` — This PRD
- Cursor MCP config snippet in README or docs

---

## Dependencies and Blockers

- Node.js >= 18
- npm (or pnpm)
- Cursor with MCP support

---

## Out of Scope (Phase F)

- GitHub deployment validation
- Web UI (Phase C/D)
