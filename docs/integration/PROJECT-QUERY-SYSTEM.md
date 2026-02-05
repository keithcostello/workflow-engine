# Project Query System

## Purpose

Enable you to **ask questions about projects** and get answers. Each component has an AI agent that knows its domain and can answer questions.

---

## How It Works

### Architecture

```
You → Ask Question
  ↓
Appropriate AI Agent (Project AI, Workflow AI, Task AI, HITL AI)
  ↓
AI Reads Relevant Memory/State
  ↓
AI Answers Your Question
```

### Component AI Agents

1. **Project AI** - Knows projects
2. **Workflow AI** - Knows workflows
3. **Task AI** - Knows tasks
4. **HITL AI** - Knows HITL gates

Each AI agent has a Cursor rule that tells it:
- What it knows
- What questions it can answer
- How to answer
- What to do at intersections

---

## Query Examples

### Project Queries (Project AI)

**You**: "What's the status of orchestration-training?"

**Project AI**:
```
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

### Workflow Queries (Workflow AI)

**You**: "What workflows are available?"

**Workflow AI**:
```
Available Workflows:

Global:
  - minimal-workflow.yaml (4 stages, demo)
  - simple-workflow.yaml (3 stages)
  
Project-Specific:
  - orchestration-training/.cursor/workflows/active-workflow.yaml
```

---

### Task Queries (Task AI)

**You**: "What task is running?"

**Task AI**:
```
Current Task: modify_file
Status: In Progress
Role: developer
Action: modify_file
Retry Count: 1
Next Task: review
```

---

### HITL Queries (HITL AI)

**You**: "What gate is waiting?"

**HITL AI**:
```
Current HITL Gate:
Type: Question
Message: "File modified. Does it look correct?"
Options: yes, no
If "no": Loops back to modify_file
Status: Waiting for your response
```

---

## Monitoring Projects

### What You Can Monitor

**Project Level**:
- Status
- Assigned workflows
- Current stage
- Blockers
- Completed items
- Next actions

**Workflow Level**:
- Execution state
- Current task
- HITL gates waiting
- Retry counts
- Progress
- **Execution log**: `memory/workflows/<project>/execution-log.md` (per-action audit trail)

**Task Level**:
- Task status
- Execution progress
- Retry attempts
- Next task

**HITL Level**:
- Pending gates
- Gate history
- User responses

---

## Component Responsibilities

### Project AI
- **Knows**: Project state, workflows, blockers
- **Answers**: "What's the status?", "What's blocking?", "What's next?"
- **At Intersections**: Updates state when workflows change

### Workflow AI
- **Knows**: Workflow definitions, execution state
- **Answers**: "What workflows?", "What's the status?", "How do I create one?"
- **At Intersections**: Assigns workflows, tracks execution

### Task AI
- **Knows**: Current task, state, retries
- **Answers**: "What task?", "What's the status?", "How many retries?"
- **At Intersections**: Executes tasks, handles retries/branching

### HITL AI
- **Knows**: Gates, responses, history
- **Answers**: "What gate?", "What are my options?", "What happens if I say 'no'?"
- **At Intersections**: Pauses workflow, processes responses

---

## Implementation

### Component AI Rules

Created 4 Cursor rules:
1. `.cursor/rules/project-ai.mdc` - Project AI agent
2. `.cursor/rules/workflow-ai.mdc` - Workflow AI agent
3. `.cursor/rules/task-ai.mdc` - Task AI agent
4. `.cursor/rules/hitl-ai.mdc` - HITL AI agent

### How Rules Work

Each rule:
- Defines the AI's role
- Lists what it knows
- Lists what questions it can answer
- Explains how to answer
- Defines intersection behavior

**When you ask a question**, the appropriate AI agent activates and answers.

---

## Usage

### Ask Project Questions

```
"What's the status of orchestration-training?"
"What's blocking orchestration-training?"
"What's next for orchestration-training?"
"What workflows are assigned to orchestration-training?"
```

### Ask Workflow Questions

```
"What workflows are available?"
"What's the status of minimal-workflow?"
"How do I create a workflow?"
```

### Ask Task Questions

```
"What task is running?"
"What's the status of task modify_file?"
"How many retries?"
```

### Ask HITL Questions

```
"What gate is waiting?"
"What are my options?"
"What happens if I say 'no'?"
```

---

## Key Benefits

✅ **Queryable Projects** - Ask questions, get answers  
✅ **Component AI Agents** - Each knows its domain  
✅ **Monitoring** - Track status at all levels  
✅ **Interaction** - Know what's happening and what to do  
✅ **Intersection Awareness** - Each AI knows what to do at intersections  

---

## Next Steps

1. Test query system - Ask questions about orchestration-training
2. Verify AI agents answer correctly
3. Test monitoring - Check status at different levels
4. Test intersections - See how AIs coordinate
