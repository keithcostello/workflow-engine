# Component AI Architecture

## Core Requirement

**Each component needs an AI whose job is to know what to do at each intersection or component that exists.**

This means:
- Projects are **queryable** (you can ask questions)
- Components have **dedicated AI roles** (each knows its job)
- There's **monitoring and interaction** capability
- Each component **knows its responsibilities** at intersections

---

## Architecture: Orchestrator + Subagents

```
┌─────────────────────────────────────────┐
│         Project Query Layer             │
│  "What's the status of this project?"   │
│  "What workflows are assigned?"        │
│  "What's blocking?"                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Orchestrator (workflow-executor)    │
│  - Loads workflow YAML                  │
│  - Delegates all tasks to subagents     │
│  - Never does work; on failure: HITL    │
│  - Relays HITL to user (human)          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Subagents (.cursor/agents/)         │
│  developer | reviewer | validator       │
│  architect | pm | tester                │
│  - Execute tasks in own context         │
│  - Persistent memory per sprint         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      Query / Coordination AIs            │
│  Project AI | Workflow AI | HITL AI     │
│  (rules in .cursor/rules/)              │
└─────────────────────────────────────────┘
```

**HITL = the user (human in Cursor).** The orchestrator shows prompts and waits for user response. No HITL subagent—the human is the loop.

---

## Component AI Roles

### 1. Project AI

**Job**: Know everything about a project

**Knows**:
- Project state (what's done, what's next)
- Assigned workflows
- Current blockers
- Project history
- Related components

**Can Answer**:
- "What's the status of orchestration-training?"
- "What workflows are assigned?"
- "What's blocking this project?"
- "What's been completed?"
- "What's next?"

**At Intersections**:
- When workflow completes → Updates project state
- When blocker occurs → Reports to user
- When status changes → Notifies relevant components

---

### 2. Workflow AI

**Job**: Know everything about workflows

**Knows**:
- All workflows (global and project-specific)
- Workflow definitions
- Execution state
- Which workflows are assigned to which projects
- Workflow history

**Can Answer**:
- "What workflows are available?"
- "What's the status of workflow X?"
- "How do I create a workflow?"
- "What workflows are assigned to this project?"

**At Intersections**:
- When workflow assigned → Notifies Project AI
- When workflow executes → Updates execution state
- When workflow completes → Reports to Project AI

---

### 3. Orchestrator (Workflow Executor)

**Job**: Central coordinator for workflow execution

**Responsibilities**:
- Load workflow YAML, initialize sprint context
- **Delegate** all tasks to subagents by role (developer, reviewer, etc.)
- **Never** execute actions; on subagent failure: notify HITL, pause sprint/project, no workarounds
- **Relay HITL** to the user (human in Cursor)—show prompt, wait for response, branch
- Log execution, persist state for resume-sprint

**File**: `.cursor/rules/workflow-executor.mdc`

---

### 4. Subagents (Role-Based)

**Job**: Execute tasks in their domain

**Subagents** (`.cursor/agents/` at workspace root):
- **developer**: create_file, modify_file, build_docker, run_container
- **reviewer**: review
- **validator**, **architect**, **pm**, **tester**: domain-specific tasks

**Each subagent**:
- Has persistent memory per sprint: `memory/workflows/[project]/[role]_sprint_[id].md`
- Receives task from orchestrator, executes, returns result
- Does NOT handle HITL—orchestrator relays to user

**See**: `docs/design/agent-memory.md`, `docs/design/sprint-context.md`

---

### 5. HITL (Human in the Loop)

**HITL = the user (human in Cursor).** The orchestrator relays prompts to the user and waits for response.

**Orchestrator** (when gate reached):
- Writes workflow-state.json (for resume-sprint)
- Shows prompt: `[HITL] Approval: [message]` or `[HITL] Question: [message]`
- Waits for user response in chat
- Processes response, branches or continues
- Clears workflow-state.json after response

**HITL AI rule** (`.cursor/rules/hitl-ai.mdc`): Answers queries like "What gate is waiting?" by reading workflow-state.json and workflow YAML.

---

## Project Query System

### How It Works

**You ask**: "What's the status of orchestration-training?"

**System**:
1. **Project AI** reads project memory
2. **Project AI** checks workflow assignments
3. **Project AI** checks current state
4. **Project AI** reports status

**Response**:
```
Project: orchestration-training
Status: In Progress
Current Workflow: minimal-workflow.yaml (Stage 2)
Blockers: None
Completed: Stage 1 (Create File)
Next: Stage 3 (Review)
```

