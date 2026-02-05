# System Overview - Component AI Workflow System

## 🎯 Purpose

A workflow orchestration system where:
- **Projects** are queryable (ask questions, get answers)
- **Components** have AI agents (each knows its job)
- **Workflows** are declarative (YAML defines, AI executes)
- **HITL** is built-in (approval, question, info gates)
- **Monitoring** is available (status at all levels)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              You (User/AI)                      │
│         Ask Questions, Execute Workflows        │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│      Orchestrator (workflow-executor)            │
│  Delegates to subagents | Relays HITL to you    │
└──────────────┬──────────────────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌──────────────┐  ┌──────────────────────────────┐
│  Subagents   │  │  Query / Coordination AIs    │
│  developer   │  │  Project AI | Workflow AI    │
│  reviewer    │  │  Task AI | HITL AI          │
│  validator   │  │  (rules in .cursor/rules/)  │
│  architect   │  └──────────────────────────────┘
│  pm | tester │
└──────────────┘

┌─────────────────────────────────────────────────┐
│            State & Definitions                   │
│  • Project Memory (WAITING_ON.md)               │
│  • Agent Memory (memory/workflows/[project]/)   │
│  • Workflow YAML Files                          │
│  • Component AI Rules + Subagents               │
└─────────────────────────────────────────────────┘
```

---

## 🧩 Components

### 1. Project AI
**Role**: Knows everything about projects

**Responsibilities**:
- Answer project queries
- Track project state
- Report blockers
- Update state when workflows change

**Knows**:
- Project status
- Assigned workflows
- Blockers
- Completed items
- Next actions

**Files**:
- `memory/projects/<project>/WAITING_ON.md`
- `memory/GLOBAL_DAILY_LOG.md`

---

### 2. Workflow AI
**Role**: Knows everything about workflows

**Responsibilities**:
- Execute workflows
- Assign workflows to projects
- Monitor execution
- Answer workflow queries

**Knows**:
- Workflow definitions (YAML)
- Execution state
- Which workflows are assigned
- Workflow history

**Files**:
- `*.yaml` workflow files
- `.cursor/workflows/active-workflow.yaml`

---

### 3. Orchestrator + Subagents
**Role**: Execute workflows via delegation

**Orchestrator** (workflow-executor.mdc):
- Delegates all tasks to subagents by role
- Never does work; on subagent failure: notify HITL, pause, no workarounds
- Relays HITL prompts to user (human in Cursor)

**Subagents** (.cursor/agents/): developer, reviewer, validator, architect, pm, tester
- Execute tasks in own context
- Persistent memory per sprint: `memory/workflows/[project]/[role]_sprint_[id].md`

**See**: docs/design/agent-memory.md, docs/design/sprint-context.md

---

### 4. HITL (Human in the Loop)
**Role**: You (the user) are the human in the loop

**Orchestrator** shows prompts and waits for your response. No separate HITL AI for execution—you respond in Cursor chat. HITL AI rule answers "What gate is waiting?" from state.

---

## 🔄 How It Works

### Workflow Execution Flow

```
1. User: "Execute minimal-workflow.yaml"
   ↓
2. Orchestrator: Loads YAML, initializes sprint context
   ↓
3. Orchestrator: Delegates first task to subagent (e.g., developer)
   ↓
4. Subagent: Executes action, appends to memory, returns result
   ↓
5. Orchestrator: Reaches HITL gate → shows prompt to user
   ↓
6. User: Responds in Cursor chat
   ↓
7. Orchestrator: Processes response, branches or continues
   ↓
8. Repeat steps 3-7 for each task
   ↓
9. Orchestrator: Delegates complete task to subagent, marks workflow done when subagent returns
   ↓
10. Project AI: STANDARD_MEMORY_UPDATE (WAITING_ON, GLOBAL_DAILY_LOG)
```

---

### Query Flow

```
1. User: "What's the status of orchestration-training?"
   ↓
2. System: Identifies this is a project query
   ↓
3. Project AI: Activates
   ↓
4. Project AI: Reads memory/projects/orchestration-training/WAITING_ON.md
   ↓
5. Project AI: Checks active workflow
   ↓
