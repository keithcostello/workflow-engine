#!/usr/bin/env node
/**
 * Phase C Web Status UI - Piece 1 + 2 + 3
 * Reads: memory/projects/<project>/WAITING_ON.md, workflow-state.json
 *        memory/workflows/<project>/execution-log.md
 * Scans: memory/projects/* for project list and pending gates
 * Config: WORKSPACE_ROOT env or --workspace <path>
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WORKSPACE_ROOT =
  process.env.WORKSPACE_ROOT ||
  process.env.npm_config_workspace ||
  path.resolve(__dirname, "..");

const PORTS = [3456, 3457, 3458];
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : null;
const DEFAULT_PROJECT = "orchestration-training";

function getWaitingOn(project = DEFAULT_PROJECT) {
  const p = path.join(WORKSPACE_ROOT, "memory", "projects", project, "WAITING_ON.md");
  if (!fs.existsSync(p)) {
    return `File not found: ${p}`;
  }
  return fs.readFileSync(p, "utf-8");
}

function getWorkflowState(project = DEFAULT_PROJECT) {
  const p = path.join(WORKSPACE_ROOT, "memory", "projects", project, "workflow-state.json");
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return null;
  }
}

function getExecutionLogLastRun(project = DEFAULT_PROJECT) {
  const p = path.join(WORKSPACE_ROOT, "memory", "workflows", project, "execution-log.md");
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, "utf-8");
  const allRunHeaders = raw.matchAll(/## Run:\s*(.+?)\s*\|\s*\d{4}-\d{2}-\d{2}/g);
  const headers = [...allRunHeaders];
  const lastHeader = headers.length > 0 ? headers[headers.length - 1][1].trim() : null;
  const statusMatch = raw.match(/\*\*Status\*\*:\s*(\S+)/g);
  const lastStatus = statusMatch ? statusMatch[statusMatch.length - 1].replace(/\*\*Status\*\*:\s*/, "") : null;
  const endMatch = raw.match(/\*\*End\*\*:\s*([^\n*]+)/g);
  const lastEnd = endMatch ? endMatch[endMatch.length - 1].replace(/\*\*End\*\*:\s*/, "").trim() : null;
  return {
    workflow: lastHeader || "—",
    status: lastStatus || "—",
    end: lastEnd || "—",
  };
}

function getProjectList() {
  const projectsDir = path.join(WORKSPACE_ROOT, "memory", "projects");
  if (!fs.existsSync(projectsDir)) return [];
  const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
}

function getProjectsWithPendingGates() {
  const projects = getProjectList();
  return projects.filter((p) => {
    const state = getWorkflowState(p);
    return state && state.status === "paused";
  });
}

function html(body) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Web Status UI</title></head>
<body>
<pre>${body.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
</body>
</html>`;
}

function buildPageContent(project) {
  const projects = getProjectList();
  const pendingGates = getProjectsWithPendingGates();
  const waitingOn = getWaitingOn(project);
  const workflowState = getWorkflowState(project);
  const lastRun = getExecutionLogLastRun(project);

  let out = "## Project List\n\n";
  if (projects.length === 0) {
    out += "No projects found in memory/projects/\n\n";
  } else {
    for (const p of projects) {
      const hasPending = pendingGates.includes(p);
      out += `- ${p}${hasPending ? " — **PENDING GATE** (paused workflow)" : ""}\n`;
    }
    out += "\n";
  }

  out += "## Pending Gates\n\n";
  if (pendingGates.length === 0) {
    out += "No paused workflows.\n\n";
  } else {
    for (const p of pendingGates) {
      const state = getWorkflowState(p);
      out += `- **${p}**: paused at ${state?.last_task_id || "—"}\n`;
    }
    out += "\n";
  }

  out += "---\n\n";
  out += `## Project: ${project}\n\n`;
  out += waitingOn;

  out += "\n\n---\n\n## Workflow State\n\n";
  if (workflowState && workflowState.status === "paused") {
    out += `**Paused** at task: ${workflowState.last_task_id || "—"}\n`;
    out += `Workflow: ${workflowState.workflow_path || "—"}\n`;
    out += `Paused at: ${workflowState.paused_at || "—"}\n`;
  } else {
    out += "No paused workflow.\n";
  }

  out += "\n## Last Run (Execution Log)\n\n";
  if (lastRun) {
    out += `**Workflow**: ${lastRun.workflow}\n`;
    out += `**Status**: ${lastRun.status}\n`;
    out += `**End**: ${lastRun.end}\n`;
  } else {
    out += "No execution log found.\n";
  }

  return out;
}

function createServer() {
  const server = http.createServer((req, res) => {
    const port = server.address()?.port;
    const url = new URL(req.url || "/", `http://localhost:${port}`);
    const project = url.searchParams.get("project") || DEFAULT_PROJECT;

    const content = buildPageContent(project);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html(content));
  });
  return server;
}

function tryListen(ports, index = 0) {
  const port = ports[index];
  if (!port) {
    console.error("[web-status-ui] All ports 3456-3458 in use");
    process.exit(1);
  }
  const server = createServer();
  server.listen(port, () => {
    console.error(`[web-status-ui] http://localhost:${port} (workspace: ${WORKSPACE_ROOT})`);
  });
  server.once("error", (err) => {
    if (err.code === "EADDRINUSE") {
      server.close();
      tryListen(ports, index + 1);
    } else {
      throw err;
    }
  });
}

tryListen(PORT ? [PORT] : PORTS);