---

### Query Examples

**Project Queries**:
- "What's the status of orchestration-training?"
- "What workflows are assigned?"
- "What's blocking?"
- "What's been completed?"
- "What's next?"

**Workflow Queries**:
- "What workflows are available?"
- "What's the status of minimal-workflow?"
- "How do I create a workflow?"
- "What's assigned to this project?"

**Task Queries**:
- "What task is running?"
- "What's the status of task X?"
- "How many retries?"
- "What's next?"

**HITL Queries**:
- "What gate is waiting?"
- "What are my options?"
- "What happens if I say 'no'?"

---

## Component Intersections

### Intersection 1: Workflow → Project

**When**: Workflow assigned to project

**What Happens**:
1. **Workflow AI** assigns workflow
2. **Workflow AI** notifies **Project AI**
3. **Project AI** updates project state
4. **Project AI** records assignment

**You Can Ask**: "What workflows are assigned to orchestration-training?"

---

### Intersection 2: Task → HITL (Orchestrator → User)

**When**: Task reaches HITL gate

**What Happens**:
1. **Orchestrator** delegates task to subagent (never executes)
2. **Subagent** completes action, returns to orchestrator
3. **Orchestrator** reaches HITL gate
4. **Orchestrator** writes workflow-state.json, shows prompt to **user** (human)
5. **User** responds in Cursor chat
6. **Orchestrator** processes response, branches or continues
7. **Orchestrator** clears workflow-state.json, moves to next task

**You Can Ask**: "What gate is waiting?" (HITL AI rule answers from state)

---

### Intersection 3: Task → Task (Retry)

**When**: Task fails or user rejects

**What Happens**:
1. **Orchestrator** detects failure/rejection (from subagent or user response)
2. **Orchestrator** checks retry count
3. **Orchestrator** loops back to same task (retry)
4. **Orchestrator** updates retry count
5. **Orchestrator** notifies **Project AI** of retry (STANDARD_MEMORY_UPDATE)

**You Can Ask**: "How many retries for this task?"

---

### Intersection 4: Task → Task (Branch)

**When**: Condition met or user response triggers branch

**What Happens**:
1. **Orchestrator** receives subagent result or evaluates condition
2. **Orchestrator** evaluates conditions
3. **Orchestrator** branches to different task
4. **Orchestrator** updates current task index
5. **Orchestrator** continues execution

**You Can Ask**: "What path did the workflow take?"

---

### Intersection 5: Workflow → Project (Complete)

**When**: Workflow completes

**What Happens**:
1. **Orchestrator** delegates `complete` task to subagent (e.g., developer)
2. **Subagent** returns; orchestrator marks workflow complete
3. **Orchestrator** marks workflow complete, logs workflow_complete
4. **Orchestrator** executes STANDARD_MEMORY_UPDATE (Project AI)
5. **Project AI** updates WAITING_ON.md, GLOBAL_DAILY_LOG.md

**You Can Ask**: "Did the workflow complete?" or "What's the project status?"

---

## Implementation: Rules and Subagents

### Orchestrator Rule

**File**: `.cursor/rules/workflow-executor.mdc`

**Job**: Central orchestrator—delegate all tasks to subagents, relay HITL to user. Never does work. On subagent failure: HITL, pause, no workarounds.

**Can Do**:
- Load workflow, initialize sprint context
- Delegate all tasks to subagents by role
- Never execute actions; on failure: notify HITL, pause
- Show HITL prompts to user, wait for response
- Log execution, persist state

---

### Subagents

**Location**: `.cursor/agents/` (workspace root, shared across projects)

**Files**: `developer.md`, `reviewer.md`, `validator.md`, `architect.md`, `pm.md`, `tester.md`

**Job**: Execute tasks in their domain, use persistent memory per sprint

**See**: `docs/design/agent-memory.md`

---

### Project AI Rule

**File**: `.cursor/rules/project-ai.mdc`

**Job**: Answer questions about projects

**Can Do**:
- Read project memory (WAITING_ON.md, `memory/workflows/<project>/execution-log.md`)
- Answer project queries
- Update project state (STANDARD_MEMORY_UPDATE)

---

### Workflow AI Rule

**File**: `.cursor/rules/workflow-ai.mdc`

**Job**: Answer questions about workflows

**Can Do**:
- List workflows
- Answer workflow queries
- Coordinate execution (orchestrator performs)

