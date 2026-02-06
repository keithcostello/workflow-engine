#!/usr/bin/env node
/**
 * Phase D Web Workflow Builder - Piece 1
 * Minimal web app: list workflows from workflows/; view YAML (read-only)
 * 
 * Features:
 * - Workflow list with table view (Name, Tasks, Last Run, Status)
 * - Workflow detail view with 60/40 split (YAML left, roles right)
 * - Professional styling matching PHASE-D-UI-SPEC.md
 * 
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

// ============================================================================
// COMMON STYLES (Phase D UI Spec compliant)
// ============================================================================
const CSS_STYLES = `
  :root {
    --bg-light: #f5f5f5;
    --bg-white: #ffffff;
    --sidebar-bg: #2d2d2d;
    --sidebar-text: #ffffff;
    --text-primary: #333333;
    --text-secondary: #666666;
    --border-light: #e0e0e0;
    --accent-blue: #0066cc;
    --accent-orange: #f5a623;
    --code-bg: #1e1e1e;
    --code-text: #d4d4d4;
    --code-key: #569cd6;
    --code-string: #6a9955;
    --code-comment: #6a9955;
  }
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-primary);
    background: var(--bg-light);
  }
  
  .layout {
    display: flex;
    min-height: 100vh;
  }
  
  .sidebar {
    width: 240px;
    background: var(--sidebar-bg);
    color: var(--sidebar-text);
    padding: 20px 0;
    flex-shrink: 0;
  }
  
  .sidebar-header {
    padding: 0 16px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    margin-bottom: 16px;
  }
  
  .sidebar-header h1 {
    font-size: 16px;
    font-weight: 600;
  }
  
  .sidebar-nav a {
    display: block;
    padding: 10px 16px;
    color: var(--sidebar-text);
    text-decoration: none;
    transition: background 0.2s;
  }
  
  .sidebar-nav a:hover {
    background: rgba(255,255,255,0.1);
  }
  
  .sidebar-nav a.active {
    background: rgba(255,255,255,0.15);
    border-left: 3px solid var(--accent-blue);
  }
  
  .main-content {
    flex: 1;
    padding: 24px 32px;
    overflow-x: auto;
  }
  
  .page-header {
    margin-bottom: 24px;
  }
  
  .page-header h1 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .page-header p {
    color: var(--text-secondary);
    margin-top: 4px;
  }
  
  .breadcrumb {
    margin-bottom: 16px;
  }
  
  .breadcrumb a {
    color: var(--accent-blue);
    text-decoration: none;
  }
  
  .breadcrumb a:hover {
    text-decoration: underline;
  }
  
  .breadcrumb span {
    color: var(--text-secondary);
    margin: 0 8px;
  }
  
  /* Tables */
  .data-table {
    width: 100%;
    background: var(--bg-white);
    border-radius: 8px;
    border: 1px solid var(--border-light);
    border-collapse: collapse;
    overflow: hidden;
  }
  
  .data-table th {
    text-align: left;
    padding: 12px 16px;
    background: #fafafa;
    border-bottom: 1px solid var(--border-light);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .data-table td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-light);
  }
  
  .data-table tr:last-child td {
    border-bottom: none;
  }
  
  .data-table tr:nth-child(even) {
    background: #fafafa;
  }
  
  .data-table tr:hover {
    background: #f0f7ff;
  }
  
  .data-table a {
    color: var(--accent-blue);
    text-decoration: none;
  }
  
  .data-table a:hover {
    text-decoration: underline;
  }
  
  /* Status badges */
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .badge-success {
    background: #e6f4ea;
    color: #1e7e34;
  }
  
  .badge-warning {
    background: #fff3e0;
    color: #e65100;
  }
  
  .badge-info {
    background: #e3f2fd;
    color: #1565c0;
  }
  
  .badge-default {
    background: #f5f5f5;
    color: #666;
  }
  
  /* Split layout for workflow detail */
  .split-layout {
    display: flex;
    gap: 24px;
  }
  
  .split-left {
    flex: 6;
    min-width: 0;
  }
  
  .split-right {
    flex: 4;
    min-width: 0;
  }
  
  /* Code block */
  .code-block {
    background: var(--code-bg);
    border-radius: 8px;
    overflow: hidden;
  }
  
  .code-header {
    background: #252526;
    padding: 8px 16px;
    color: #ccc;
    font-size: 12px;
    border-bottom: 1px solid #3c3c3c;
  }
  
  .code-content {
    padding: 16px;
    overflow-x: auto;
    max-height: 70vh;
    overflow-y: auto;
  }
  
  .code-content pre {
    margin: 0;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
    font-size: 13px;
    line-height: 1.6;
    color: var(--code-text);
    white-space: pre;
  }
  
  /* Role cards */
  .role-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .role-card {
    background: var(--bg-white);
    border: 1px solid var(--border-light);
    border-radius: 8px;
    padding: 16px;
  }
  
  .role-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  
  .role-card-header h3 {
    font-size: 14px;
    font-weight: 600;
  }
  
  .role-card p {
    color: var(--text-secondary);
    font-size: 13px;
  }
  
  .mode-badge {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 500;
  }
  
  .mode-agent {
    background: #e3f2fd;
    color: #1565c0;
  }
  
  .mode-plan {
    background: #f3e5f5;
    color: #7b1fa2;
  }
  
  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 48px;
    border: 2px dashed var(--border-light);
    border-radius: 8px;
    color: var(--text-secondary);
  }
  
  .empty-state-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  /* Cards */
  .card {
    background: var(--bg-white);
    border: 1px solid var(--border-light);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
  }
  
  .card h2 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  
  /* Section header */
  .section-header {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-secondary);
    margin-bottom: 12px;
  }
