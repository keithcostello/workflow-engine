# Workflow Engine MCP Server

MCP server for the orchestration workflow engine. Exposes workflow tools to Cursor AI via stdio transport.

## Tools

- `workflow_get_active` — Get active workflow for a project
- `workflow_list` — List available workflow templates
- `workflow_load` — Load a workflow definition by name
- `workflow_handle_hitl` — Document HITL gate (AI relays to user)

## Build

```bash
npm install
npm run build
```

## Cursor MCP Config

Add to your Cursor MCP settings (`.cursor/mcp.json` or Cursor Settings → MCP):

```json
{
  "mcpServers": {
    "workflow-engine": {
      "command": "node",
      "args": ["C:/PROJECTS/cursor_allvue/orchestration-training/workflow-engine/mcp-server/dist/index.js"],
      "env": {
        "WORKFLOW_ENGINE_ROOT": "C:/PROJECTS/cursor_allvue/orchestration-training/workflow-engine"
      }
    }
  }
}
```

Replace paths with your actual workflow-engine location.

## Setup Notes

- **Config location**: `.cursor/mcp.json` is at the **workspace root**, not inside `mcp-server` or `workflow-engine`.
- **Path format**: Use forward slashes; `c:/` and `C:/` both work on Windows.
- **Windows**: Project-level config may not load. Use **Cursor Settings → Features → MCP** as a fallback.

## Validation (Test Results)

| Test | Result |
|------|--------|
| `tools/list` | All 4 tools returned: workflow_get_active, workflow_list, workflow_load, workflow_handle_hitl |
| `workflow_list` | Returned 11 workflows (e.g. minimal-workflow, docker-hello-workflow, phase-b-mcp-sprint-workflow) |
