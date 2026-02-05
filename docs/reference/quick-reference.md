# Quick Reference - Component AI System

## 🎯 Who to Talk To

### Natural Language (Auto-Routed)

| Your Question | Talk To | Rule File |
|---------------|---------|-----------|
| "What's the status of [project]?" | **Project AI** | `project-ai.mdc` |
| "What workflows are available?" | **Workflow AI** | `workflow-ai.mdc` |
| "What task is running?" | **Task AI** | `task-ai.mdc` |
| "What gate is waiting?" | **HITL AI** | `hitl-ai.mdc` |
| "What's blocking?" | **Project AI** | `project-ai.mdc` |
| "How do I create a workflow?" | **Workflow AI** | `workflow-ai.mdc` |
| "How many retries?" | **Task AI** | `task-ai.mdc` |
| "What are my options?" | **HITL AI** | `hitl-ai.mdc` |
| "execute workflow" / "resume-sprint" / "resume project [name]" | **Orchestrator** | `workflow-executor.mdc` |
| "Which projects have paused workflows?" | **Project AI** | `project-ai.mdc` |

### Resume (Re-enter After Cursor Restart)

| Your Command | What Happens |
|--------------|--------------|
| "resume-sprint" | Load workflow-state.json, re-show HITL prompt, continue |
| "resume workflow" | Same as resume-sprint |
| "resume project [project_name]" | Resume paused workflow for that project (e.g., "resume project orchestration-training") |
| "continue orchestration" | Same as resume-sprint |

When workflow is paused (e.g., Cursor closed at HITL gate), say "resume-sprint" or "resume project [name]" to re-enter and continue. If you don't know which project: ask "Which projects have paused workflows?" or "What's the status of [project]?" — Project AI will help you get to the right spot.

### Explicit Commands

| Your Command | Talk To | Rule File |
|--------------|---------|-----------|
| "Ask Project AI: [question]" | **Project AI** | `project-ai.mdc` |
| "Ask Workflow AI: [question]" | **Workflow AI** | `workflow-ai.mdc` |
| "Ask Task AI: [question]" | **Task AI** | `task-ai.mdc` |
| "Ask HITL AI: [question]" | **HITL AI** | `hitl-ai.mdc` |

---

## 📋 Component Responsibilities

### Project AI
- **Knows**: Projects, state, blockers, workflows assigned
- **Does**: Answers project queries, updates state, reports status
- **Files**: `memory/projects/<project>/WAITING_ON.md`

### Orchestrator (Workflow Executor)
- **Knows**: Workflow YAML, sprint context, subagents
- **Does**: Delegates all tasks to subagents (including complete), relays HITL to user. Never does work. On subagent failure: notify HITL, pause, no workarounds.
- **Files**: `workflow-executor.mdc`, `.cursor/agents/`

### Subagents (developer, reviewer, validator, architect, pm, tester)
- **Knows**: Task, params, memory path
- **Does**: Execute tasks, append to memory per sprint
- **Files**: `.cursor/agents/*.md`, `memory/workflows/[project]/[role]_sprint_[id].md`

### Workflow AI
- **Knows**: Workflows, definitions, execution state
- **Does**: Answers workflow queries, coordinates (orchestrator executes)
- **Files**: `workflows/*.yaml`

### Task AI
- **Knows**: Current task, state, retries (from state/log)
- **Does**: Answers task queries (orchestrator + subagents execute)
- **Files**: workflow-state.json, `memory/workflows/<project>/execution-log.md`

### HITL AI
- **Knows**: Gates (from state/YAML)
- **Does**: Answers gate queries (orchestrator relays to user)
- **Files**: workflow-state.json, workflow YAML

---

## 🔄 How Components Work Together

```
Orchestrator → Loads workflow, initializes sprint
    ↓
Orchestrator → Delegates task to subagent (developer, reviewer, etc.)
    ↓
Subagent → Executes, appends to memory, returns
    ↓
Orchestrator → Reaches HITL → Shows prompt to user (you)
    ↓
User → Responds in Cursor chat
    ↓
Orchestrator → Processes response, continues or branches
    ↓
Project AI → Updates state
```

---

## 📍 Where Things Are

### Project State
- `memory/projects/<project>/WAITING_ON.md` - Current state
- `memory/workflows/<project>/execution-log.md` - Per-action workflow log (project-specific)
- `memory/projects/<project>/workflow-state.json` - Paused workflow (resume-sprint)
- `memory/GLOBAL_DAILY_LOG.md` - History

