# Query System Guide - Natural Language & Explicit Commands

## 🎯 Overview

The query system supports **two modes**:
1. **Natural Language** - Ask questions naturally
2. **Explicit Commands** - "Ask [Component] AI: [question]"

Both modes route to the appropriate component AI agent.

---

## 📝 Natural Language Queries

### Project Queries

**Examples**:
- "What's the status of orchestration-training?"
- "What's the status of project orchestration-training?"
- "What's blocking orchestration-training?"
- "What's next for orchestration-training?"
- "What workflows are assigned to orchestration-training?"
- "Show me orchestration-training status"
- "orchestration-training status"
- "Status of orchestration-training"

**Routes to**: Project AI

**Response**:
```
[Project AI: Retrieved project status]

Project: orchestration-training
Status: In Progress
Current Workflow: minimal-workflow.yaml (Stage 2)
Blockers: None
Completed: 
  - Cursor-native workflow system
  - Training materials
Next: 
  - Test minimal-workflow.yaml
  - Complete workflow training
```

---

### Workflow Queries

**Examples**:
- "What workflows are available?"
- "What workflows exist?"
- "List workflows"
- "What's the status of workflow minimal-workflow?"
- "What workflow is running?"
- "How do I create a workflow?"
- "Show me workflows"

**Routes to**: Workflow AI

**Response**:
```
[Workflow AI: Listed available workflows]

Available Workflows:

Global:
  - minimal-workflow.yaml (4 stages, demo)
  - simple-workflow.yaml (3 stages)
  
Project-Specific:
  - orchestration-training/.cursor/workflows/active-workflow.yaml
```

---

### Task Queries

**Examples**:
- "What task is running?"
- "What task is executing?"
- "What's the current task?"
- "What's the status of task modify_file?"
- "How many retries for task modify_file?"
- "What's the next task?"

**Routes to**: Task AI

**Response**:
```
[Task AI: Retrieved task status]

Current Task: modify_file
Status: In Progress
Role: developer
Action: modify_file
Retry Count: 1
Next Task: review (if successful)
```

---

### HITL Queries

**Examples**:
- "What gate is waiting?"
- "What HITL gate is active?"
- "What are my options?"
- "What happens if I say 'no'?"
- "What gate is next?"

**Routes to**: HITL AI

**Response**:
```
[HITL AI: Retrieved gate status]

Current HITL Gate:
Type: Question
Message: "File modified. Does it look correct?"
Options: yes, no
If "no": Loops back to modify_file
If "yes": Continues to review
Status: Waiting for user response
```

---

## 🎯 Explicit Commands

### Format

**"Ask [Component] AI: [question]"**

**Components**:
- Project AI
- Workflow AI
- Task AI
- HITL AI

---

### Examples

**Project AI**:
- "Ask Project AI: What's the status of orchestration-training?"
- "Ask Project AI: What's blocking orchestration-training?"
- "Ask Project AI: What's next for orchestration-training?"

**Workflow AI**:
- "Ask Workflow AI: What workflows are available?"
- "Ask Workflow AI: What's the status of minimal-workflow?"
- "Ask Workflow AI: How do I create a workflow?"

**Task AI**:
- "Ask Task AI: What task is running?"
- "Ask Task AI: What's the status of task modify_file?"
- "Ask Task AI: How many retries?"

**HITL AI**:
- "Ask HITL AI: What gate is waiting?"
- "Ask HITL AI: What are my options?"
- "Ask HITL AI: What happens if I say 'no'?"

---

## 🔔 Explicit Notifications

### When Notifications Appear

**Notifications show when**:
- Component updates state
- Component coordinates with another component
- Workflow assigned to project
- Task completes
- HITL gate reached
- State changes

### Notification Format

**"[Component] AI: [action]"**

**Examples**:
- "[Project AI: Updated project state]"
- "[Workflow AI: Assigned workflow to project]"
- "[Task AI: Completed task modify_file]"
- "[HITL AI: Waiting for user response]"
- "[Project AI: Workflow orchestration-training/minimal-workflow.yaml completed]"
- "[Workflow AI: Workflow started, notifying Project AI]"
- "[Task AI: Reached HITL gate, notifying HITL AI]"
- "[HITL AI: User responded, processing]"

---

## 🔍 Project Discovery

### Finding Projects

**When you ask about a project**:

1. **If project name provided**:
   - System checks `memory/projects/<project>/WAITING_ON.md`
   - If exists: Uses that project
   - If not: Lists available projects

2. **If no project name**:
   - System scans `memory/projects/` directory
   - Lists all available projects
   - Asks you to select