`;

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


function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

/**
 * Get workflow metadata (name, version, task count, roles)
 */
function getWorkflowMeta(filename) {
  const doc = getWorkflowParsed(filename);
  if (!doc) return null;
  const w = doc.workflow || doc;
  const tasks = w.tasks || [];
  const roles = w.roles || {};
  return {
    filename,
    name: w.name || filename.replace(".yaml", ""),
    version: w.version || "—",
    taskCount: tasks.length,
    roleCount: Object.keys(roles).length,
    roles: Object.entries(roles).map(([id, r]) => ({
      id,
      mode: r.mode || "agent",
      description: r.description || "",
    })),
    tasks,
  };
}

/**
 * Syntax highlight YAML for display
 */
function highlightYaml(yamlStr) {
  return yamlStr
    .split("\n")
    .map((line) => {
      // Comments
      if (line.trim().startsWith("#")) {
        return `<span style="color:#6a9955">${escapeHtml(line)}</span>`;
      }
      // Key-value pairs
      const keyMatch = line.match(/^(\s*)([a-zA-Z_][a-zA-Z0-9_-]*)(\s*:\s*)(.*)$/);
      if (keyMatch) {
        const [, indent, key, colon, value] = keyMatch;
        let valueHtml = escapeHtml(value);
        // Highlight strings in quotes
        if (value.startsWith('"') || value.startsWith("'")) {
          valueHtml = `<span style="color:#ce9178">${escapeHtml(value)}</span>`;
        } else if (value === "true" || value === "false") {
          valueHtml = `<span style="color:#569cd6">${escapeHtml(value)}</span>`;
        } else if (/^\d+$/.test(value)) {
          valueHtml = `<span style="color:#b5cea8">${escapeHtml(value)}</span>`;
        }
        return `${escapeHtml(indent)}<span style="color:#9cdcfe">${escapeHtml(key)}</span><span style="color:#d4d4d4">${escapeHtml(colon)}</span>${valueHtml}`;
      }
      // List items
      const listMatch = line.match(/^(\s*)(- )(.*)$/);
      if (listMatch) {
        const [, indent, dash, rest] = listMatch;
        return `${escapeHtml(indent)}<span style="color:#d4d4d4">${escapeHtml(dash)}</span>${escapeHtml(rest)}`;
      }
      return escapeHtml(line);
    })
    .join("\n");
}

/**
 * Build sidebar HTML
 */
function buildSidebar(baseUrl, activePage = "") {
  return `
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>Workflow Builder</h1>
      </div>
      <nav class="sidebar-nav">
        <a href="${baseUrl}/" class="${activePage === "dashboard" ? "active" : ""}">Dashboard</a>
        <a href="${baseUrl}/workflows" class="${activePage === "workflows" ? "active" : ""}">Workflows</a>
      </nav>
    </aside>
  `;
}

/**
 * Wrap page content in layout
 */
function wrapLayout(content, baseUrl, activePage = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Workflow Builder</title>
  <style>${CSS_STYLES}</style>
</head>
<body>
  <div class="layout">
    ${buildSidebar(baseUrl, activePage)}
    <main class="main-content">
      ${content}
    </main>
  </div>
</body>
</html>`;
}

