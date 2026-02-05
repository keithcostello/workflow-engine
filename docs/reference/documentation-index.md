# Documentation Index

## 🎯 Purpose

Quick navigation to all documentation. Find what you need fast.

---

## 📚 Essential Reading (Start Here)

### 0. [cheat-sheet.md](cheat-sheet.md) ⚡
**Time**: 2 minutes  
**Purpose**: Visual cheat sheet, print for quick reference  
**Read when**: You need immediate lookup

### 1. [quick-reference.md](quick-reference.md) ⭐
**Time**: 5 minutes  
**Purpose**: Quick lookups, who to talk to, decision tree  
**Read when**: You need immediate answers

### 2. [../architecture/SYSTEM-OVERVIEW.md](../architecture/SYSTEM-OVERVIEW.md)
**Time**: 10 minutes  
**Purpose**: Architecture overview, how it works  
**Read when**: You want to understand the system

### 3. [../integration/INTEGRATION-GUIDE.md](../integration/INTEGRATION-GUIDE.md)
**Time**: 15 minutes  
**Purpose**: How AIs work in this system  
**Read when**: You're an AI integrating with the system

---

## 🔍 Deep Dive Documentation

### 4. [../design/workflow-execution-log.md](../design/workflow-execution-log.md)
**Time**: 5 minutes  
**Purpose**: Per-action workflow logging  
**Read when**: Executing workflows or querying run history

### 4b. [../design/agent-memory.md](../design/agent-memory.md)
**Time**: 5 minutes  
**Purpose**: Agent memory convention (one file per agent per sprint)  
**Read when**: Understanding subagent memory or sprint context

### 4c. [../design/sprint-context.md](../design/sprint-context.md)
**Time**: 3 minutes  
**Purpose**: Sprint context schema for orchestrator  
**Read when**: Understanding orchestrator state

### 4d. [../design/SUBAGENT-ORCHESTRATION-ALIGNMENT.md](../design/SUBAGENT-ORCHESTRATION-ALIGNMENT.md)
**Time**: 5 minutes  
**Purpose**: Alignment summary, testing checklist  
**Read when**: Verifying implementation or running tests

### 4e. [../design/walking-skeleton.md](../design/walking-skeleton.md)
**Time**: 5 minutes  
**Purpose**: Walking skeleton definitions (execution path + incremental software building)  
**Read when**: Understanding validation rules or structuring workflows for piece-by-piece development

### 4f. [../testing/WALKING-SKELETON-TEST.md](../testing/WALKING-SKELETON-TEST.md)
**Time**: 5 minutes  
**Purpose**: Formal walking skeleton validation test (Definition 1 + 2 checklists)  
**Read when**: Running or validating walking skeleton compliance

### 4g. [../testing/ORCHESTRATION-TOOL-VALIDATION.md](../testing/ORCHESTRATION-TOOL-VALIDATION.md)
**Time**: 10 minutes  
**Purpose**: Full orchestration tool validation (OT0–OT33). Mandatory at end of every sprint/phase test. No workarounds.  
**Read when**: Validating sprint/phase test completion or running orchestration-validation-workflow

### 5. [../architecture/COMPONENT-AI-ARCHITECTURE.md](../architecture/COMPONENT-AI-ARCHITECTURE.md)
**Time**: 15 minutes  
**Purpose**: Detailed architecture design  
**Read when**: You need deep understanding

### 6. [../integration/QUERY-SYSTEM-GUIDE.md](../integration/QUERY-SYSTEM-GUIDE.md)
**Time**: 10 minutes  
**Purpose**: Natural language & explicit commands  
**Read when**: You want to understand query system

### 7. [../integration/PROJECT-QUERY-SYSTEM.md](../integration/PROJECT-QUERY-SYSTEM.md)
**Time**: 10 minutes  
**Purpose**: Query system details  
**Read when**: You want to understand queries

---

## 🎓 Training & Usage

### 8. [../guides/quick-start.md](../guides/quick-start.md)
**Time**: 10 minutes  
**Purpose**: Workflow quick start  
**Read when**: You want to use workflows

