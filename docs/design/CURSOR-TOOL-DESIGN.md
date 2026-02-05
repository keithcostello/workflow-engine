# Cursor Workflow Tool Design

## Requirements

1. **External tool** - Installable application
2. **Workflow management** - Configure and manage workflows
3. **Project assignment** - Assign workflows to projects
4. **Cursor integration** - Works inside Cursor
5. **No Python install** - Works on locked-down work machines

---

## Architecture Options

### Option 1: Cursor Extension (Recommended)

**What it is**: A Cursor extension (VS Code extension format)

**How it works**:
- Install via Cursor's extension marketplace
- Provides UI panel in Cursor sidebar
- Manages workflows in workspace
- Integrates with Cursor's AI system

**Pros**:
- ✅ Native Cursor integration
- ✅ UI for workflow management
- ✅ No external dependencies
- ✅ Works on locked-down machines
- ✅ Project-scoped workflows

**Cons**:
- ⚠️ Requires extension development
- ⚠️ Needs Cursor extension API access

---

### Option 2: MCP Server (Model Context Protocol)

**What it is**: MCP server that Cursor connects to

**How it works**:
- Install MCP server (Node.js/Python)
- Configure in Cursor's MCP settings
- Provides tools to Cursor AI
- Manages workflows via API

**Pros**:
- ✅ Works with Cursor's MCP system
- ✅ Can be standalone app
- ✅ Provides tools to AI automatically

**Cons**:
- ⚠️ Requires MCP server setup
- ⚠️ Less UI, more API-based

---

### Option 3: Hybrid: Extension + MCP Server

**What it is**: Extension provides UI, MCP server provides execution

**How it works**:
- Extension: UI for workflow management
- MCP Server: Executes workflows, provides tools to AI
- Both work together

**Pros**:
- ✅ Best of both worlds
- ✅ UI for management
- ✅ MCP for execution

**Cons**:
- ⚠️ More complex setup

---

## Recommended: Cursor Extension

### Architecture

```
┌─────────────────────────────────┐
│         Cursor IDE               │
│  ┌───────────────────────────┐   │
│  │  Workflow Extension       │   │
│  │  ┌─────────────────────┐  │   │
│  │  │  Workflow Manager   │  │   │
│  │  │  - Create workflows │  │   │
│  │  │  - Assign to projects│  │   │
│  │  │  - Execute workflows │  │   │
│  │  └─────────────────────┘  │   │
│  │  ┌─────────────────────┐  │   │
│  │  │  Workflow Storage   │  │   │
│  │  │  (.cursor/workflows) │  │   │
│  │  └─────────────────────┘  │   │
│  └───────────────────────────┘   │
│  ┌───────────────────────────┐   │
│  │  Cursor AI                │  │
│  │  (Executes workflows)     │  │
│  └───────────────────────────┘   │
└─────────────────────────────────┘
```

---

## Extension Structure

```
workflow-extension/
├── package.json              # Extension manifest
├── src/
│   ├── extension.ts          # Main extension code
│   ├── workflowManager.ts    # Workflow management
│   ├── workflowExecutor.ts   # Execute workflows
│   ├── projectManager.ts     # Project assignment
│   └── ui/
│       ├── workflowPanel.ts  # Sidebar panel
│       └── workflowEditor.ts # Workflow editor
├── workflows/               # Default workflows
│   ├── pm-developer.yaml
│   └── simple.yaml
└── README.md
```

---

## Features

### 1. Workflow Management UI

**Sidebar Panel**:
- List of workflows
- Create new workflow
- Edit workflow
- Delete workflow
- Assign to project

**Workflow Editor**:
- Visual editor or YAML editor
- Task builder
- HITL gate configuration
- Retry loop setup
- Condition builder

### 2. Project Assignment

**Project Settings**:
- `.cursor/workflows/active-workflow.yaml`
- Auto-loads when project opens
- Can assign different workflows per project

**Assignment UI**:
- Dropdown: "Select workflow for this project"
- Options: "None", "PM-Developer", "Simple", "Custom..."

### 3. Cursor AI Integration

**Command Palette**:
- `Workflow: Execute Active Workflow`
- `Workflow: Create New Workflow`
- `Workflow: Assign Workflow to Project`

**AI Integration**:
- Extension provides workflow context to AI
- AI can read active workflow
- AI executes workflow using Cursor tools
- HITL gates pause AI, show UI prompt

---

## Implementation Plan

### Phase 1: Basic Extension

1. **Create extension skeleton**
   - `package.json` with Cursor extension config
   - Basic command registration
   - Sidebar panel

2. **Workflow storage**
   - Store workflows in `.cursor/workflows/`
   - JSON/YAML format
   - Project-scoped

3. **Workflow manager**
   - CRUD operations
   - List/load workflows
   - Project assignment

### Phase 2: UI Components

1. **Workflow panel**
   - List workflows
   - Create/edit buttons
   - Project assignment dropdown

2. **Workflow editor**
   - YAML editor with syntax highlighting
   - Or visual task builder
   - Validation

### Phase 3: AI Integration

1. **Workflow context provider**
   - Expose active workflow to AI
   - AI can read workflow definition
   - AI executes using Cursor tools