/**
 * Build workflow list page (Phase D UI Spec - Prompt 9)
 */
function buildWorkflowListPage(baseUrl) {
  const workflows = getWorkflowList();
  
  if (workflows.length === 0) {
    const emptyContent = `
      <div class="page-header">
        <h1>Workflows</h1>
        <p>Manage workflow definitions</p>
      </div>
      <div class="empty-state">
        <div class="empty-state-icon">+</div>
        <p>No workflows found in workflows/</p>
        <p>Add your first workflow</p>
      </div>
    `;
    return wrapLayout(emptyContent, baseUrl, "workflows");
  }
  
  // Build table rows with workflow metadata
  const rows = workflows.map((filename) => {
    const meta = getWorkflowMeta(filename);
    const displayName = meta ? meta.name : filename.replace(".yaml", "");
    const taskCount = meta ? meta.taskCount : "—";
    const version = meta ? meta.version : "—";
    
    return `
      <tr>
        <td>
          <a href="${baseUrl}/workflow?name=${encodeURIComponent(filename)}">${escapeHtml(displayName)}</a>
          <div style="font-size:12px;color:#666">${escapeHtml(filename)}</div>
        </td>
        <td>${taskCount}</td>
        <td><span class="badge badge-default">v${escapeHtml(version)}</span></td>
        <td><span class="badge badge-success">Ready</span></td>
        <td>
          <a href="${baseUrl}/workflow?name=${encodeURIComponent(filename)}">View</a>
        </td>
      </tr>
    `;
  }).join("");
  
  const content = `
    <div class="page-header">
      <h1>Workflows</h1>
      <p>Manage workflow definitions from the workflows/ directory</p>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Workflow Name</th>
          <th>Tasks</th>
          <th>Version</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
  
  return wrapLayout(content, baseUrl, "workflows");
}

/**
 * Build workflow detail page (Phase D UI Spec - Prompt 10)
 * Read-only view with 60/40 split: YAML left, role cards right
 */
function buildWorkflowDetailPage(name, baseUrl) {
  const yamlRaw = getWorkflowYaml(name);
  const meta = getWorkflowMeta(name);
  
  if (!yamlRaw || !meta) {
    const notFoundContent = `
      <div class="breadcrumb">
        <a href="${baseUrl}/workflows">Workflows</a>
        <span>/</span>
        <span>${escapeHtml(name)}</span>
      </div>
      <div class="card">
        <p>Workflow not found: ${escapeHtml(name)}</p>
      </div>
    `;
    return wrapLayout(notFoundContent, baseUrl, "workflows");
  }
  
  // Build role cards
  const roleCards = meta.roles.length > 0
    ? meta.roles.map((role) => `
        <div class="role-card">
          <div class="role-card-header">
            <h3>${escapeHtml(role.id)}</h3>
            <span class="mode-badge ${role.mode === "agent" ? "mode-agent" : "mode-plan"}">${escapeHtml(role.mode)}</span>
          </div>
          <p>${escapeHtml(role.description || "No description")}</p>
        </div>
      `).join("")
    : '<p style="color:#666">No roles defined</p>';
  
  const content = `
    <div class="breadcrumb">
      <a href="${baseUrl}/workflows">Workflows</a>
      <span>/</span>
      <span>${escapeHtml(meta.name)}</span>
    </div>
    
    <div class="page-header">
      <h1>${escapeHtml(meta.name)}</h1>
      <p>Version ${escapeHtml(meta.version)} · ${meta.taskCount} tasks · ${meta.roleCount} roles · Read-only view</p>
    </div>
    
    <div class="split-layout">
      <div class="split-left">
        <div class="code-block">
          <div class="code-header">
            ${escapeHtml(name)}
          </div>
          <div class="code-content">
            <pre>${highlightYaml(yamlRaw)}</pre>
          </div>
        </div>
      </div>
      
      <div class="split-right">
        <div class="section-header">Roles</div>
        <div class="role-cards">
          ${roleCards}
        </div>
        
        <div style="margin-top:24px">
          <div class="section-header">Tasks Summary</div>
          <div class="card">
            <p><strong>${meta.taskCount}</strong> tasks in this workflow</p>
            ${meta.tasks.slice(0, 5).map((t) => `
              <div style="margin-top:8px;padding:8px;background:#f9f9f9;border-radius:4px;font-size:13px">
                <strong>${escapeHtml(t.id || "—")}</strong>
                <span style="color:#666"> — ${escapeHtml(t.name || "")}</span>
                ${t.hitl && t.hitl.type !== "none" ? `<span class="badge badge-warning" style="margin-left:8px">${escapeHtml(t.hitl.type)}</span>` : ""}
              </div>
            `).join("")}
            ${meta.tasks.length > 5 ? `<p style="margin-top:8px;color:#666;font-size:13px">...and ${meta.tasks.length - 5} more tasks</p>` : ""}
          </div>
        </div>
      </div>
    </div>
  `;
  
  return wrapLayout(content, baseUrl, "workflows");
}

/**
 * Build workflow edit page (placeholder for Piece 2+)
 * For Piece 1, this redirects to read-only view
 */
function buildWorkflowEditPage(name, baseUrl) {
  const doc = getWorkflowParsed(name);
  if (!doc) {
    const notFoundContent = `
      <div class="breadcrumb">
        <a href="${baseUrl}/workflows">Workflows</a>
        <span>/</span>
        <span>Edit</span>
      </div>
      <div class="card">
        <p>Workflow not found: ${escapeHtml(name)}</p>
        <a href="${baseUrl}/workflows">Back to Workflows</a>
      </div>
    `;
    return wrapLayout(notFoundContent, baseUrl, "workflows");
  }
  
  // For Piece 1, editing is not implemented - show read-only with message
  const meta = getWorkflowMeta(name);
  const content = `
    <div class="breadcrumb">
      <a href="${baseUrl}/workflows">Workflows</a>
      <span>/</span>
      <a href="${baseUrl}/workflow?name=${encodeURIComponent(name)}">${escapeHtml(meta?.name || name)}</a>
      <span>/</span>
      <span>Edit</span>
    </div>
    
    <div class="page-header">
      <h1>Edit: ${escapeHtml(meta?.name || name)}</h1>
      <p>Editing features coming in Piece 2</p>
    </div>
    
    <div class="card" style="background:#fff3e0;border-color:#f5a623">
      <p style="color:#e65100">Editing is not yet implemented. This is Piece 1 (read-only view).</p>
      <p style="margin-top:8px"><a href="${baseUrl}/workflow?name=${encodeURIComponent(name)}">View workflow (read-only)</a></p>
    </div>
  `;
  
  return wrapLayout(content, baseUrl, "workflows");
}

/**
 * Build main dashboard page (styled version)
 */
function buildDashboardPage(project, baseUrl) {
  const projects = getProjectList();
  const pendingGates = getProjectsWithPendingGates();
  const waitingOn = getWaitingOn(project);
  const workflowState = getWorkflowState(project);
  const lastRun = getExecutionLogLastRun(project);
  const workflows = getWorkflowList();
  
  // Project selector
  const projectOptions = projects.map((p) => 
    `<option value="${escapeHtml(p)}" ${p === project ? "selected" : ""}>${escapeHtml(p)}</option>`
  ).join("");
  
  // Pending gates list
  const pendingList = pendingGates.length > 0
    ? pendingGates.map((p) => {
        const state = getWorkflowState(p);
        return `
          <div class="card" style="border-left:4px solid var(--accent-orange)">
            <strong>${escapeHtml(p)}</strong>
            <p style="color:#666;margin-top:4px">Paused at: ${escapeHtml(state?.last_task_id || "—")}</p>
          </div>
        `;
      }).join("")
    : '<p style="color:#666">No pending gates</p>';
  
  // Current project status
  let statusContent = "";
  if (workflowState && workflowState.status === "paused") {
    statusContent = `
      <div class="card" style="border-left:4px solid var(--accent-orange)">
        <span class="badge badge-warning">Paused</span>
        <p style="margin-top:8px"><strong>Task:</strong> ${escapeHtml(workflowState.last_task_id || "—")}</p>
        <p><strong>Workflow:</strong> ${escapeHtml(workflowState.workflow_path || "—")}</p>
        <p><strong>Paused at:</strong> ${escapeHtml(workflowState.paused_at || "—")}</p>
      </div>
    `;
  } else {
    statusContent = '<div class="card"><span class="badge badge-success">Active</span><p style="margin-top:8px">No paused workflows</p></div>';
  }
  
  // Last run
  const lastRunContent = lastRun
    ? `
      <div class="card">
        <p><strong>Workflow:</strong> ${escapeHtml(lastRun.workflow)}</p>
        <p><strong>Status:</strong> ${escapeHtml(lastRun.status)}</p>
        <p><strong>End:</strong> ${escapeHtml(lastRun.end)}</p>
      </div>
    `
    : '<div class="card"><p style="color:#666">No execution log found</p></div>';
  
  const content = `
    <div class="page-header">
      <h1>Project Dashboard</h1>
      <p>Workflow orchestration status and management</p>
    </div>
    
    <div style="display:flex;gap:24px;flex-wrap:wrap">
      <div style="flex:1;min-width:300px">
        <div class="section-header">Project</div>
        <div class="card">
          <form method="GET" action="${baseUrl}/">
            <select name="project" onchange="this.form.submit()" style="width:100%;padding:8px;font-size:14px;border:1px solid #ddd;border-radius:4px">
              ${projectOptions}
            </select>
          </form>
        </div>
        
        <div class="section-header">Current Status</div>
        ${statusContent}
        
        <div class="section-header">Last Run</div>
        ${lastRunContent}
      </div>
      
      <div style="flex:1;min-width:300px">
        <div class="section-header">Pending Gates <span class="badge badge-warning">${pendingGates.length}</span></div>
        ${pendingList}
        
        <div class="section-header" style="margin-top:24px">Quick Links</div>
        <div class="card">
          <p><a href="${baseUrl}/workflows">View All Workflows (${workflows.length})</a></p>
        </div>
      </div>
    </div>
    
    <div style="margin-top:24px">
      <div class="section-header">WAITING_ON.md</div>
      <div class="code-block">
        <div class="code-header">${escapeHtml(project)}/WAITING_ON.md</div>
        <div class="code-content">
          <pre style="color:#d4d4d4">${escapeHtml(waitingOn)}</pre>
        </div>
      </div>
    </div>
  `;
  
  return wrapLayout(content, baseUrl, "dashboard");
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
    const baseUrl = "";  // Use relative URLs for cleaner navigation

    const handleResponse = (content) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(content);
    };

    // POST handler for workflow save (will be used in Piece 2+)
    if (req.method === "POST" && url.pathname === "/workflow/save" && workflowName) {
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", () => {
        const parsed = parseFormBody(body);
        saveWorkflow(workflowName, parsed);
        res.writeHead(302, { Location: `/workflow/edit?name=${encodeURIComponent(workflowName)}` });
        res.end();
      });
      return;
    }

    // Workflow list page
    if (url.pathname === "/workflows") {
      handleResponse(buildWorkflowListPage(baseUrl));
      return;
    }
    
    // Workflow edit page (placeholder for Piece 2+)
    if (url.pathname === "/workflow/edit" && workflowName) {
      handleResponse(buildWorkflowEditPage(workflowName, baseUrl));
      return;
    }
    
    // Workflow detail page (read-only)
    if (url.pathname === "/workflow" && workflowName) {
      handleResponse(buildWorkflowDetailPage(workflowName, baseUrl));
      return;
    }

    // Main dashboard
    handleResponse(buildDashboardPage(project, baseUrl));
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