---

### Task AI Rule

**File**: `.cursor/rules/task-ai.mdc`

**Job**: Answer questions about task status (execution is done by orchestrator + subagents)

**Can Do**:
- Answer "What task is running?"
- Read workflow-state.json, execution log

---

### HITL AI Rule

**File**: `.cursor/rules/hitl-ai.mdc`

**Job**: Answer questions about HITL gates (orchestrator relays to user)

**Can Do**:
- Answer "What gate is waiting?"
- Read workflow-state.json, workflow YAML

---

## Project Monitoring

### What You Can Monitor

**Project Level**:
- Status (not started, in progress, complete, blocked)
- Assigned workflows
- Current stage
- Blockers
- Completed items
- Next actions

**Workflow Level**:
- Execution state (not started, running, paused, complete)
- Current task
- HITL gates waiting
- Retry counts
- Branch path taken

**Task Level**:
- Task status
- Execution progress
- Retry attempts
- Next task

**HITL Level**:
- Pending gates
- Gate history
- User responses
- Branch decisions

---

## Interaction Examples

### Example 1: Query Project Status

**You**: "What's the status of orchestration-training?"

**Project AI**: 
```
Project: orchestration-training
Status: In Progress
Current Workflow: minimal-workflow.yaml
Current Stage: Stage 2 (Modify File)
HITL Gate: Question - "Does it look correct?"
Blockers: None
Completed: Stage 1
Next: Stage 3 (Review)
```

---

### Example 2: Query Workflow

**You**: "What's the status of minimal-workflow?"

**Workflow AI**:
```
Workflow: minimal-workflow.yaml
Status: Running
Current Task: modify_file (Task 2/4)
Retry Count: 1
HITL Gate: Waiting for user response
Progress: 50% (2 of 4 tasks complete)
```

---

### Example 3: Query HITL Gate

**You**: "What gate is waiting?"

**HITL AI**:
```
Current HITL Gate:
Type: Question
Message: "File modified. Does it look correct?"
Options: yes, no
If "no": Loops back to modify_file
If "yes": Continues to review
Waiting for your response...
```

---

### Example 4: Query Task

**You**: "What task is running?"

**Task AI**:
```
Current Task: modify_file
Status: In Progress
Role: developer
Action: modify_file
Retry Count: 1
Next Task: review (if successful)
```

---

## Component Responsibilities Matrix

| Component | Knows | Can Answer | At Intersections |
|-----------|-------|------------|------------------|
| **Orchestrator** | Workflow YAML, sprint context, subagents | — | Delegates all tasks to subagents, relays HITL. Never does work. On failure: HITL, pause. |
| **Subagents** | Task, params, memory path | — | Execute tasks, append to memory |
| **Project AI** | Project state, workflows, blockers, execution log | "What's the status?" | Updates state when workflows change |
| **Workflow AI** | Workflow definitions, execution | "What workflows?" | Assigns workflows, tracks execution |
| **Task AI** | Current task, state, retries (from state/log) | "What task?" | Answers queries (orchestrator executes) |
| **HITL AI** | Gates (from state/YAML) | "What gate?" | Answers queries (orchestrator relays to user) |

---

## Implementation Plan

### Phase 1: Orchestrator + Subagents ✅

1. Create `.cursor/agents/` subagents (developer, reviewer, validator, architect, pm, tester)
2. Update `.cursor/rules/workflow-executor.mdc` as orchestrator
3. Create `docs/design/agent-memory.md`, `docs/design/sprint-context.md`
4. Create `memory/workflows/` directory

### Phase 2: Component AI Rules

1. `.cursor/rules/project-ai.mdc`, workflow-ai.mdc, task-ai.mdc, hitl-ai.mdc (query answering)
2. Orchestrator delegates execution

### Phase 3: Query System

1. Project, Workflow, Task, HITL query handlers (via rules)

### Phase 4: Testing

1. Test B: minimal-workflow with subagents + HITL
2. Test C: docker-hello-workflow (Phase A) with subagents

---

## Key Insight

**Each component is an AI agent that:**
- Knows its domain (projects, workflows, tasks, HITL)
- Can answer questions about its domain
- Knows what to do at intersections
- Monitors its domain
- Reports status

**You can ask questions** about any component, and the appropriate AI agent answers.

---

## Next Steps

1. Create component AI rules
2. Implement query handlers
3. Add monitoring capability
4. Test query system
