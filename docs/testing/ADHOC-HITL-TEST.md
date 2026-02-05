# Ad-hoc HITL Test

**Purpose**: Test that the AI stops during a sprint and asks questions of the human (forced ad-hoc HITL).

**Date**: 2025-02-05

---

## What Is Ad-hoc HITL?

**Scheduled HITL**: Predefined gates in the workflow (approval, question, info, none). The AI pauses at these by design.

**Ad-hoc HITL**: The AI **stops on its own** to ask the human—outside any scheduled gate. Triggers:
- Task has `adhoc_hitl` with `trigger: "before_action"`
- Params contain `{{ask_user}}` placeholder
- AI encounters ambiguity and chooses to ask
- Missing info required to proceed

---

## Test Scenario

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | Ad-hoc before action | Task with adhoc_hitl | AI reaches task | AI STOPS, shows question, waits for user |
| 2 | User provides input | AI asked ad-hoc question | User responds | AI uses response, continues execution |
| 3 | Multiple ad-hoc points | adhoc-hitl-workflow | Full run | AI stops at each adhoc_hitl; never proceeds without input |

---

## Workflow: adhoc-hitl-workflow.yaml

**Tasks with ad-hoc HITL**:
1. **modify_with_adhoc**: `adhoc_hitl.question` = "What content should I append?"
2. **decide_path**: `adhoc_hitl.question` = "Path A or Path B?" with options

**Expected behavior**:
- AI reaches modify_with_adhoc → STOPS → Shows question → Waits
- User: "Test content from human" → AI appends that, continues
- AI reaches decide_path → STOPS → Shows question → Waits
- User: "Path A" or "Path B" → AI appends chosen text, continues

---

## How to Run

1. Execute: "Execute workflows/adhoc-hitl-workflow.yaml"
2. At create_file: Approve (yes)
3. **At modify_with_adhoc**: AI must STOP and ask "What content should I append?" — respond with any text
4. Approve the modification
5. **At decide_path**: AI must STOP and ask "Path A or Path B?" — respond with one
6. Workflow completes

---

## Pass Criteria

- [x] AI stops at modify_with_adhoc before executing (does not guess or use placeholder)
- [x] AI stops at decide_path before executing
- [x] Execution log contains `adhoc_hitl_reached` and `adhoc_hitl_response` events
- [x] artifacts/adhoc-demo.txt contains user-provided content

**Status**: PASS (2025-02-05)

---

## Execution Log Events

| Event | When |
|-------|------|
| `adhoc_hitl_reached` | AI shows ad-hoc question, blocks |
| `adhoc_hitl_response` | User responded; param filled |
