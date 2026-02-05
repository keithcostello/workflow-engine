/**
 * WorkflowManager - CRUD for workflows
 * Reads workflow YAML from project .cursor/workflows/ or global workflows
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

export interface WorkflowTask {
  id: string;
  name: string;
  role?: string;
  action: string;
  params?: Record<string, unknown>;
  hitl?: {
    type: string;
    message?: string;
    options?: string[];
    auto_continue?: boolean;
  };
  on_complete?: string;
}

export interface Workflow {
  workflow: {
    name: string;
    version?: string;
    roles?: Record<string, unknown>;
    tasks: WorkflowTask[];
  };
}

/**
 * Get active workflow for a project.
 * Looks in: projectRoot/.cursor/workflows/active-workflow.yaml
 * Fallback: WORKFLOW_ENGINE_ROOT/workflows/*.yaml by name
 */
export function getActiveWorkflow(projectRoot: string): Workflow | null {
  const activePath = path.join(projectRoot, ".cursor", "workflows", "active-workflow.yaml");
  if (fs.existsSync(activePath)) {
    try {
      const content = fs.readFileSync(activePath, "utf-8");
      return yaml.load(content) as Workflow;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * List available workflows from the workflow-engine workflows directory
 */
export function listWorkflows(workflowEngineRoot: string): string[] {
  const workflowsDir = path.join(workflowEngineRoot, "workflows");
  if (!fs.existsSync(workflowsDir)) return [];
  return fs.readdirSync(workflowsDir)
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    .map((f) => path.basename(f, path.extname(f)));
}

/**
 * Load a workflow by name from workflow-engine
 */
export function loadWorkflow(workflowEngineRoot: string, name: string): Workflow | null {
  const base = path.join(workflowEngineRoot, "workflows");
  for (const ext of [".yaml", ".yml"]) {
    const p = path.join(base, `${name}${ext}`);
    if (fs.existsSync(p)) {
      try {
        const content = fs.readFileSync(p, "utf-8");
        return yaml.load(content) as Workflow;
      } catch {
        return null;
      }
    }
  }
  return null;
}
