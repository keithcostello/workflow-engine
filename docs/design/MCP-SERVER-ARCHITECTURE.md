# MCP Server Architecture

**Sprint**: Phase B — MCP Server  
**Source**: PHASE-B-MCP-SPRINT-PRD.md, IMPLEMENTATION-PLAN.md

---

## Overview

The MCP server exposes workflow tools to Cursor AI via stdio transport. Cursor spawns the process and communicates over stdin/stdout using the Model Context Protocol.

---

## Directory Structure

```
mcp-server/
├── package.json          # Dependencies: @modelcontextprotocol/sdk, js-yaml, zod
├── tsconfig.json         # TypeScript config, ES modules
├── src/
│   ├── index.ts          # Entry point, runs server
│   ├── server.ts         # MCP server, stdio transport, tool registration
│   └── workflowManager.ts # Workflow CRUD, YAML load, list workflows
└── dist/                 # Compiled output (npm run build)
```

---

## Components

### server.ts

- **Transport**: `StdioServerTransport` (Cursor spawns process)
- **Server**: `McpServer` from `@modelcontextprotocol/sdk`
- **Tools**: workflow_get_active, workflow_list, workflow_load, workflow_handle_hitl

### workflowManager.ts

- `getActiveWorkflow(projectRoot)` — Read active workflow from `.cursor/workflows/active-workflow.yaml` or project memory
- `listWorkflows(root)` — List YAML files in `workflows/` directory
- `loadWorkflow(root, name)` — Load workflow YAML by name

### index.ts

- Entry point: `runServer()` → connect stdio transport

---

## Tool Schema

| Tool | Purpose |
|------|---------|
| `workflow_get_active` | Get active workflow for project (projectRoot) |
| `workflow_list` | List available workflow templates |
| `workflow_load` | Load workflow definition by name |
| `workflow_handle_hitl` | Document HITL gate (AI relays to user) |

---

## Dependencies

- `@modelcontextprotocol/sdk` — MCP server, stdio transport
- `js-yaml` — Parse workflow YAML
- `zod` — Input validation

---

## Cursor MCP Config

```json
{
  "mcpServers": {
    "workflow-engine": {
      "command": "node",
      "args": ["path/to/mcp-server/dist/index.js"],
      "env": {
        "WORKFLOW_ENGINE_ROOT": "path/to/workflow-engine"
      }
    }
  }
}
```
