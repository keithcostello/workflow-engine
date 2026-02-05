# Integration Guide - How AIs Work in This System

## 🎯 Purpose

This guide explains how any AI (including Cursor's AI assistant) should work within the component AI workflow system.

---

## 🚀 Quick Start for New AIs

### Step 1: Read Quick Reference (5 minutes)

**Read**: [docs/reference/quick-reference.md](../reference/quick-reference.md)

**Learn**:
- Who to talk to for each question
- Component responsibilities
- Common operations
- Decision tree

---

### Step 2: Understand System Overview (10 minutes)

**Read**: `SYSTEM-OVERVIEW.md`

**Learn**:
- Architecture
- How components work together
- File structure
- Key concepts

---

### Step 3: Read Component AI Rules (20 minutes)

**Read** (in order):
1. `.cursor/rules/project-ai.mdc` - Project AI behavior
2. `.cursor/rules/workflow-ai.mdc` - Workflow AI behavior
3. `.cursor/rules/task-ai.mdc` - Task AI behavior
4. `.cursor/rules/hitl-ai.mdc` - HITL AI behavior
5. `.cursor/rules/workflow-executor.mdc` - Workflow execution

**Learn**:
- What each AI knows
- What questions each can answer
- How each AI behaves
- Intersection handling

---

## 🔄 How to Work in This System

### When User Asks a Question

**Step 1: Identify Component**

Use decision tree:
```
Is it about a PROJECT? → Project AI
Is it about a WORKFLOW? → Workflow AI
Is it about a TASK? → Task AI
Is it about a HITL GATE? → HITL AI
```

**Step 2: Activate Appropriate AI Rule**

Read the corresponding `.cursor/rules/*-ai.mdc` file to understand:
- What the AI knows
- How to answer
- What files to read

**Step 3: Execute AI Behavior**

Follow the AI rule's instructions:
- Read relevant files
- Process information
- Answer query

**Step 4: Report Answer**

Provide answer in format specified by AI rule.

---

### When User Wants to Execute Workflow

**Step 1: Workflow AI Activates**

- Read workflow YAML file
- Parse structure
- Initialize state

**Step 2: Coordinate with Project AI**

- Notify Project AI: Workflow assigned
- Project AI updates project state

**Step 3: Execute Tasks**

For each task:
- **Task AI** executes using Cursor tools
- **Task AI** reaches HITL gate
- **HITL AI** shows prompt, waits for user
- User responds
- **HITL AI** processes response
- **Task AI** continues or branches

**Step 4: Update State**

- **Workflow AI** tracks execution
- **Project AI** updates project state
- **Task AI** updates task state

---

### When Components Need to Coordinate

**At Intersections**:

1. **Workflow → Project**:
   - Workflow AI assigns workflow
   - Workflow AI notifies Project AI
   - Project AI updates state

2. **Task → HITL**:
   - Task AI reaches gate
   - Task AI notifies HITL AI
   - HITL AI handles gate
   - HITL AI notifies Task AI

3. **Task → Task (Retry)**:
   - Task AI detects failure
   - Task AI checks retry count
   - Task AI loops back
   - Task AI notifies Workflow AI

4. **Workflow → Project (Complete)**:
   - Workflow AI marks complete
   - Workflow AI notifies Project AI
   - Project AI updates state

---

## 📋 Component Interaction Patterns

### Pattern 1: Query Flow

```
User Question
    ↓
Identify Component
    ↓
Activate AI Rule
    ↓
AI Reads Files
    ↓
AI Answers
```

### Pattern 2: Execution Flow

```
User: "Execute workflow"
    ↓
Workflow AI: Loads YAML
    ↓
Workflow AI: Notifies Project AI
    ↓
Task AI: Executes tasks
    ↓
HITL AI: Handles gates
    ↓
Workflow AI: Tracks progress
    ↓
Project AI: Updates state
```

### Pattern 3: Intersection Flow

```
Component A: Detects intersection
    ↓
Component A: Notifies Component B
    ↓
Component B: Updates state
    ↓
Component B: Notifies Component C (if needed)
    ↓
Continue workflow
```

---

## 🗂️ File Reading Patterns

### Project Queries

**Read**:
1. `memory/projects/<project>/WAITING_ON.md` - Current state
2. `memory/workflows/<project>/execution-log.md` - Per-action workflow log (if needed)
3. `memory/GLOBAL_DAILY_LOG.md` - History (if needed)
4. `.cursor/workflows/active-workflow.yaml` - Active workflow (if any)

**Answer**: Project status, blockers, next actions

---

### Workflow Queries

**Read**:
1. `*.yaml` workflow files - Definitions
2. `.cursor/workflows/active-workflow.yaml` - Active workflow
3. Workflow execution state (in memory)

**Answer**: Available workflows, status, how to create

---

### Task Queries

**Read**:
1. Active workflow YAML - Task definitions
2. Task execution state (in memory)

**Answer**: Current task, status, retry count

---

### HITL Queries

**Read**:
1. Active workflow YAML - HITL definitions
2. Gate state (in memory)

**Answer**: Current gate, options, what happens

---

## 🔧 Tool Usage

### Cursor Tools Used

**For File Operations**:
- `read_file()` - Read files
- `write()` - Create files
- `search_replace()` - Modify files

**For Execution**:
- `run_terminal_cmd()` - Run commands
- `grep()` - Search files
- `list_dir()` - List directories

**For Workflow Execution**:
- Task AI uses Cursor tools to perform actions
- Workflow AI coordinates execution
- HITL AI handles interactions

---

## 📝 State Management

### Reading State

**Project State**:
- Read `memory/projects/<project>/WAITING_ON.md`
- Parse current state, blockers, next actions

**Workflow State**:
- Read `.cursor/workflows/active-workflow.yaml`
- Track execution in memory

**Task State**:
- Track in memory during execution
- Update as tasks progress

**HITL State**:
- Track in memory during execution
- Record user responses

---

### Updating State

**STANDARD_MEMORY_UPDATE** (always do both):
1. UPDATE `memory/projects/<project>/WAITING_ON.md`
2. APPEND `memory/GLOBAL_DAILY_LOG.md` (dated entry at top)

**Project State**:
- Update `memory/projects/<project>/WAITING_ON.md`
- Append to `memory/GLOBAL_DAILY_LOG.md` (part of standard update)

**Workflow State**:
- Update `.cursor/workflows/active-workflow.yaml`
- Track in memory

**Task State**:
- Update in memory
- Report to Workflow AI

**HITL State**:
- Update in memory
- Report to Task AI

---

## 🎓 Best Practices

### 1. Always Identify Component First

Before answering, identify which component handles the question.

### 2. Read Relevant Files

Each AI knows which files to read. Always read them before answering.

### 3. Coordinate at Intersections

When components intersect, notify relevant AIs and update state.

### 4. Update State Consistently

Always update state files when state changes.

### 5. Use Appropriate AI Rules

Read the AI rule file to understand how to behave.

### 6. Report Clearly

Provide answers in format specified by AI rules.

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Not Identifying Component

**Wrong**: Answering project query without activating Project AI

**Right**: Identify component, activate AI rule, then answer

---

### ❌ Mistake 2: Not Reading Files

**Wrong**: Answering based on assumptions

**Right**: Read relevant files first, then answer

---

### ❌ Mistake 3: Not Coordinating

**Wrong**: Updating state without notifying other components

**Right**: Notify relevant AIs at intersections

---

### ❌ Mistake 4: Not Updating State

**Wrong**: Executing workflow without updating state

**Right**: Update state files when state changes. When executing workflows, append every action to the workflow execution log ([docs/design/workflow-execution-log.md](../design/workflow-execution-log.md)).

---

## 📚 Reference Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [quick-reference.md](../reference/quick-reference.md) | Quick lookups | 5 min |
| `SYSTEM-OVERVIEW.md` | Architecture | 10 min |
| `COMPONENT-AI-ARCHITECTURE.md` | Detailed design | 15 min |
| `PROJECT-QUERY-SYSTEM.md` | Query system | 10 min |
| [workflow-execution-log.md](../design/workflow-execution-log.md) | Execution logging | 5 min |
| `.cursor/rules/*.mdc` | AI behavior | 20 min |

**Total**: ~60 minutes to fully understand the system

---

## ✅ Checklist for New AIs

- [ ] Read [quick-reference.md](../reference/quick-reference.md)
- [ ] Read `SYSTEM-OVERVIEW.md`
- [ ] Read all component AI rules
- [ ] Understand component responsibilities
- [ ] Understand intersection handling
- [ ] Know which files to read for each query
- [ ] Know how to update state
- [ ] Know how to coordinate with other AIs
- [ ] Know execution log format (when executing workflows)

---

## 🎯 Remember

- **Each component has an AI agent** - Know which one to use
- **Read files before answering** - Don't assume
- **Coordinate at intersections** - Notify relevant AIs
- **Update state consistently** - Keep state files current
- **Follow AI rules** - They define behavior

---

## 🔗 Related Documents

- [quick-reference.md](../reference/quick-reference.md) - Quick lookups
- `SYSTEM-OVERVIEW.md` - Architecture overview
- `COMPONENT-AI-ARCHITECTURE.md` - Detailed design
- `PROJECT-QUERY-SYSTEM.md` - Query system details
