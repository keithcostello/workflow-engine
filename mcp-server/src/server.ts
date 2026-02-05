/**
 * MCP Server for Orchestration Workflow Engine
 * Exposes tools: workflow_get_active, workflow_execute_task, workflow_handle_hitl
 */

import * as z from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  getActiveWorkflow,
  listWorkflows,
  loadWorkflow,
  type Workflow,
} from "./workflowManager.js";

const WORKFLOW_ENGINE_ROOT =
  process.env.WORKFLOW_ENGINE_ROOT || process.cwd();

function createServer(): McpServer {
  const server = new McpServer(
    {
      name: "workflow-engine",
      version: "0.1.0",
    },
    { capabilities: { logging: {} } }
  );

  // workflow_get_active - Get active workflow for current project
  server.registerTool(
    "workflow_get_active",
    {
      title: "Get Active Workflow",
      description: "Get the active workflow for the current project. Returns workflow YAML or null if none assigned.",
      inputSchema: {
        projectRoot: z.string().describe("Path to project root (e.g. workspace directory)"),
      },
    },
    async ({ projectRoot }) => {
      try {
        const workflow = getActiveWorkflow(projectRoot);
        if (!workflow) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ active: null, message: "No active workflow assigned" }),
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                active: true,
                name: workflow.workflow?.name,
                tasks: workflow.workflow?.tasks?.map((t) => ({ id: t.id, name: t.name, action: t.action })),
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                error: String(error),
                active: null,
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // workflow_list - List available workflows
  server.registerTool(
    "workflow_list",
    {
      title: "List Workflows",
      description: "List available workflow templates from the workflow engine",
      inputSchema: {
        workflowEngineRoot: z.string().optional().describe("Path to workflow-engine root (default: cwd)"),
      },
    },
    async ({ workflowEngineRoot }) => {
      const root = workflowEngineRoot || WORKFLOW_ENGINE_ROOT;
      const names = listWorkflows(root);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ workflows: names }),
          },
        ],
      };
    }
  );

  // workflow_load - Load a workflow by name
  server.registerTool(
    "workflow_load",
    {
      title: "Load Workflow",
      description: "Load a workflow definition by name from the workflow engine",
      inputSchema: {
        name: z.string().describe("Workflow name (e.g. minimal-workflow, docker-hello-workflow)"),
        workflowEngineRoot: z.string().optional().describe("Path to workflow-engine root"),
      },
    },
    async ({ name, workflowEngineRoot }) => {
      const root = workflowEngineRoot || WORKFLOW_ENGINE_ROOT;
      const workflow = loadWorkflow(root, name);
      if (!workflow) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: `Workflow '${name}' not found`, workflow: null }),
            },
          ],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(workflow),
          },
        ],
      };
    }
  );

  // workflow_handle_hitl - Placeholder for HITL gate handling
  // In MCP, HITL is typically handled by the AI relaying to the user; this tool documents the gate
  server.registerTool(
    "workflow_handle_hitl",
    {
      title: "Handle HITL Gate",
      description: "Record or document a HITL (human-in-the-loop) gate. The AI should relay the message to the user and wait for response. This tool logs the gate info.",
      inputSchema: {
        taskId: z.string().describe("Task ID at the gate"),
        type: z.enum(["approval", "question", "info"]).describe("Gate type"),
        message: z.string().describe("Message to show user"),
        options: z.array(z.string()).optional().describe("Options for question type"),
      },
    },
    async ({ taskId, type, message, options }) => {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              hitl: { taskId, type, message, options },
              instruction: "Relay this to the user. Wait for response before continuing.",
            }),
          },
        ],
      };
    }
  );

  return server;
}

export async function runServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log to stderr only - stdout is for JSON-RPC
  console.error("[workflow-engine] MCP server running on stdio");
}
