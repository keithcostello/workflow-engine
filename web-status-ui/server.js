#!/usr/bin/env node
/**
 * Phase C Web Status UI - Piece 1 + 2 + 3
 * Phase D Piece 1: List workflows from workflows/; view YAML (read-only)
 * Reads: memory/projects/<project>/WAITING_ON.md, workflow-state.json
 *        memory/workflows/<project>/execution-log.md
 * Scans: memory/projects/* for project list and pending gates
 *        workflows/*.yaml for workflow list
 * Config: WORKSPACE_ROOT env or --workspace <path>
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

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

function getWorkflowList() {
  const workflowsDir = path.join(WORKSPACE_ROOT, "workflows");
  if (!fs.existsSync(workflowsDir)) return [];
  const entries = fs.readdirSync(workflowsDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".yaml"))
    .map((e) => e.name)
    .sort();
}

function getWorkflowYaml(name) {
  if (!name || name.includes("..") || name.includes("/")) return null;
  const p = path.join(WORKSPACE_ROOT, "workflows", name);
  if (!fs.existsSync(p)) return null;
  try {
    return fs.readFileSync(p, "utf-8");
  } catch {
    return null;
  }
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

function buildPageContent(project, baseUrl = "") {
  const projects = getProjectList();
  const pendingGates = getProjectsWithPendingGates();
  const waitingOn = getWaitingOn(project);
  const workflowState = getWorkflowState(project);
  const lastRun = getExecutionLogLastRun(project);

  let out = "";
  if (baseUrl && projects.length > 0) {
    out += "## Project Selector\n\n";
    out += projects.map((p) => `${p === project ? "→ " : ""}${p}: ${baseUrl}/?project=${encodeURIComponent(p)}`).join("\n");
    out += "\n\n";
  }
  out += "## Project List\n\n";
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

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildWorkflowListPage(baseUrl) {
  const workflows = getWorkflowList();
  const items = workflows
    .map(
      (w) =>
        `<li><a href="${baseUrl}/workflow?name=${encodeURIComponent(w)}">${escapeHtml(w)}</a> ` +
        `<a href="${baseUrl}/workflow/edit?name=${encodeURIComponent(w)}">Edit</a></li>`
    )
    .join("");
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Workflow List</title></head>
<body>
<h1>Workflow List</h1>
<p><a href="${baseUrl}/">← Project Status</a></p>
${workflows.length === 0 ? "<p>No workflows found in workflows/</p>" : `<ul>${items}</ul>`}
</body>
</html>`;
}

function getWorkflowParsed(name) {
  const raw = getWorkflowYaml(name);
  if (!raw) return null;
  try {
    return yaml.load(raw);
  } catch {
    return null;
  }
}

function buildWorkflowDetailPage(name, baseUrl) {
  const yamlRaw = getWorkflowYaml(name);
  const yamlEscaped = yamlRaw ? escapeHtml(yamlRaw) : "";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${escapeHtml(name)}</title></head>
<body>
<h1>Workflow: ${escapeHtml(name)} (read-only)</h1>
<p><a href="${baseUrl}/workflows">← Workflow List</a> | <a href="${baseUrl}/workflow/edit?name=${encodeURIComponent(name)}">Edit</a> | <a href="${baseUrl}/">← Project Status</a></p>
${!yamlRaw ? `<p>Workflow not found: ${escapeHtml(name)}</p>` : `<pre><code>${yamlEscaped}</code></pre>`}
</body>
</html>`;
}

function buildWorkflowEditPage(name, baseUrl) {
  const doc = getWorkflowParsed(name);
  if (!doc) {
    return `<!DOCTYPE html><html><body><p>Workflow not found: ${escapeHtml(name)}</p><a href="${baseUrl}/workflows">← Back</a></body></html>`;
  }
  const w = doc.workflow || doc;
  const workflowName = w.name || "";
  const version = w.version || "";
  const roles = w.roles || {};
  const roleEntries = Object.entries(roles)
    .map(
      ([id, r]) =>
        `<div style="border:1px solid #ccc;padding:8px;margin:4px 0;">
          <strong>${escapeHtml(id)}</strong> — mode: ${escapeHtml(r.mode || "")}, desc: ${escapeHtml(r.description || "")}
          <form method="POST" action="${baseUrl}/workflow/save?name=${encodeURIComponent(name)}" style="display:inline">
            <input type="hidden" name="workflow_name" value="${escapeHtml(workflowName)}" />
            <input type="hidden" name="version" value="${escapeHtml(version)}" />
            <button type="submit" name="remove_role" value="${escapeHtml(id)}">Remove</button>
          </form>
        </div>`
    )
    .join("");

  const tasks = w.tasks || [];
  const taskEntries = tasks
    .map(
      (t, i) => {
        const hitl = t.hitl || {};
        return `<div style="border:1px solid #999;padding:8px;margin:4px 0;">
          <strong>${escapeHtml(t.id || "?")}</strong> — ${escapeHtml(t.name || "")} | role: ${escapeHtml(t.role || "")} | on_complete: ${escapeHtml(t.on_complete || "next")}
          | HITL: ${escapeHtml(hitl.type || "none")} ${hitl.message ? escapeHtml(hitl.message.slice(0, 40)) + "…" : ""}
          <form method="POST" action="${baseUrl}/workflow/save?name=${encodeURIComponent(name)}" style="display:inline">
            <input type="hidden" name="workflow_name" value="${escapeHtml(workflowName)}" />
            <input type="hidden" name="version" value="${escapeHtml(version)}" />
            <button type="submit" name="remove_task" value="${escapeHtml(String(i))}">Remove</button>
          </form>
        </div>`;
      }
    )
    .join("");
  const roleIds = Object.keys(roles);
  const roleOptions = roleIds.map((r) => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Edit ${escapeHtml(name)}</title></head>
<body>
<h1>Edit Workflow: ${escapeHtml(name)}</h1>
<p><a href="${baseUrl}/workflow?name=${encodeURIComponent(name)}">← View (read-only)</a> | <a href="${baseUrl}/workflows">← Workflow List</a></p>
<form method="POST" action="${baseUrl}/workflow/save?name=${encodeURIComponent(name)}">
  <p><label>Workflow Name: <input name="workflow_name" value="${escapeHtml(workflowName)}" size="40" /></label></p>
  <p><label>Version: <input name="version" value="${escapeHtml(version)}" size="20" /></label></p>
  <h2>Roles</h2>
  ${roleEntries}
  <h3>Add Role</h3>
  <p><label>ID: <input name="new_role_id" placeholder="e.g. developer" /></label></p>
  <p><label>Mode: <select name="new_role_mode"><option value="agent">agent</option><option value="plan">plan</option></select></label></p>
  <p><label>Description: <input name="new_role_desc" placeholder="description" size="40" /></label></p>
  <p><button type="submit" name="add_role" value="1">Add Role</button></p>
  <hr/>
  <h2>Tasks</h2>
  ${taskEntries}
  <h3>Add Task</h3>
  <p><label>ID: <input name="new_task_id" placeholder="e.g. my_task" /></label></p>
  <p><label>Name: <input name="new_task_name" placeholder="Task name" size="40" /></label></p>
  <p><label>Role: <select name="new_task_role">${roleOptions || "<option value=''>—</option>"}</select></label></p>
  <p><label>Action: <input name="new_task_action" placeholder="e.g. implement" size="20" /></label></p>
  <p><label>On Complete: <input name="new_task_on_complete" placeholder="next or task_id" value="next" size="20" /></label></p>
  <h4>HITL</h4>
  <p><label>Type: <select name="new_task_hitl_type"><option value="none">none</option><option value="approval">approval</option><option value="question">question</option><option value="info">info</option></select></label></p>
  <p><label>Message: <input name="new_task_hitl_message" placeholder="HITL message" size="50" /></label></p>
  <p><button type="submit" name="add_task" value="1">Add Task</button></p>
  <hr/>
  <p><button type="submit" name="save" value="1">Save</button></p>
</form>
</body>
</html>`;
}

function saveWorkflow(name, body) {
  const doc = getWorkflowParsed(name);
  if (!doc) return false;
  const w = doc.workflow || doc;

  if (body.workflow_name) w.name = body.workflow_name;
  if (body.version) w.version = body.version;

  if (body.add_role && body.new_role_id) {
    w.roles = w.roles || {};
    w.roles[body.new_role_id] = {
      mode: body.new_role_mode || "agent",
      description: body.new_role_desc || "",
    };
  }
  if (body.remove_role) {
    w.roles = w.roles || {};
    delete w.roles[body.remove_role];
  }

  if (body.add_task && body.new_task_id) {
    w.tasks = w.tasks || [];
    w.tasks.push({
      id: body.new_task_id,
      name: body.new_task_name || body.new_task_id,
      role: body.new_task_role || "developer",
      action: body.new_task_action || "implement",
      on_complete: body.new_task_on_complete || "next",
      hitl: body.new_task_hitl_type && body.new_task_hitl_type !== "none"
        ? { type: body.new_task_hitl_type, message: body.new_task_hitl_message || "" }
        : { type: "none" },
    });
  }
  if (body.remove_task !== undefined) {
    const idx = parseInt(body.remove_task, 10);
    if (!isNaN(idx) && w.tasks && w.tasks[idx]) {
      w.tasks.splice(idx, 1);
    }
  }

  const out = yaml.dump(doc, { lineWidth: -1 });
  const p = path.join(WORKSPACE_ROOT, "workflows", name);
  fs.writeFileSync(p, out, "utf-8");
  return true;
}

function parseFormBody(raw) {
  const out = {};
  for (const pair of raw.split("&")) {
    const [k, v] = pair.split("=").map((s) => decodeURIComponent(s.replace(/\+/g, " ")));
    if (k && v) out[k] = v;
  }
  return out;
}

function createServer() {
  const server = http.createServer((req, res) => {
    const port = server.address()?.port;
    const url = new URL(req.url || "/", `http://localhost:${port}`);
    const project = url.searchParams.get("project") || DEFAULT_PROJECT;
    const workflowName = url.searchParams.get("name");
    const baseUrl = `http://localhost:${port}`;

    const handleResponse = (content, isHtml = false) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(isHtml ? content : html(content));
    };

    if (req.method === "POST" && url.pathname === "/workflow/save" && workflowName) {
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", () => {
        const parsed = parseFormBody(body);
        saveWorkflow(workflowName, parsed);
        res.writeHead(302, { Location: `${baseUrl}/workflow/edit?name=${encodeURIComponent(workflowName)}` });
        res.end();
      });
      return;
    }

    if (url.pathname === "/workflows") {
      handleResponse(buildWorkflowListPage(baseUrl), true);
      return;
    }
    if (url.pathname === "/workflow/edit" && workflowName) {
      handleResponse(buildWorkflowEditPage(workflowName, baseUrl), true);
      return;
    }
    if (url.pathname === "/workflow" && workflowName) {
      handleResponse(buildWorkflowDetailPage(workflowName, baseUrl), true);
      return;
    }

    let content = buildPageContent(project, baseUrl);
    content += "\n\n---\n\n## Workflows\n\nView: " + baseUrl + "/workflows\n";
    handleResponse(content);
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
