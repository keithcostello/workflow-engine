# Implementation Plan: Cursor Workflow Tool

> **Note**: This plan aligns with `docs/ORCHESTRATION-ROADMAP.md`. Phase A (Docker + gate testing) is complete. MCP server is Phase B.

## Goal

Build an installable tool that:
- ✅ Works in Cursor (no Python install needed)
- ✅ Manages workflows (create, edit, assign)
- ✅ Assigns workflows to projects
- ✅ Integrates with Cursor AI
- ✅ Executes workflows automatically

---

## Phase 1: MCP Server (Quick Start)

### Why MCP Server First?

- ✅ Works with Cursor's existing MCP system
- ✅ No extension marketplace needed
- ✅ Provides tools to AI automatically
- ✅ Easier to build and test
- ✅ Can add UI extension later

### What We Build

**MCP Server** that:
1. Manages workflows (stored in `.cursor/workflows/`)
2. Provides tools to Cursor AI:
   - `get_active_workflow` - Get workflow for current project
   - `execute_workflow_task` - Execute a task
   - `handle_hitl_gate` - Handle approval/question gates
3. Executes workflows using Cursor tools

### File Structure

```
workflow-mcp-server/
├── package.json
├── tsconfig.json
├── src/
│   ├── server.ts              # MCP server setup
│   ├── workflowManager.ts     # CRUD workflows
│   ├── workflowExecutor.ts    # Execute workflows
│   ├── hitlHandler.ts        # Handle HITL gates
│   └── tools.ts               # MCP tools for AI
├── workflows/                  # Default workflows
│   ├── pm-developer.yaml
│   └── simple.yaml
└── README.md
```

---

## Phase 2: Workflow Storage

### Project Structure

```
my-project/
├── .cursor/
│   └── workflows/
│       ├── active-workflow.yaml    # Currently assigned
│       └── custom/                 # Project-specific
│           └── my-workflow.yaml
└── src/
```

### Global Workflows

```
~/.cursor/workflow-engine/
├── workflows/                      # Global templates
│   ├── pm-developer.yaml
│   ├── simple.yaml
│   └── ...
└── config.json                     # Settings
```

---

## Phase 3: Cursor Integration

### MCP Configuration

User adds to Cursor settings:

```json
{
  "mcpServers": {
    "workflow-engine": {
      "command": "node",
      "args": ["~/.cursor/workflow-engine/server.js"],
      "env": {}
    }
  }
}
```

### AI Tools Available

Once configured, AI automatically has access to:

```typescript
// AI can call these tools
{
  "workflow_get_active": {
    description: "Get active workflow for current project",
    returns: "Workflow YAML or null"
  },
  "workflow_execute_task": {
    description: "Execute a workflow task",
    params: { taskId, params }
  },
  "workflow_handle_hitl": {
    description: "Handle HITL gate (approval/question)",
    params: { type, message, options }
  }
}
```

---

## Phase 4: Execution Flow

### How It Works

1. **User assigns workflow** to project
   - Creates `.cursor/workflows/active-workflow.yaml`

2. **User tells AI**: "Execute the active workflow"

3. **AI calls tool**: `workflow_get_active`
   - MCP server reads workflow YAML
   - Returns workflow definition to AI

4. **AI executes workflow**:
   - Reads tasks in order
   - For each task:
     - Calls `workflow_execute_task` (or uses Cursor tools directly)
     - If HITL gate → calls `workflow_handle_hitl`
     - Waits for user response
     - Continues

5. **HITL gates**:
   - AI calls `workflow_handle_hitl`
   - MCP server shows UI prompt (or returns to AI to show)
   - User responds
   - AI continues workflow

---

## Phase 5: UI Extension (Optional, Later)

### Cursor Extension

Adds UI for:
- Workflow management (create, edit, delete)
- Project assignment (dropdown)
- Workflow editor (visual or YAML)
- Execution status

### Extension + MCP Server

- **Extension**: UI for management
- **MCP Server**: Execution engine
- **Together**: Best user experience

---

## Implementation Steps

### Step 1: Build MCP Server Skeleton

```typescript
// src/server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'workflow-engine',
  version: '1.0.0'
});

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'workflow_get_active',
      description: 'Get active workflow for current project'
    },
    {
      name: 'workflow_execute_task',
      description: 'Execute a workflow task'
    },
    {
      name: 'workflow_handle_hitl',
      description: 'Handle HITL gate'
    }
  ]
}));
```

### Step 2: Workflow Manager

```typescript
// src/workflowManager.ts
export class WorkflowManager {
  getActiveWorkflow(projectRoot: string): Workflow | null {
    const path = `${projectRoot}/.cursor/workflows/active-workflow.yaml`;
    if (fs.existsSync(path)) {
      return yaml.load(fs.readFileSync(path, 'utf8'));
    }
    return null;
  }
  
  assignWorkflow(projectRoot: string, workflowName: string) {
    // Copy workflow to project
    const source = `~/.cursor/workflow-engine/workflows/${workflowName}.yaml`;
    const dest = `${projectRoot}/.cursor/workflows/active-workflow.yaml`;
    fs.copyFileSync(source, dest);
  }
}
```

### Step 3: Workflow Executor

```typescript
// src/workflowExecutor.ts
export class WorkflowExecutor {
  async executeTask(task: Task, context: ExecutionContext) {
    // AI executes using Cursor tools
    // This is called by AI, not by executor directly
    // Executor just provides workflow definition
  }
}
```

### Step 4: HITL Handler

```typescript
// src/hitlHandler.ts
export class HITLHandler {
  async handleApproval(message: string): Promise<boolean> {
    // For MCP: Return to AI, AI shows prompt
    // For Extension: Show UI prompt
    return true; // User approved
  }
  
  async handleQuestion(message: string, options: string[]): Promise<string> {
    // Return to AI, AI shows quick pick
    return options[0]; // User selected
  }
}
```

---

## Installation

### For User

1. **Install MCP Server**:
   ```bash
   npm install -g @workflow-engine/mcp-server
   ```

2. **Configure Cursor**:
   - Open Cursor settings
   - Add MCP server config
   - Restart Cursor

3. **Assign Workflow**:
   - Command: `workflow:assign pm-developer`
   - Or: Create `.cursor/workflows/active-workflow.yaml`

4. **Use**:
   - Tell AI: "Execute the active workflow"
   - AI executes, pauses at HITL gates
   - You respond, workflow continues

---

## Next Steps

1. ✅ Design complete
2. ✅ Phase A: Docker workflow + gate scenario matrix (build_docker, run_container, GATE-SCENARIO-MATRIX.md)
3. ⏭️ Phase B: Build MCP server skeleton
4. ⏭️ Implement workflow manager
5. ⏭️ Add MCP tools for AI
6. ⏭️ Test in Cursor
7. ⏭️ Phase C–E: Web status UI, workflow builder, GitHub install scripts (see ORCHESTRATION-ROADMAP.md)

Ready to start Phase B (MCP server)?