### Agent Memory (per sprint)
- `memory/workflows/<project>/[role]_sprint_[id].md` - developer, reviewer, etc.
- `memory/workflows/<project>/sprint_[id]_context.json` - Sprint context

### Subagents (workspace root)
- `.cursor/agents/developer.md`, `reviewer.md`, `validator.md`, `architect.md`, `pm.md`, `tester.md`

### Workflows
- `workflows/minimal-workflow.yaml` - Demo workflow
- `workflows/simple-workflow.yaml` - Simple example
- `workflows/retry-loop-workflow.yaml` - Retry example
- `workflows/workflow-definition.yaml` - Full PM-Developer orchestration
- `.cursor/workflows/active-workflow.yaml` - Active workflow (per project)

### Component AI Rules & Subagents
- `.cursor/rules/workflow-executor.mdc` - Orchestrator
- `.cursor/agents/` - Subagents (developer, reviewer, etc.)
- `.cursor/rules/project-ai.mdc` - Project AI
- `.cursor/rules/workflow-ai.mdc` - Workflow AI
- `.cursor/rules/task-ai.mdc` - Task AI (query)
- `.cursor/rules/hitl-ai.mdc` - HITL AI (query)

---

## 🚀 Common Operations

### Query Project Status
```
You: "What's the status of orchestration-training?"
Project AI: [Reads memory, reports status]
```

### Execute Workflow
```
You: "Execute workflows/minimal-workflow.yaml" or "Execute minimal-workflow.yaml"
Workflow AI: [Loads workflow, coordinates with Task AI and HITL AI]
```

### Check Current Task
```
You: "What task is running?"
Task AI: [Reports current task, state, retry count]
```

### Check HITL Gate
```
You: "What gate is waiting?"
HITL AI: [Reports gate type, message, options]
```

---

## 🔀 Decision Tree: Who Handles This?

```
Is it about a PROJECT?
  YES → Project AI
  NO ↓
Is it about a WORKFLOW?
  YES → Workflow AI
  NO ↓
Is it about a TASK?
  YES → Task AI
  NO ↓
Is it about a HITL GATE?
  YES → HITL AI
  NO → Ask user to clarify
```

---

## ⚡ Quick Actions

### Start Workflow
1. **Workflow AI** loads YAML from `workflows/`
2. **Workflow AI** notifies **Project AI**
3. **Workflow AI** starts execution
4. **Task AI** executes tasks
5. **HITL AI** handles gates

### Query Status
1. Identify component (project/workflow/task/HITL)
2. Activate appropriate AI rule
3. AI reads relevant files
4. AI answers query

### Handle Intersection
1. Component detects intersection
2. Component notifies relevant AI
3. Relevant AI updates state
4. Continue workflow

---

## 📚 Documentation Files

| File | Purpose | When to Read |
|------|---------|--------------|
| [quick-reference.md](quick-reference.md) | This file - quick lookup | Always |
| [../integration/query-system-guide.md](../integration/query-system-guide.md) | Natural language & explicit commands | Understanding queries |
| [../architecture/component-ai-architecture.md](../architecture/component-ai-architecture.md) | Full architecture | Deep dive |
| [../integration/project-query-system.md](../integration/project-query-system.md) | Query system details | Understanding queries |
| [../guides/quick-start.md](../guides/quick-start.md) | Workflow quick start | Using workflows |
| [../guides/training.md](../guides/training.md) | Training guide | Learning system |
| `.cursor/rules/*.mdc` | Component AI rules | AI agent behavior |

---

## 🎓 For New AIs

**Read in this order:**
1. [quick-reference.md](quick-reference.md) (this file) - 5 min
2. [../architecture/component-ai-architecture.md](../architecture/component-ai-architecture.md) - 10 min
3. `.cursor/rules/project-ai.mdc` - 5 min
4. `.cursor/rules/workflow-ai.mdc` - 5 min
5. `.cursor/rules/task-ai.mdc` - 5 min
6. `.cursor/rules/hitl-ai.mdc` - 5 min

**Total: ~35 minutes to understand the system**

---

## 🔑 Key Concepts

- **Component AI**: Each component (project, workflow, task, HITL) has an AI agent
- **Query System**: Ask questions, get answers from appropriate AI
- **Intersections**: Components coordinate at intersections
- **State Tracking**: All state in memory files
- **Workflow Execution**: YAML defines, AI executes using Cursor tools

---

## ❓ Still Confused?

**Ask**: "What component handles [your question]?"

**Or check**: [component-ai-architecture.md](../architecture/component-ai-architecture.md) for detailed explanations.
