# Orchestration Roadmap

**Single source of truth** for features, goals, phases, and alignment.

**Source**: Orchestration Project Consolidation plan (2025-02-05)

---

## Goals (8)

| # | Goal | Phase |
|---|------|-------|
| 1 | Docker container + complex hello world (before MCP) | Phase A |
| 2 | Change workflows, add agents/HITL | YAML works now; web builder in Phase D |
| 3 | Extensive scenario testing at each gate | Phase A |
| 4 | MCP setup | Phase B (deferred until Docker + gate testing done) |
| 5 | Web interface: status + pending gates | Phase C |
| 6 | Web interface: build workflow | Phase D |
| 7 | GitHub deployable — terminal install | Phase E |
| 8 | Standalone GitHub plugin for Cursor — validate deployment | Phase F |

---

## Feature Inventory

| Feature | Status | Phase |
|---------|--------|-------|
| Workflow execution (YAML) | Done | — |
| HITL gates (approval, question, info, none, ad-hoc) | Done | — |
| Resume workflow (resume-sprint, resume project [name]) | Done | — |
| Execution log (LOG_ROW_PROTOCOL) | Done | — |
| Workflow modification (YAML edit) | Done | — |
| build_docker action | Done | Phase A |
| docker-hello-workflow.yaml | Done | Phase A |
| Gate scenario matrix | Done | Phase A |
| **Orchestrator + Subagents** | **Done** | **Phase A.5** |
| Subagents (developer, reviewer, etc.) | Done | Phase A.5 |
| Agent memory (per sprint) | Done | Phase A.5 |
| MCP server | Deferred | Phase B |
| Single compact loop (review→modify→review, max N) | Planned | Phase B (MVP 3) |
| GitHub deployment validation (Cursor plugin) | Planned | Phase F |
| Web status UI | Planned | Phase C |
| Web workflow builder | Planned | Phase D |
| Terminal install (install.sh, install.ps1) | Done | Phase E |

---

## Phases

### Phase A (Complete): Docker + Gate Testing

- ✅ Add `build_docker`, `run_container` actions to workflow-executor
- ✅ Create `docker-hello-workflow.yaml` + `workflows/docker-hello/`
- ✅ Create GATE-SCENARIO-MATRIX.md
- Fill scenario gaps (manual testing)

**Goals**: 1, 3

### Phase A.5 (Complete): Orchestrator + Subagents

- ✅ Orchestrator (workflow-executor) delegates all tasks to subagents; never does work; on failure: HITL, pause, no workarounds
- ✅ Subagents at `.cursor/agents/` (developer, reviewer, validator, architect, pm, tester)
- ✅ Agent memory: `memory/workflows/[project]/[role]_sprint_[id].md`
- ✅ HITL relayed to user (human in Cursor)
- Test B: minimal-workflow with subagents + HITL
- Test C: docker-hello-workflow (Phase A) with subagents

**Docs**: docs/design/agent-memory.md, docs/design/sprint-context.md

### Phase B: MCP Server (MVP 3)

- MCP server with workflow_get_active, execute_task, handle_hitl
- **Single compact loop**: review→modify→review with max_attempts (e.g. code review after create_file, up to 3 cycles, then escalate)
- Deferred until Phase A complete

**Interim**: Use explicit 3× pattern (review_1→modify_1→review_2→modify_2→review_3→escalate) until compact loop ships.

**Goals**: 4

### Phase F: GitHub Deployment — Cursor Plugin Validation

- Validate orchestration-training as standalone GitHub plugin for Cursor
- Package for install from GitHub (clone → install → configure Cursor MCP)
- End-to-end validation: fresh clone → working in Cursor
- **Sequence**: After Phase B (MCP). Gate before Phase C/D.

**Goals**: 8

### Phase C: Web Status UI

- Web app reading memory files (workflow-state.json, WAITING_ON.md)
- Project status, pending gates
- Web-first (faster than Cursor Extension)

**Goals**: 5

### Phase D: Web Workflow Builder

- Web app to build/edit workflow YAML
- Add tasks, agents, HITL requirements
- Web-first

**Goals**: 6

### Phase E: GitHub Deployable — Terminal Install

- ✅ `install.sh` (Unix/macOS)
- ✅ `install.ps1` (Windows)
- ✅ README: Install instructions

**Goals**: 7

---

## Mandatory Gate

**Orchestration tool validation** required at end of every sprint/phase test. Run [ORCHESTRATION-TOOL-VALIDATION.md](testing/ORCHESTRATION-TOOL-VALIDATION.md) (OT0–OT33). No workarounds. Features marked "Not Used" require user verification before sprint approval. Sprint fails if any check fails.

---

## Phase Sequence

```
A (done) → A.5 (done) → E (done) → B → F → C → D
```

Phase F (GitHub deployment validation) follows Phase B. Validates standalone Cursor plugin before web UI work.

## Decisions

| Topic | Decision |
| Web vs Cursor Extension | Web-first for status and workflow builder (faster) |
| MCP priority | Defer until Docker + gate testing done |
| GitHub deployable | Terminal install — boss runs install script from repo |
| Standalone Cursor plugin | Phase F validates GitHub deployment after MCP (Phase B) |
| Compact loop (review→modify×N) | Add to MVP 3; use verbose 3× pattern until then |

---

## Related Docs

- [GATE-SCENARIO-MATRIX.md](testing/GATE-SCENARIO-MATRIX.md) — Per-gate scenarios
- [IMPLEMENTATION-PLAN.md](design/IMPLEMENTATION-PLAN.md) — MCP design
- [HANDOFF-SCENARIO-TEST-LOG.md](testing/HANDOFF-SCENARIO-TEST-LOG.md) — Existing coverage