### 9. [../guides/TRAINING.md](../guides/TRAINING.md)
**Time**: 30 minutes  
**Purpose**: Comprehensive training guide  
**Read when**: You want to learn workflows

### 10. [../guides/INSTRUCTIONAL-GUIDE.md](../guides/INSTRUCTIONAL-GUIDE.md)
**Time**: 20 minutes  
**Purpose**: Hands-on learning with checkpoints  
**Read when**: You want hands-on practice

### 11. [../guides/AI-GUIDE.md](../guides/AI-GUIDE.md)
**Time**: 15 minutes  
**Purpose**: AI tutor guide  
**Read when**: You want interactive learning

---

## 🔧 Component AI Rules & Subagents

| Rule / Location | Purpose |
|-----------------|---------|
| `.cursor/rules/workflow-executor.mdc` | Orchestrator—delegate to subagents, relay HITL to user |
| `.cursor/agents/` (workspace root) | Subagents: developer, reviewer, validator, architect, pm, tester |
| `.cursor/rules/project-ai.mdc` | Project AI behavior |
| `.cursor/rules/workflow-ai.mdc` | Workflow AI behavior |
| `.cursor/rules/task-ai.mdc` | Task AI behavior (query answering) |
| `.cursor/rules/hitl-ai.mdc` | HITL AI behavior (query answering) |

---

## 📋 Quick Navigation

### By Role

**I'm a User**:
1. [quick-reference.md](quick-reference.md) - Quick lookups
2. [../guides/quick-start.md](../guides/quick-start.md) - Using workflows
3. [../guides/TRAINING.md](../guides/TRAINING.md) - Learning workflows

**I'm an AI**:
1. [quick-reference.md](quick-reference.md) - Quick lookups
2. [../integration/INTEGRATION-GUIDE.md](../integration/INTEGRATION-GUIDE.md) - How to work in system
3. Component AI rules - My behavior

**I'm a Developer**:
1. [../architecture/SYSTEM-OVERVIEW.md](../architecture/SYSTEM-OVERVIEW.md) - Architecture
2. [../architecture/COMPONENT-AI-ARCHITECTURE.md](../architecture/COMPONENT-AI-ARCHITECTURE.md) - Detailed design
3. Component AI rules - Implementation details

---

### By Task

**I need to answer a question**:
1. [quick-reference.md](quick-reference.md) - Who to talk to
2. Appropriate component AI rule - How to answer

**I need to execute a workflow**:
1. [../integration/INTEGRATION-GUIDE.md](../integration/INTEGRATION-GUIDE.md) - How to execute
2. `.cursor/rules/workflow-executor.mdc` - Execution details

**I need to understand the system**:
1. [../architecture/SYSTEM-OVERVIEW.md](../architecture/SYSTEM-OVERVIEW.md) - Architecture
2. [../architecture/COMPONENT-AI-ARCHITECTURE.md](../architecture/COMPONENT-AI-ARCHITECTURE.md) - Detailed design

---

## 🗺️ Documentation Map

```
docs/reference/quick-reference.md (5 min)
  ├─→ docs/architecture/SYSTEM-OVERVIEW.md (10 min)
  │     ├─→ docs/architecture/COMPONENT-AI-ARCHITECTURE.md (15 min)
  │     └─→ docs/integration/PROJECT-QUERY-SYSTEM.md (10 min)
  │
  └─→ docs/integration/INTEGRATION-GUIDE.md (15 min)
        └─→ Component AI Rules (20 min)

docs/guides/
  ├─→ quick-start.md (10 min)
  ├─→ TRAINING.md (30 min)
  ├─→ INSTRUCTIONAL-GUIDE.md (20 min)
  └─→ AI-GUIDE.md (15 min)
```

---

## 🔗 External References

- [Cursor Rules Documentation](https://cursor.sh/docs)
- [YAML Specification](https://yaml.org/spec/)
- [MCP Protocol](https://modelcontextprotocol.io/)
