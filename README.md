# Workflow Engine - Component AI System

## 🎯 Overview

A workflow orchestration system where:
- **Projects** are queryable (ask questions, get answers)
- **Components** have AI agents (each knows its job)
- **Workflows** are declarative (YAML defines, AI executes)
- **HITL** is built-in (approval, question, info gates)
- **Monitoring** is available (status at all levels)

---

## 🚀 Quick Start

### Install from GitHub (npm)

```bash
npm install github:keithcostello/workflow-engine
```

**For AI setup** (when user provides the GitHub URL): After `npm install`, the AI should:
1. Create `memory/projects/` and `memory/workflows/` at workspace root
2. Create `.cursor/mcp.json` with `command: "node"`, `args: ["<workspace>/node_modules/workflow-engine/mcp-server/dist/index.js"]`, `env: { "WORKFLOW_ENGINE_ROOT": "<workspace>/node_modules/workflow-engine" }`
3. Copy `.cursor/rules/*` from `node_modules/workflow-engine/.cursor/rules/` to workspace `.cursor/rules/`
4. Tell user: "Go to Cursor Settings → Features → MCP and activate 'workflow-engine'"

**Package structure** (for AI discovery):
- MCP entry: `mcp-server/dist/index.js`
- Workflows: `workflows/*.yaml`
- AI rules: `.cursor/rules/*.mdc`
- Artifacts: `artifacts/` (workflows write here; paths use `node_modules/workflow-engine/artifacts/`)

### Install (Terminal, clone-based)

```bash
# Unix/macOS
./install.sh

# Windows PowerShell
.\install.ps1
```

Or: clone the repo, run the install script from `workflow-engine/`, then open the project in Cursor.

### For Users

1. **Ask questions**: "What's the status of orchestration-training?"
2. **Execute workflows**: "Execute workflows/minimal-workflow.yaml"
3. **Monitor progress**: "What task is running?"
4. **Interact with gates**: Respond to HITL prompts

### For AIs

1. **Read**: [docs/reference/quick-reference.md](docs/reference/quick-reference.md) (5 min)
2. **Read**: [docs/architecture/SYSTEM-OVERVIEW.md](docs/architecture/SYSTEM-OVERVIEW.md) (10 min)
3. **Read**: Component AI rules (`.cursor/rules/*.mdc`)
4. **Understand**: Each component's responsibilities

---

## 📚 Documentation

> **📖 [docs/README.md](docs/README.md)** - Complete navigation guide

### Essential Reading (Start Here)

| Document | Purpose | Time |
|----------|---------|------|
| **[docs/reference/cheat-sheet.md](docs/reference/cheat-sheet.md)** ⚡ | Visual cheat sheet, print for reference | 2 min |
| **[docs/reference/quick-reference.md](docs/reference/quick-reference.md)** ⭐ | Quick lookups, who to talk to | 5 min |
| **[docs/architecture/SYSTEM-OVERVIEW.md](docs/architecture/SYSTEM-OVERVIEW.md)** | Architecture, how it works | 10 min |
| **[docs/integration/INTEGRATION-GUIDE.md](docs/integration/INTEGRATION-GUIDE.md)** | How AIs work in this system | 15 min |

### Deep Dive

| Document | Purpose | Time |
|----------|---------|------|
| **[docs/architecture/COMPONENT-AI-ARCHITECTURE.md](docs/architecture/COMPONENT-AI-ARCHITECTURE.md)** | Detailed architecture | 15 min |
| **[docs/integration/PROJECT-QUERY-SYSTEM.md](docs/integration/PROJECT-QUERY-SYSTEM.md)** | Query system details | 10 min |
| **[docs/design/workflow-execution-log.md](docs/design/workflow-execution-log.md)** | Per-action workflow logging | 5 min |
| **[docs/guides/quick-start.md](docs/guides/quick-start.md)** | Workflow quick start | 10 min |
| **[docs/guides/TRAINING.md](docs/guides/TRAINING.md)** | Training guide | 30 min |

### Component AI Rules

| Rule | Purpose |
|------|---------|
| `.cursor/rules/project-ai.mdc` | Project AI behavior |
| `.cursor/rules/workflow-ai.mdc` | Workflow AI behavior |
| `.cursor/rules/task-ai.mdc` | Task AI behavior |
| `.cursor/rules/hitl-ai.mdc` | HITL AI behavior |
| `.cursor/rules/workflow-executor.mdc` | Workflow execution |

---

## 📍 File Structure

```
workflow-engine/
├── docs/                          # All documentation
│   ├── architecture/              # System design
│   ├── guides/                    # How-to guides
│   ├── reference/                 # Quick lookups
│   ├── integration/               # Integration docs
│   ├── design/                    # Design decisions
│   └── testing/                   # Test reports
├── src/                           # Source code
│   └── workflow_executor.py
├── workflows/                     # Workflow YAML files
│   ├── minimal-workflow.yaml      # Demo workflow
│   ├── docker-hello-workflow.yaml # Docker build + run demo
│   ├── phase-a-remediation-workflow.yaml # Phase A validation (walking skeleton)
│   ├── docker-hello/              # Docker context for demo
│   ├── simple-workflow.yaml
│   ├── retry-loop-workflow.yaml
│   ├── custom-workflow.yaml      # Customization proof (C1, C2, C4)
│   ├── handoff-test-workflow.yaml # Handoff scenario testing
│   ├── adhoc-hitl-workflow.yaml # Forced ad-hoc HITL (AI stops to ask)
│   └── workflow-definition.yaml
├── artifacts/                     # Workflow outputs (e.g. demo.txt)
├── .cursor/
│   └── rules/                     # AI rules
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── install.sh                     # Terminal install (Unix/macOS)
├── install.ps1                    # Terminal install (Windows)
└── requirements.txt
```

---

## 🔄 How It Works

### Workflow Execution

```
1. User: "Execute workflows/minimal-workflow.yaml"
2. Workflow AI: Loads YAML, coordinates execution
3. Task AI: Executes tasks using Cursor tools
4. HITL AI: Handles gates, waits for user
5. Workflow AI: Tracks progress
6. Project AI: Updates project state
```

### Query System

```
1. User: "What's the status of orchestration-training?"
2. System: Identifies this is a project query
3. Project AI: Activates, reads memory, answers
```

---

## 🎓 Key Concepts

- **Component AI Agents**: Each component has an AI that knows its domain
- **Query System**: Ask questions → Appropriate AI answers
- **Intersections**: Components coordinate at intersections
- **State Tracking**: All state in memory files. Per-action workflow log: `memory/workflows/<project>/execution-log.md`
- **Workflow Execution**: YAML defines, AI executes using Cursor tools

---

## ❓ Common Questions

**Q: Who handles project queries?**  
A: Project AI (see [docs/reference/quick-reference.md](docs/reference/quick-reference.md))

**Q: How do I execute a workflow?**  
A: Ask Workflow AI: "Execute workflows/minimal-workflow.yaml"

**Q: What task is running?**  
A: Ask Task AI: "What task is running?"

**Q: What gate is waiting?**  
A: Ask HITL AI: "What gate is waiting?"

**Q: Where is project state?**  
A: `memory/projects/<project>/WAITING_ON.md`

**Q: Where is the workflow execution log?**  
A: `memory/workflows/<project>/execution-log.md`. See [docs/design/workflow-execution-log.md](docs/design/workflow-execution-log.md).

---

## 📝 License

MIT License (see `LICENSE` file)

---

## 🤝 Contributing

See `CONTRIBUTING.md` for guidelines.
