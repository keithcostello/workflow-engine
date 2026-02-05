# Gate Scenario Matrix

**Purpose**: Exhaustive "what could happen at each gate?" — mark tested/untested.

**Reference**: [HANDOFF-SCENARIO-TEST-LOG.md](HANDOFF-SCENARIO-TEST-LOG.md) for existing coverage.

---

## Approval Gate

| # | Scenario | Tested | Notes |
|---|----------|--------|-------|
| A1 | User approves (yes/approve) | Yes | H2.1 |
| A2 | User rejects, no on_no (blocked) | Yes | H2.2 |
| A3 | User rejects, on_no branch | Yes | H2.3 |
| A4 | User says invalid (re-prompt) | Yes | H2.7 (question) — approval similar |
| A5 | User closes Cursor (resume-sprint) | Yes | RESUME-SPRINT-TEST |
| A6 | Timeout (if timeout configured) | No | Not implemented |

---

## Question Gate

| # | Scenario | Tested | Notes |
|---|----------|--------|-------|
| Q1 | User selects option A (continue) | Yes | H2.4 |
| Q2 | User selects option B (on_no branch) | Yes | H2.5 |
| Q3 | User selects option B (on_fail branch) | Yes | H2.6 |
| Q4 | User says invalid option (re-prompt) | Yes | H2.7 |
| Q5 | User closes Cursor (resume-sprint) | Yes | RESUME-SPRINT-TEST |
| Q6 | Timeout (if timeout configured) | No | Not implemented |

---

## Info Gate

| # | Scenario | Tested | Notes |
|---|----------|--------|-------|
| I1 | auto_continue: true (no wait) | Yes | H2.8 |
| I2 | auto_continue: false (wait approval) | Yes | H2.9 |
| I3 | User closes Cursor during info wait | No | Edge case |

---

## None Gate

| # | Scenario | Tested | Notes |
|---|----------|--------|-------|
| N1 | No interaction, continue | Yes | H2.10 |

---

## Ad-hoc HITL

| # | Scenario | Tested | Notes |
|---|----------|--------|-------|
| AH1 | Free-text param ({{ask_user}}) | Yes | ADHOC-HITL-TEST modify_with_adhoc |
| AH2 | Option param (options list) | Yes | ADHOC-HITL-TEST decide_path |
| AH3 | User closes Cursor (resume-sprint) | Yes | workflow-state.json |
| AH4 | Invalid option (re-prompt) | No | Edge case |

---

## Retry (Task → Task)

| # | Scenario | Tested | Notes |
|---|----------|--------|-------|
| R1 | Retry under max_attempts | Yes | H3.1 |
| R2 | Retry exhausted (escalate) | Yes | H3.2 |
| R3 | on_error: retry | Yes | H3.3 |
| R4 | on_error: task_id (branch) | Yes | H3.4 |

---

## Branch (Task → Task)

| # | Scenario | Tested | Notes |
|---|----------|--------|-------|
| B1 | on_complete: next | Yes | H4.1 |
| B2 | on_complete: task_id | Yes | H4.2 |
| B3 | on_complete: complete | Yes | H4.3 |
| B4 | conditions: if match | Yes | H4.4 |
| B5 | conditions: no match (default next) | Yes | H4.5 |

---

## Gaps to Fill

| Scenario | Priority | Action |
|----------|----------|--------|
| A6, Q6 | Low | Timeout not in YAML schema yet |
| I3 | Low | Test info gate + resume |
| AH4 | Low | Test invalid option at ad-hoc |
| C3 (add branch option) | Medium | Exercise in customization proof |