2. **HITL gate handler**
   - When AI hits HITL gate
   - Show UI prompt (approval/question)
   - Wait for user response
   - Continue workflow

### Phase 4: Execution Engine

1. **Workflow executor**
   - Parse workflow YAML
   - Execute tasks in order
   - Handle HITL gates
   - Manage retries
   - Handle branching

---

## File Structure

### Workspace Structure

```
my-project/
├── .cursor/
│   └── workflows/
│       ├── active-workflow.yaml    # Currently assigned workflow
│       └── custom-workflows/       # Project-specific workflows
│           └── my-workflow.yaml
├── src/
└── ...
```

### Extension Storage

```
~/.cursor/extensions/workflow-extension/
├── workflows/                      # Global workflows
│   ├── pm-developer.yaml
│   ├── simple.yaml
│   └── ...
└── config.json                      # Extension settings
```

---

## User Flow

### 1. Install Extension

```
1. Open Cursor
2. Extensions → Search "Workflow Engine"
3. Install
4. Extension appears in sidebar
```

### 2. Create/Assign Workflow

```
1. Click "Workflows" in sidebar
2. Click "+ Create Workflow" or "Assign Workflow"
3. Select workflow (or create new)
4. Workflow assigned to current project
```

### 3. Execute Workflow

```
Option A: Command Palette
1. Cmd/Ctrl+Shift+P
2. "Workflow: Execute Active Workflow"
3. AI executes workflow

Option B: AI Command
1. Chat with AI: "Execute the active workflow"
2. AI reads workflow, executes it
3. Pauses at HITL gates, shows prompts
4. You respond, workflow continues
```

---

## Technical Details

### Extension Manifest (package.json)

```json
{
  "name": "workflow-engine",
  "displayName": "Workflow Engine",
  "description": "AI workflow orchestration for Cursor",
  "version": "1.0.0",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": ["Other"],
  "activationEvents": ["onStartupFinished"],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "workflow.execute",
        "title": "Execute Active Workflow"
      },
      {
        "command": "workflow.create",
        "title": "Create Workflow"
      },
      {
        "command": "workflow.assign",
        "title": "Assign Workflow to Project"
      }
    ],
    "views": {
      "explorer": [
        {
          "id": "workflowExplorer",
          "name": "Workflows",
          "when": "workflow.enabled"
        }
      ]
    }
  }
}
```

### Workflow Context Provider

```typescript
// Provides workflow context to AI
export class WorkflowContextProvider {
  getActiveWorkflow(): Workflow | null {
    const projectRoot = vscode.workspace.workspaceFolders?.[0]?.uri;
    const workflowPath = path.join(projectRoot, '.cursor', 'workflows', 'active-workflow.yaml');
    
    if (fs.existsSync(workflowPath)) {
      return yaml.load(fs.readFileSync(workflowPath, 'utf8'));
    }
    return null;
  }
  
  // Called by AI to get workflow
  provideContext(): string {
    const workflow = this.getActiveWorkflow();
    if (workflow) {
      return `Active workflow: ${JSON.stringify(workflow)}`;
    }
    return "No active workflow assigned";
  }
}
```

### HITL Gate Handler

```typescript
export class HITLHandler {
  async handleApproval(message: string): Promise<boolean> {
    // Show UI prompt
    const result = await vscode.window.showInformationMessage(
      message,
      { modal: true },
      "Approve",
      "Reject"
    );
    return result === "Approve";
  }
  
  async handleQuestion(message: string, options: string[]): Promise<string> {
    // Show quick pick
    const result = await vscode.window.showQuickPick(options, {
      placeHolder: message
    });
    return result || "";
  }
}
```

---

## Alternative: MCP Server Approach

If extension development is complex, use MCP server:

### MCP Server Structure

```
workflow-mcp-server/
├── package.json
├── src/
│   ├── server.ts           # MCP server
│   ├── workflowManager.ts  # Manage workflows
│   └── tools.ts            # MCP tools for AI
└── workflows/              # Workflow storage
```

### MCP Tools Provided to AI

```typescript
// Tools AI can call
{
  "getActiveWorkflow": {
    description: "Get the active workflow for current project"
  },
  "executeWorkflow": {
    description: "Execute a workflow task"
  },
  "handleHITL": {
    description: "Handle HITL gate (approval/question)"
  }
}
```

### Cursor MCP Config

```json
{
  "mcpServers": {
    "workflow-engine": {
      "command": "node",
      "args": ["path/to/workflow-mcp-server/dist/server.js"],
      "env": {}
    }
  }
}
```

---

## Recommendation

**Start with MCP Server** (easier to build):
1. ✅ No extension marketplace needed
2. ✅ Works with Cursor's existing MCP system
3. ✅ Provides tools to AI automatically
4. ✅ Can add UI later if needed

**Then add Extension** (for UI):
1. Better user experience
2. Visual workflow management
3. Project assignment UI
4. Workflow editor

---

## Next Steps

1. **Build MCP Server** - Provides workflow tools to AI
2. **Create workflow storage** - `.cursor/workflows/` structure
3. **Build workflow executor** - Executes workflows using Cursor tools
4. **Add HITL handlers** - UI prompts for approval/questions
5. **Test integration** - Verify works in Cursor

Would you like me to start building the MCP server version?