6. Project AI: Answers query
```

---

## 📍 File Structure

```
Workspace Root
├── .cursor/
│   └── agents/                        # Subagents (shared)
│       ├── developer.md
│       ├── reviewer.md
│       ├── validator.md
│       ├── architect.md
│       ├── pm.md
│       └── tester.md
│
orchestration-training/
├── workflow-engine/
│   ├── docs/                          # Documentation
│   │   ├── architecture/             # System design
│   │   ├── design/                    # agent-memory, sprint-context, etc.
│   │   └── ...
│   ├── workflows/                     # Workflow YAML files
│   ├── artifacts/                     # Workflow outputs
│   └── .cursor/
│       └── rules/
│           ├── workflow-executor.mdc  # Orchestrator
│           ├── project-ai.mdc
│           ├── workflow-ai.mdc
│           ├── task-ai.mdc
│           └── hitl-ai.mdc
│
memory/
├── projects/
│   └── orchestration-training/
│       ├── WAITING_ON.md              # Project state
│       └── execution-log.md
├── workflows/                         # Agent memory, sprint context
│   └── [project]/
│       ├── developer_sprint_[id].md
│       ├── reviewer_sprint_[id].md
│       └── sprint_[id]_context.json
├── GLOBAL_DAILY_LOG.md
└── USER.md
```

---

## 🎓 Key Concepts

### Component AI Agents
Each component (project, workflow, task, HITL) has an AI agent that:
- Knows its domain
- Can answer questions
- Knows what to do at intersections
- Monitors its domain

### Query System
Ask questions → Appropriate AI answers:
- Project queries → Project AI
- Workflow queries → Workflow AI
- Task queries → Task AI
- HITL queries → HITL AI

### Intersections
Components coordinate at intersections:
- Workflow assigned → Project AI updates state
- Task reaches gate → HITL AI handles it
- Task completes → Workflow AI tracks progress
- Workflow completes → Project AI updates state

### State Tracking
All state in memory files:
- Project state: `memory/projects/<project>/WAITING_ON.md`
- Workflow execution log: `memory/workflows/<project>/execution-log.md` (per-action audit trail, project-specific)
- History: `memory/GLOBAL_DAILY_LOG.md`
- Active workflow: `.cursor/workflows/active-workflow.yaml`

### Workflow Execution
- YAML defines workflow (tasks, roles, HITL gates)
- AI reads YAML
- AI executes using Cursor tools (write, read_file, etc.)
- AI coordinates with component AIs

---

## 🚀 Getting Started

### For Users

1. **Ask questions**: "What's the status of orchestration-training?"
2. **Execute workflows**: "Execute minimal-workflow.yaml"
3. **Monitor progress**: "What task is running?"
4. **Interact with gates**: Respond to HITL prompts

### For AIs

1. **Read**: [docs/reference/quick-reference.md](../reference/quick-reference.md) (5 min)
2. **Read**: [COMPONENT-AI-ARCHITECTURE.md](COMPONENT-AI-ARCHITECTURE.md) (10 min)
3. **Read**: Component AI rules (`.cursor/rules/*.mdc`)
4. **Understand**: Each component's responsibilities
5. **Practice**: Answer queries, execute workflows

---

## 📚 Documentation Hierarchy

```
docs/reference/quick-reference.md (5 min)
  ↓
SYSTEM-OVERVIEW.md (10 min) ← You are here
  ↓
COMPONENT-AI-ARCHITECTURE.md (15 min)
  ↓
Component AI Rules (.cursor/rules/*.mdc)
  ↓
Workflow Documentation (docs/guides/*.md)
```

**Start with [quick-reference.md](../reference/quick-reference.md) for immediate answers.**

---

## ❓ Common Questions

**Q: Who handles project queries?**  
A: Project AI

**Q: How do I execute a workflow?**  
A: Ask Workflow AI: "Execute minimal-workflow.yaml"

**Q: What task is running?**  
A: Ask Task AI: "What task is running?"

**Q: What gate is waiting?**  
A: Ask HITL AI: "What gate is waiting?"

**Q: Where is project state?**  
A: `memory/projects/<project>/WAITING_ON.md`

**Q: Where is the workflow execution log?**  
A: `memory/workflows/<project>/execution-log.md`. See [docs/design/workflow-execution-log.md](../design/workflow-execution-log.md).

**Q: How do components coordinate?**  
A: They notify each other at intersections (see COMPONENT-AI-ARCHITECTURE.md)

---

## 🔑 Remember

- **Each component has an AI agent** that knows its job
- **Ask questions** → Appropriate AI answers
- **State is in memory files** → Read to know current state
- **Workflows are YAML** → AI executes using Cursor tools
- **Components coordinate** → At intersections

---

## 📖 Next Steps

1. Read [docs/reference/quick-reference.md](../reference/quick-reference.md) for quick lookups
2. Read `COMPONENT-AI-ARCHITECTURE.md` for deep understanding
3. Read component AI rules for agent behavior
4. Test the system: Ask questions, execute workflows