3. **If "current project" or in project directory**:
   - System infers project from current directory
   - Uses that project

4. **If "all projects" or "workspace"**:
   - System lists all projects with their status

---

### Example: Project Discovery

**You**: "What's the status?"

**System**:
```
Available Projects:
  - orchestration-training
  - cursor_setup

Which project? (or say "all" for all projects)
```

**Or** (if in project directory):
```
[Project AI: Inferred project from directory]

Project: orchestration-training
Status: In Progress
...
```

---

## 📊 Query Flow

### Natural Language Query

```
You: "What's the status of orchestration-training?"
    ↓
Query Router: Identifies as project query
    ↓
Query Router: Routes to Project AI
    ↓
Project AI: Reads memory/projects/orchestration-training/WAITING_ON.md
    ↓
Project AI: Answers query
    ↓
Response: [Project AI: Retrieved project status]
         Project: orchestration-training
         Status: In Progress
         ...
```

---

### Explicit Command Query

```
You: "Ask Project AI: What's the status of orchestration-training?"
    ↓
Query Router: Identifies explicit command
    ↓
Query Router: Routes directly to Project AI
    ↓
Project AI: Reads memory/projects/orchestration-training/WAITING_ON.md
    ↓
Project AI: Answers query
    ↓
Response: [Project AI: Retrieved project status]
         Project: orchestration-training
         Status: In Progress
         ...
```

---

## 🎓 Best Practices

### Use Natural Language For
- Quick questions
- Exploratory queries
- General status checks

### Use Explicit Commands For
- Directing to specific component
- When you know which AI to ask
- Bypassing query router

### On-Demand Queries
- Query when you need information
- No real-time dashboard (on-demand only)
- All queries are explicit (you ask, system answers)

---

## 🔄 Component Coordination Notifications

### Workflow → Project

**When**: Workflow assigned to project

**Notifications**:
```
[Workflow AI: Assigning workflow to project]
[Workflow AI: Notifying Project AI of assignment]
[Project AI: Workflow assigned, updating state]
```

---

### Task → HITL

**When**: Task reaches HITL gate

**Notifications**:
```
[Task AI: Reached HITL gate, notifying HITL AI]
[HITL AI: Gate reached, showing prompt]
[HITL AI: Waiting for user response]
```

---

### Task → Task (Retry)

**When**: Task fails and retries

**Notifications**:
```
[Task AI: Task failed, checking retry logic]
[Task AI: Retry needed, looping back to task]
[Workflow AI: Task retry, updating execution state]
```

---

### Workflow → Project (Complete)

**When**: Workflow completes

**Notifications**:
```
[Workflow AI: Workflow completed, notifying Project AI]
[Project AI: Workflow completed, updating state]
[Project AI: Updated project state]
```

---

## 📋 All Projects Query

### Query All Projects

**You**: "What's the status of all projects?"

**Response**:
```
[Project AI: Scanning workspace for all projects]

Available Projects:
  - orchestration-training: In Progress
    Current Workflow: minimal-workflow.yaml (Stage 2)
    Blockers: None
  - cursor_setup: Complete
    Current Workflow: None
    Blockers: None
```

---

## ✅ Key Features

✅ **Natural language support** - Ask questions naturally  
✅ **Explicit commands** - "Ask [Component] AI: [question]"  
✅ **Automatic routing** - Routes to appropriate AI  
✅ **Project discovery** - Finds projects in workspace  
✅ **Explicit notifications** - Shows when components act  
✅ **On-demand queries** - Query when needed  
✅ **All projects support** - Query any project in workspace  

---

## 🚀 Quick Examples

### Natural Language
```
"What's the status of orchestration-training?"
"What workflows are available?"
"What task is running?"
"What gate is waiting?"
```

### Explicit Commands
```
"Ask Project AI: What's the status of orchestration-training?"
"Ask Workflow AI: What workflows are available?"
"Ask Task AI: What task is running?"
"Ask HITL AI: What gate is waiting?"
```

### Project Discovery
```
"What's the status?" → Lists projects or infers from directory
"What's the status of all projects?" → Lists all projects
```

---

## 📖 Related Documentation

- [quick-reference.md](../reference/quick-reference.md) - Quick lookups
- [SYSTEM-OVERVIEW.md](SYSTEM-OVERVIEW.md) - Architecture
- [INTEGRATION-GUIDE.md](INTEGRATION-GUIDE.md) - How AIs work
- [.cursor/rules/query-router.mdc](.cursor/rules/query-router.mdc) - Query router rule
