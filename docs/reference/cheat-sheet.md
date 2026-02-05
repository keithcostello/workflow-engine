# Cheat Sheet - Component AI System

## 🎯 Who to Talk To (Decision Tree)

```
Your Question
    ↓
┌─────────────────────────────────────┐
│ Is it about a PROJECT?              │
│   YES → Project AI                  │
│   NO  ↓                             │
│ Is it about a WORKFLOW?             │
│   YES → Workflow AI                 │
│   NO  ↓                             │
│ Is it about a TASK?                 │
│   YES → Task AI                     │
│   NO  ↓                             │
│ Is it about a HITL GATE?            │
│   YES → HITL AI                     │
│   NO  → Ask user to clarify         │
└─────────────────────────────────────┘
```

---

## 📋 Component Responsibilities

| Component | Knows | Answers | Rule File |
|-----------|-------|---------|-----------|
| **Project AI** | Projects, state, blockers | "What's the status?", "What's blocking?" | `project-ai.mdc` |
| **Workflow AI** | Workflows, execution | "What workflows?", "What's the status?" | `workflow-ai.mdc` |
| **Task AI** | Tasks, state, retries | "What task?", "How many retries?" | `task-ai.mdc` |
| **HITL AI** | Gates, responses | "What gate?", "What are my options?" | `hitl-ai.mdc` |

---

## 🔄 Common Operations

### Query Project
```
You: "What's the status of orchestration-training?"
→ Project AI reads memory/projects/orchestration-training/WAITING_ON.md
→ Project AI answers
```

### Execute Workflow
```
You: "Execute minimal-workflow.yaml" or "Execute workflows/minimal-workflow.yaml"
→ Workflow AI loads YAML from workflows/
→ Workflow AI coordinates with Task AI and HITL AI
→ Workflow executes
```

### Check Task
```
You: "What task is running?"
→ Task AI reports current task, state, retry count
```

### Check Gate
```
You: "What gate is waiting?"
→ HITL AI reports gate type, message, options
```

---

## 📍 File Locations

| What | Where |
|------|-------|
| Project state | `memory/projects/<project>/WAITING_ON.md` |
| Workflow execution log | `memory/workflows/<project>/execution-log.md` |
| History | `memory/GLOBAL_DAILY_LOG.md` |
| Workflows | `workflows/*.yaml` |
| Active workflow | `.cursor/workflows/active-workflow.yaml` |
| Project AI rule | `.cursor/rules/project-ai.mdc` |
| Workflow AI rule | `.cursor/rules/workflow-ai.mdc` |
| Task AI rule | `.cursor/rules/task-ai.mdc` |
| HITL AI rule | `.cursor/rules/hitl-ai.mdc` |
| Workflow executor rule | `.cursor/rules/workflow-executor.mdc` |

---

## 🔀 Intersection Handlers

| Intersection | What Happens |
|--------------|--------------|
| **Workflow → Project** | Workflow AI assigns → Project AI updates state |
| **Task → HITL** | Task AI reaches gate → HITL AI handles |
| **Task → Task (Retry)** | Task AI fails → Task AI retries |
| **Task → Task (Branch)** | Task AI completes → Task AI branches |
| **Workflow → Project (Complete)** | Workflow AI completes → Project AI updates |

---

## ⚡ Quick Actions

### Start Workflow
1. Workflow AI loads YAML from `workflows/`
2. Workflow AI notifies Project AI
3. Task AI executes tasks
4. HITL AI handles gates

### Query Status
1. Identify component
2. Activate AI rule
3. AI reads files
4. AI answers

### Handle Intersection
1. Component detects intersection
2. Component notifies relevant AI
3. Relevant AI updates state
4. Continue workflow

---

## 📚 Documentation Quick Links

| Need | Read |
|------|------|
| Quick lookup | [quick-reference.md](quick-reference.md) (5 min) |
| Architecture | [../architecture/system-overview.md](../architecture/system-overview.md) (10 min) |
| How AIs work | [../integration/integration-guide.md](../integration/integration-guide.md) (15 min) |
| Complete index | [documentation-index.md](documentation-index.md) |
| Deep dive | [../architecture/component-ai-architecture.md](../architecture/component-ai-architecture.md) (15 min) |

---

## 🎓 Key Concepts

- **Component AI**: Each component has an AI agent
- **Query System**: Ask questions → Appropriate AI answers
- **Intersections**: Components coordinate at intersections
- **State Tracking**: All state in memory files
- **Workflow Execution**: YAML defines, AI executes

---

## ❓ Common Questions

| Question | Answer |
|----------|--------|
| Who handles project queries? | Project AI |
| How do I execute a workflow? | Ask Workflow AI: "Execute workflows/minimal-workflow.yaml" |
| What task is running? | Ask Task AI: "What task is running?" |
| What gate is waiting? | Ask HITL AI: "What gate is waiting?" |
| Where is project state? | `memory/projects/<project>/WAITING_ON.md` |
| Where is execution log? | `memory/workflows/<project>/execution-log.md` |

---

## 🔑 Remember

- **Each component has an AI agent** that knows its job
- **Ask questions** → Appropriate AI answers
- **State is in memory files** → Read to know current state
- **Workflows are YAML** → AI executes using Cursor tools
- **Components coordinate** → At intersections

---

**Print this page for quick reference!**
