#!/usr/bin/env node
/**
 * Phase D Web Workflow Builder - Piece 1 & 2
 * Web app: List workflows from workflows/; view/edit YAML
 * 
 * Piece 1 Features:
 * - Workflow List: Table with Name, Tasks count, Last Run, Status
 * - Workflow Detail: Split 60/40 layout - YAML code block + role cards
 * - Modern UI matching Phase D UI Spec
 * 
 * Piece 2 Features:
 * - Edit workflow name and version
 * - Add/Edit/Remove roles (CRUD)
 * - Save workflow changes
 * 
 * Config: WORKSPACE_ROOT env or defaults to parent directory
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

// ─────────────────────────────────────────────────────────────────────────────
// Shared CSS Styles (matching Phase D UI Spec)
// ─────────────────────────────────────────────────────────────────────────────

const COMMON_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    background: #f5f5f5;
  }
  a { color: #0066cc; text-decoration: none; }
  a:hover { text-decoration: underline; }
  
  .header {
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    height: 56px;
  }
  .header h1 {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
  .header-nav {
    display: flex;
    gap: 16px;
    margin-left: auto;
  }
  .header-nav a {
    padding: 6px 12px;
    border-radius: 4px;
    background: #f0f0f0;
    color: #333;
    font-size: 13px;
  }
  .header-nav a:hover {
    background: #e0e0e0;
    text-decoration: none;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
  }
  
  .card {
    background: #fff;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    padding: 20px;
    margin-bottom: 16px;
  }
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #333;
  }
  
  .btn {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    text-decoration: none;
  }
  .btn-primary {
    background: #0066cc;
    color: #fff;
  }
  .btn-primary:hover {
    background: #0055aa;
    text-decoration: none;
  }
  .btn-secondary {
    background: #f0f0f0;
    color: #333;
  }
  .btn-secondary:hover {
    background: #e0e0e0;
  }
  .btn-danger {
    background: #dc3545;
    color: #fff;
  }
  .btn-danger:hover {
    background: #c82333;
    text-decoration: none;
  }
  .btn-success {
    background: #28a745;
    color: #fff;
  }
  .btn-success:hover {
    background: #218838;
    text-decoration: none;
  }
  .btn-sm {
    padding: 4px 10px;
    font-size: 12px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  .form-label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #333;
    margin-bottom: 6px;
  }
  .form-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
  }
  .form-input:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
  .form-select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background: #fff;
  }
  .form-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
    min-height: 80px;
    resize: vertical;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .modal {
    background: #fff;
    border-radius: 8px;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
  .modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #888;
    cursor: pointer;
    line-height: 1;
  }
  .modal-close:hover {
    color: #333;
  }
  .modal-body {
    padding: 20px;
  }
  .modal-footer {
    padding: 16px 20px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  
  .alert {
    padding: 12px 16px;
    border-radius: 4px;
    margin-bottom: 16px;
  }
  .alert-success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  .alert-error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Project/Status Helpers (from Phase C)
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Workflow Helpers
// ─────────────────────────────────────────────────────────────────────────────

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

function getWorkflowParsed(name) {
  const raw = getWorkflowYaml(name);
  if (!raw) return null;
  try {
    return yaml.load(raw);
  } catch {
    return null;
  }
}

// YAML dump options to preserve formatting
const YAML_DUMP_OPTIONS = {
  indent: 2,
  lineWidth: -1,
  quotingType: '"',
  forceQuotes: false,
  noCompatMode: true
};

function saveWorkflowYaml(name, yamlContent) {
  if (!name || name.includes("..") || name.includes("/")) return { success: false, error: "Invalid filename" };
  const p = path.join(WORKSPACE_ROOT, "workflows", name);
  try {
    // Validate YAML is parseable
    yaml.load(yamlContent);
    fs.writeFileSync(p, yamlContent, "utf-8");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function updateWorkflowMetadata(name, updates) {
  if (!name || name.includes("..") || name.includes("/")) {
    return { success: false, error: "Invalid filename" };
  }
  const p = path.join(WORKSPACE_ROOT, "workflows", name);
  if (!fs.existsSync(p)) {
    return { success: false, error: "Workflow not found" };
  }
  try {
    const raw = fs.readFileSync(p, "utf-8");
    const doc = yaml.load(raw);
    const w = doc?.workflow || doc;
    
    // Update metadata
    if (updates.name !== undefined) w.name = updates.name;
    if (updates.version !== undefined) w.version = updates.version;
    
    // Update roles
    if (updates.roles !== undefined) {
      w.roles = updates.roles;
    }
    
    // Serialize back to YAML
    const newContent = yaml.dump(doc, YAML_DUMP_OPTIONS);
    fs.writeFileSync(p, newContent, "utf-8");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function addRole(name, roleId, roleData) {
  if (!name || name.includes("..") || name.includes("/")) {
    return { success: false, error: "Invalid filename" };
  }
  const p = path.join(WORKSPACE_ROOT, "workflows", name);
  if (!fs.existsSync(p)) {
    return { success: false, error: "Workflow not found" };
  }
  try {
    const raw = fs.readFileSync(p, "utf-8");
    const doc = yaml.load(raw);
    const w = doc?.workflow || doc;
    
    if (!w.roles) w.roles = {};
    if (w.roles[roleId]) {
      return { success: false, error: `Role '${roleId}' already exists` };
    }
    
    w.roles[roleId] = {
      mode: roleData.mode || "agent",
      description: roleData.description || ""
    };
    
    const newContent = yaml.dump(doc, YAML_DUMP_OPTIONS);
    fs.writeFileSync(p, newContent, "utf-8");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function updateRole(name, roleId, roleData) {
  if (!name || name.includes("..") || name.includes("/")) {
    return { success: false, error: "Invalid filename" };
  }
  const p = path.join(WORKSPACE_ROOT, "workflows", name);
  if (!fs.existsSync(p)) {
    return { success: false, error: "Workflow not found" };
  }
  try {
    const raw = fs.readFileSync(p, "utf-8");
    const doc = yaml.load(raw);
    const w = doc?.workflow || doc;
    
    if (!w.roles || !w.roles[roleId]) {
      return { success: false, error: `Role '${roleId}' not found` };
    }
    
    // If renaming role
    if (roleData.newId && roleData.newId !== roleId) {
      if (w.roles[roleData.newId]) {
        return { success: false, error: `Role '${roleData.newId}' already exists` };
      }
      w.roles[roleData.newId] = {
        mode: roleData.mode || w.roles[roleId].mode || "agent",
        description: roleData.description !== undefined ? roleData.description : w.roles[roleId].description || ""
      };
      delete w.roles[roleId];
    } else {
      if (roleData.mode !== undefined) w.roles[roleId].mode = roleData.mode;
      if (roleData.description !== undefined) w.roles[roleId].description = roleData.description;
    }
    
    const newContent = yaml.dump(doc, YAML_DUMP_OPTIONS);
    fs.writeFileSync(p, newContent, "utf-8");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function deleteRole(name, roleId) {
  if (!name || name.includes("..") || name.includes("/")) {
    return { success: false, error: "Invalid filename" };
  }
  const p = path.join(WORKSPACE_ROOT, "workflows", name);
  if (!fs.existsSync(p)) {
    return { success: false, error: "Workflow not found" };
  }
  try {
    const raw = fs.readFileSync(p, "utf-8");
    const doc = yaml.load(raw);
    const w = doc?.workflow || doc;
    
    if (!w.roles || !w.roles[roleId]) {
      return { success: false, error: `Role '${roleId}' not found` };
    }
    
    delete w.roles[roleId];
    
    const newContent = yaml.dump(doc, YAML_DUMP_OPTIONS);
    fs.writeFileSync(p, newContent, "utf-8");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow List Page (Piece 1 - Part 1)
// Table with columns: Workflow Name, Tasks, Last Run, Status
// ─────────────────────────────────────────────────────────────────────────────

function buildWorkflowListPage(baseUrl) {
  const workflows = getWorkflowList();
  
  // Get workflow metadata for each workflow
  const workflowData = workflows.map((name) => {
    const doc = getWorkflowParsed(name);
    const w = doc?.workflow || doc || {};
    const tasks = w.tasks || [];
    const taskCount = tasks.length;
    
    // Try to get last run info for this workflow
    let lastRun = "—";
    let status = "—";
    
    // Check execution log for this workflow
    const execLogPath = path.join(WORKSPACE_ROOT, "memory", "workflows", "orchestration-training", "execution-log.md");
    if (fs.existsSync(execLogPath)) {
      const log = fs.readFileSync(execLogPath, "utf-8");
      const workflowBaseName = name.replace(".yaml", "").replace(/-/g, " ");
      // Simple check if this workflow appears in logs
      if (log.toLowerCase().includes(workflowBaseName.toLowerCase()) || 
          log.includes(name) || 
          log.includes(w.name || "")) {
        status = "Run";
      }
    }
    
    return {
      name,
      displayName: w.name || name.replace(".yaml", ""),
      taskCount,
      lastRun,
      status
    };
  });

  const tableRows = workflowData.map((w, i) => `
    <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
      <td>
        <a href="${baseUrl}/workflow?name=${encodeURIComponent(w.name)}" class="workflow-link">
          ${escapeHtml(w.displayName)}
        </a>
        <div class="workflow-file">${escapeHtml(w.name)}</div>
      </td>
      <td class="center">${w.taskCount}</td>
      <td class="center">${escapeHtml(w.lastRun)}</td>
      <td class="center">
        <span class="status-badge ${w.status === 'Run' ? 'status-success' : 'status-default'}">
          ${escapeHtml(w.status)}
        </span>
      </td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Workflow List</title>
  <style>
    ${COMMON_STYLES}
    
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin-bottom: 24px;
    }
    
    .workflow-table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e0e0e0;
    }
    .workflow-table th {
      background: #fafafa;
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e0e0e0;
    }
    .workflow-table td {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
    }
    .workflow-table tr:last-child td {
      border-bottom: none;
    }
    .row-even { background: #fff; }
    .row-odd { background: #fafafa; }
    .workflow-table tr:hover {
      background: #f5f8ff;
    }
    
    .workflow-link {
      font-weight: 500;
      font-size: 15px;
    }
    .workflow-file {
      font-size: 12px;
      color: #888;
      margin-top: 2px;
    }
    
    .center { text-align: center; }
    
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-success {
      background: #e6f4ea;
      color: #1e7e34;
    }
    .status-default {
      background: #f0f0f0;
      color: #666;
    }
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #888;
    }
    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    .empty-state-text {
      font-size: 16px;
    }
    .empty-state-box {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <header class="header">
    <h1>Workflow Builder</h1>
    <nav class="header-nav">
      <a href="${baseUrl}/">Project Status</a>
      <a href="${baseUrl}/workflows">Workflows</a>
    </nav>
  </header>
  
  <div class="container">
    <h2 class="page-title">Workflows</h2>
    
    ${workflows.length === 0 ? `
      <div class="empty-state">
        <div class="empty-state-box">
          <div class="empty-state-icon">+</div>
          <div class="empty-state-text">No workflows found in workflows/</div>
          <p style="margin-top: 12px; color: #aaa;">Add your first workflow</p>
        </div>
      </div>
    ` : `
      <table class="workflow-table">
        <thead>
          <tr>
            <th>Workflow Name</th>
            <th class="center">Tasks</th>
            <th class="center">Last Run</th>
            <th class="center">Status</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `}
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow Detail Page (Piece 1 + Piece 2)
// Split 60/40: YAML code block | Metadata form + Role cards with CRUD
// ─────────────────────────────────────────────────────────────────────────────

function buildWorkflowDetailPage(name, baseUrl, message = null) {
  const yamlRaw = getWorkflowYaml(name);
  const doc = getWorkflowParsed(name);
  const w = doc?.workflow || doc || {};
  const roles = w.roles || {};
  const workflowName = w.name || name.replace(".yaml", "");
  const workflowVersion = w.version || "1.0";

  // Build role cards with Edit/Delete buttons
  const roleCards = Object.entries(roles).map(([id, role]) => `
    <div class="role-card" data-role-id="${escapeHtml(id)}">
      <div class="role-header">
        <span class="role-name">${escapeHtml(id)}</span>
        <span class="role-mode ${role.mode === 'agent' ? 'mode-agent' : 'mode-plan'}">
          ${escapeHtml(role.mode || 'agent')}
        </span>
        <div class="role-actions">
          <button type="button" class="btn btn-sm btn-secondary" onclick="openEditRoleModal('${escapeHtml(id)}', '${escapeHtml(role.mode || 'agent')}', '${escapeHtml((role.description || '').replace(/'/g, "\\'"))}')">Edit</button>
          <button type="button" class="btn btn-sm btn-danger" onclick="confirmDeleteRole('${escapeHtml(id)}')">Delete</button>
        </div>
      </div>
      <div class="role-description">${escapeHtml(role.description || 'No description')}</div>
    </div>
  `).join("");

  // Syntax highlight YAML
  const highlightedYaml = yamlRaw ? syntaxHighlightYaml(yamlRaw) : '<span class="no-content">Workflow not found</span>';

  // Message alert
  const alertHtml = message ? `
    <div class="alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}">
      ${escapeHtml(message.text)}
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(workflowName)} - Workflow Editor</title>
  <style>
    ${COMMON_STYLES}
    
    .breadcrumb {
      background: #fff;
      padding: 12px 24px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 13px;
      color: #666;
    }
    .breadcrumb a {
      color: #0066cc;
    }
    .breadcrumb span {
      margin: 0 8px;
      color: #ccc;
    }
    
    .detail-header {
      background: #fff;
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .detail-title {
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
    .detail-subtitle {
      font-size: 14px;
      color: #888;
      margin-top: 4px;
    }
    .edit-badge {
      display: inline-block;
      background: #e3f2fd;
      color: #1565c0;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      margin-left: 12px;
    }
    
    .split-container {
      display: flex;
      gap: 0;
      min-height: calc(100vh - 180px);
    }
    
    .yaml-panel {
      flex: 0 0 55%;
      background: #1e1e1e;
      overflow: auto;
      padding: 20px;
    }
    .yaml-code {
      font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
      font-size: 13px;
      line-height: 1.6;
      color: #d4d4d4;
      white-space: pre;
      margin: 0;
    }
    .yaml-code .key { color: #9cdcfe; }
    .yaml-code .string { color: #ce9178; }
    .yaml-code .number { color: #b5cea8; }
    .yaml-code .comment { color: #6a9955; }
    .yaml-code .boolean { color: #569cd6; }
    
    .editor-panel {
      flex: 0 0 45%;
      background: #fafafa;
      padding: 24px;
      overflow: auto;
      border-left: 1px solid #e0e0e0;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
    
    .metadata-form {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .metadata-form .form-row {
      display: flex;
      gap: 16px;
    }
    .metadata-form .form-row .form-group {
      flex: 1;
    }
    .metadata-form .form-actions {
      margin-top: 16px;
      display: flex;
      gap: 12px;
    }
    
    .role-card {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
    }
    .role-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }
    .role-name {
      font-weight: 600;
      font-size: 15px;
      color: #333;
    }
    .role-mode {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
    }
    .mode-agent {
      background: #e3f2fd;
      color: #1565c0;
    }
    .mode-plan {
      background: #f3e5f5;
      color: #7b1fa2;
    }
    .role-actions {
      margin-left: auto;
      display: flex;
      gap: 8px;
    }
    .role-description {
      font-size: 13px;
      color: #666;
    }
    
    .add-role-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 16px;
      border: 2px dashed #ccc;
      border-radius: 8px;
      background: transparent;
      color: #666;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .add-role-btn:hover {
      border-color: #0066cc;
      color: #0066cc;
      background: #f0f7ff;
    }
    .add-role-btn .plus-icon {
      font-size: 20px;
      font-weight: 300;
    }
    
    .no-roles {
      color: #888;
      font-style: italic;
      margin-bottom: 16px;
    }
    
    .no-content {
      color: #888;
    }
    
    /* Modal styles - hidden by default */
    #roleModal {
      display: none;
    }
    #roleModal.show {
      display: flex;
    }
    #deleteConfirmModal {
      display: none;
    }
    #deleteConfirmModal.show {
      display: flex;
    }
  </style>
</head>
<body>
  <header class="header">
    <h1>Workflow Builder</h1>
    <nav class="header-nav">
      <a href="${baseUrl}/">Project Status</a>
      <a href="${baseUrl}/workflows">Workflows</a>
    </nav>
  </header>
  
  <div class="breadcrumb">
    <a href="${baseUrl}/workflows">Workflows</a>
    <span>/</span>
    ${escapeHtml(name)}
  </div>
  
  <div class="detail-header">
    <div>
      <h2 class="detail-title">
        ${escapeHtml(workflowName)}
        <span class="edit-badge">Editable</span>
      </h2>
      <div class="detail-subtitle">${escapeHtml(name)}</div>
    </div>
  </div>
  
  <div class="split-container">
    <div class="yaml-panel">
      <pre class="yaml-code">${highlightedYaml}</pre>
    </div>
    
    <div class="editor-panel">
      ${alertHtml}
      
      <!-- Metadata Form -->
      <div class="section-header">
        <h3 class="section-title">Workflow Metadata</h3>
      </div>
      <form class="metadata-form" method="POST" action="${baseUrl}/api/workflow/metadata?name=${encodeURIComponent(name)}">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="wf-name">Workflow Name</label>
            <input type="text" class="form-input" id="wf-name" name="workflowName" value="${escapeHtml(workflowName)}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="wf-version">Version</label>
            <input type="text" class="form-input" id="wf-version" name="version" value="${escapeHtml(workflowVersion)}" required>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Save Metadata</button>
        </div>
      </form>
      
      <!-- Roles Section -->
      <div class="section-header">
        <h3 class="section-title">Roles</h3>
      </div>
      ${Object.keys(roles).length === 0 ? 
        '<p class="no-roles">No roles defined</p>' : 
        roleCards
      }
      <button type="button" class="add-role-btn" onclick="openAddRoleModal()">
        <span class="plus-icon">+</span>
        <span>Add Role</span>
      </button>
    </div>
  </div>
  
  <!-- Add/Edit Role Modal -->
  <div id="roleModal" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title" id="roleModalTitle">Add Role</h3>
        <button type="button" class="modal-close" onclick="closeRoleModal()">&times;</button>
      </div>
      <form id="roleForm" method="POST" action="">
        <input type="hidden" id="originalRoleId" name="originalRoleId" value="">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="roleId">Role ID</label>
            <input type="text" class="form-input" id="roleId" name="roleId" placeholder="e.g., developer, reviewer" required pattern="[a-zA-Z_][a-zA-Z0-9_-]*">
            <small style="color: #888; font-size: 12px;">Letters, numbers, underscores, hyphens. Must start with letter or underscore.</small>
          </div>
          <div class="form-group">
            <label class="form-label" for="roleMode">Mode</label>
            <select class="form-select" id="roleMode" name="mode">
              <option value="agent">Agent</option>
              <option value="plan">Plan</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="roleDescription">Description</label>
            <textarea class="form-textarea" id="roleDescription" name="description" placeholder="Describe what this role does..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeRoleModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" id="roleSubmitBtn">Add Role</button>
        </div>
      </form>
    </div>
  </div>
  
  <!-- Delete Confirmation Modal -->
  <div id="deleteConfirmModal" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Delete Role</h3>
        <button type="button" class="modal-close" onclick="closeDeleteModal()">&times;</button>
      </div>
      <form id="deleteForm" method="POST" action="">
        <div class="modal-body">
          <p>Are you sure you want to delete the role "<strong id="deleteRoleName"></strong>"?</p>
          <p style="color: #888; font-size: 13px; margin-top: 8px;">This action cannot be undone. Tasks using this role may become invalid.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeDeleteModal()">Cancel</button>
          <button type="submit" class="btn btn-danger">Delete Role</button>
        </div>
      </form>
    </div>
  </div>
  
  <script>
    const workflowName = ${JSON.stringify(name)};
    const baseUrl = ${JSON.stringify(baseUrl)};
    
    function openAddRoleModal() {
      document.getElementById('roleModalTitle').textContent = 'Add Role';
      document.getElementById('roleSubmitBtn').textContent = 'Add Role';
      document.getElementById('roleForm').action = baseUrl + '/api/workflow/role/add?name=' + encodeURIComponent(workflowName);
      document.getElementById('originalRoleId').value = '';
      document.getElementById('roleId').value = '';
      document.getElementById('roleMode').value = 'agent';
      document.getElementById('roleDescription').value = '';
      document.getElementById('roleId').removeAttribute('readonly');
      document.getElementById('roleModal').classList.add('show');
    }
    
    function openEditRoleModal(roleId, mode, description) {
      document.getElementById('roleModalTitle').textContent = 'Edit Role';
      document.getElementById('roleSubmitBtn').textContent = 'Save Changes';
      document.getElementById('roleForm').action = baseUrl + '/api/workflow/role/update?name=' + encodeURIComponent(workflowName);
      document.getElementById('originalRoleId').value = roleId;
      document.getElementById('roleId').value = roleId;
      document.getElementById('roleMode').value = mode;
      document.getElementById('roleDescription').value = description;
      document.getElementById('roleModal').classList.add('show');
    }
    
    function closeRoleModal() {
      document.getElementById('roleModal').classList.remove('show');
    }
    
    function confirmDeleteRole(roleId) {
      document.getElementById('deleteRoleName').textContent = roleId;
      document.getElementById('deleteForm').action = baseUrl + '/api/workflow/role/delete?name=' + encodeURIComponent(workflowName) + '&roleId=' + encodeURIComponent(roleId);
      document.getElementById('deleteConfirmModal').classList.add('show');
    }
    
    function closeDeleteModal() {
      document.getElementById('deleteConfirmModal').classList.remove('show');
    }
    
    // Close modals on overlay click
    document.getElementById('roleModal').addEventListener('click', function(e) {
      if (e.target === this) closeRoleModal();
    });
    document.getElementById('deleteConfirmModal').addEventListener('click', function(e) {
      if (e.target === this) closeDeleteModal();
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeRoleModal();
        closeDeleteModal();
      }
    });
  </script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// YAML Syntax Highlighting
// ─────────────────────────────────────────────────────────────────────────────

function syntaxHighlightYaml(yamlStr) {
  return escapeHtml(yamlStr)
    .split('\n')
    .map(line => {
      // Comment lines
      if (line.trim().startsWith('#')) {
        return `<span class="comment">${line}</span>`;
      }
      
      // Key-value pairs
      let result = line;
      
      // Highlight keys (before colon)
      result = result.replace(/^(\s*)([a-zA-Z_][a-zA-Z0-9_-]*)(:\s*)/g, 
        '$1<span class="key">$2</span>$3');
      
      // Highlight strings in quotes
      result = result.replace(/"([^"]*?)"/g, '<span class="string">"$1"</span>');
      
      // Highlight numbers
      result = result.replace(/:\s*(\d+)(\s*)$/g, ': <span class="number">$1</span>$2');
      
      // Highlight booleans
      result = result.replace(/:\s*(true|false)(\s*)$/gi, ': <span class="boolean">$1</span>$2');
      
      return result;
    })
    .join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Project Status Page (from Phase C, enhanced styling)
// ─────────────────────────────────────────────────────────────────────────────

function buildProjectStatusPage(project, baseUrl) {
  const projects = getProjectList();
  const pendingGates = getProjectsWithPendingGates();
  const waitingOn = getWaitingOn(project);
  const workflowState = getWorkflowState(project);
  const lastRun = getExecutionLogLastRun(project);

  const projectOptions = projects.map(p => 
    `<option value="${escapeHtml(p)}" ${p === project ? 'selected' : ''}>${escapeHtml(p)}</option>`
  ).join("");

  const pendingCount = pendingGates.length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Project Status - ${escapeHtml(project)}</title>
  <style>
    ${COMMON_STYLES}
    
    .header-project-select {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .header-project-select label {
      font-size: 13px;
      color: #666;
    }
    .header-project-select select {
      padding: 6px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      background: #fff;
    }
    
    .pending-badge {
      background: #ff9800;
      color: #fff;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .status-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }
    
    @media (max-width: 900px) {
      .status-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .waiting-content {
      background: #f9f9f9;
      border-radius: 4px;
      padding: 16px;
      font-family: 'SF Mono', monospace;
      font-size: 13px;
      white-space: pre-wrap;
      max-height: 300px;
      overflow: auto;
    }
    
    .pending-list {
      list-style: none;
    }
    .pending-item {
      background: #fff;
      border-left: 4px solid #ff9800;
      padding: 12px 16px;
      margin-bottom: 8px;
      border-radius: 0 4px 4px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .pending-item-task {
      font-weight: 600;
      color: #333;
    }
    .pending-item-project {
      font-size: 12px;
      color: #888;
    }
    
    .last-run-table {
      width: 100%;
    }
    .last-run-table td {
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .last-run-table td:first-child {
      font-weight: 500;
      color: #666;
      width: 100px;
    }
  </style>
</head>
<body>
  <header class="header">
    <h1>Project Status</h1>
    <div class="header-project-select">
      <label for="project-select">Project:</label>
      <select id="project-select" onchange="window.location.href='${baseUrl}/?project=' + this.value">
        ${projectOptions}
      </select>
      ${pendingCount > 0 ? `<span class="pending-badge">${pendingCount} pending</span>` : ''}
    </div>
    <nav class="header-nav">
      <a href="${baseUrl}/">Project Status</a>
      <a href="${baseUrl}/workflows">Workflows</a>
    </nav>
  </header>
  
  <div class="container">
    <div class="status-grid">
      <div class="card">
        <h3 class="section-title">Waiting On</h3>
        <div class="waiting-content">${escapeHtml(waitingOn)}</div>
      </div>
      
      <div class="card">
        <h3 class="section-title">Pending Gates</h3>
        ${pendingGates.length === 0 ? 
          '<p style="color: #888;">No paused workflows</p>' :
          `<ul class="pending-list">
            ${pendingGates.map(p => {
              const state = getWorkflowState(p);
              return `<li class="pending-item">
                <div class="pending-item-task">${escapeHtml(state?.last_task_id || '—')}</div>
                <div class="pending-item-project">${escapeHtml(p)}</div>
              </li>`;
            }).join('')}
          </ul>`
        }
      </div>
      
      <div class="card">
        <h3 class="section-title">Workflow State</h3>
        ${workflowState && workflowState.status === 'paused' ? `
          <table class="last-run-table">
            <tr><td>Status</td><td><strong>Paused</strong></td></tr>
            <tr><td>Task</td><td>${escapeHtml(workflowState.last_task_id || '—')}</td></tr>
            <tr><td>Workflow</td><td>${escapeHtml(workflowState.workflow_path || '—')}</td></tr>
            <tr><td>Paused At</td><td>${escapeHtml(workflowState.paused_at || '—')}</td></tr>
          </table>
        ` : '<p style="color: #888;">No paused workflow</p>'}
      </div>
      
      <div class="card">
        <h3 class="section-title">Last Run</h3>
        ${lastRun ? `
          <table class="last-run-table">
            <tr><td>Workflow</td><td>${escapeHtml(lastRun.workflow)}</td></tr>
            <tr><td>Status</td><td>${escapeHtml(lastRun.status)}</td></tr>
            <tr><td>End</td><td>${escapeHtml(lastRun.end)}</td></tr>
          </table>
        ` : '<p style="color: #888;">No execution log found</p>'}
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP Server
// ─────────────────────────────────────────────────────────────────────────────

function parseFormBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      try {
        const params = new URLSearchParams(body);
        const result = {};
        for (const [key, value] of params) {
          result[key] = value;
        }
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function createServer() {
  const server = http.createServer(async (req, res) => {
    const port = server.address()?.port;
    const url = new URL(req.url || "/", `http://localhost:${port}`);
    const project = url.searchParams.get("project") || DEFAULT_PROJECT;
    const workflowName = url.searchParams.get("name");
    const baseUrl = `http://localhost:${port}`;

    // ─────────────────────────────────────────────────────────────────────────
    // API Endpoints (Piece 2)
    // ─────────────────────────────────────────────────────────────────────────
    
    // Update workflow metadata (name, version)
    if (req.method === "POST" && url.pathname === "/api/workflow/metadata") {
      try {
        const body = await parseFormBody(req);
        const result = updateWorkflowMetadata(workflowName, {
          name: body.workflowName,
          version: body.version
        });
        
        // Redirect back to workflow detail with message
        if (result.success) {
          res.writeHead(302, { 'Location': `${baseUrl}/workflow?name=${encodeURIComponent(workflowName)}&msg=metadata_saved` });
        } else {
          res.writeHead(302, { 'Location': `${baseUrl}/workflow?name=${encodeURIComponent(workflowName)}&error=${encodeURIComponent(result.error)}` });
        }
        res.end();
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }
    
    // Add new role
    if (req.method === "POST" && url.pathname === "/api/workflow/role/add") {
      try {
        const body = await parseFormBody(req);
        const result = addRole(workflowName, body.roleId, {
          mode: body.mode || 'agent',
          description: body.description || ''
        });
        
        if (result.success) {
          res.writeHead(302, { 'Location': `${baseUrl}/workflow?name=${encodeURIComponent(workflowName)}&msg=role_added` });
        } else {
          res.writeHead(302, { 'Location': `${baseUrl}/workflow?name=${encodeURIComponent(workflowName)}&error=${encodeURIComponent(result.error)}` });
        }
        res.end();
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }
    
    // Update existing role
    if (req.method === "POST" && url.pathname === "/api/workflow/role/update") {
      try {
        const body = await parseFormBody(req);
        const originalId = body.originalRoleId;
        const newId = body.roleId;
        
        const result = updateRole(workflowName, originalId, {
          newId: newId !== originalId ? newId : undefined,
          mode: body.mode,
          description: body.description
        });
        
        if (result.success) {
          res.writeHead(302, { 'Location': `${baseUrl}/workflow?name=${encodeURIComponent(workflowName)}&msg=role_updated` });
        } else {
          res.writeHead(302, { 'Location': `${baseUrl}/workflow?name=${encodeURIComponent(workflowName)}&error=${encodeURIComponent(result.error)}` });
        }
        res.end();
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }
    
    // Delete role
    if (req.method === "POST" && url.pathname === "/api/workflow/role/delete") {
      try {
        const roleId = url.searchParams.get("roleId");
        const result = deleteRole(workflowName, roleId);
        
        if (result.success) {
          res.writeHead(302, { 'Location': `${baseUrl}/workflow?name=${encodeURIComponent(workflowName)}&msg=role_deleted` });
        } else {
          res.writeHead(302, { 'Location': `${baseUrl}/workflow?name=${encodeURIComponent(workflowName)}&error=${encodeURIComponent(result.error)}` });
        }
        res.end();
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Page Routes
    // ─────────────────────────────────────────────────────────────────────────
    
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    // Workflows List
    if (url.pathname === "/workflows") {
      res.writeHead(200);
      res.end(buildWorkflowListPage(baseUrl));
      return;
    }
    
    // Workflow Detail/Edit
    if (url.pathname === "/workflow" && workflowName) {
      // Check for success/error messages from redirects
      let message = null;
      const msg = url.searchParams.get("msg");
      const error = url.searchParams.get("error");
      
      if (msg === "metadata_saved") {
        message = { type: 'success', text: 'Workflow metadata saved successfully!' };
      } else if (msg === "role_added") {
        message = { type: 'success', text: 'Role added successfully!' };
      } else if (msg === "role_updated") {
        message = { type: 'success', text: 'Role updated successfully!' };
      } else if (msg === "role_deleted") {
        message = { type: 'success', text: 'Role deleted successfully!' };
      } else if (error) {
        message = { type: 'error', text: error };
      }
      
      res.writeHead(200);
      res.end(buildWorkflowDetailPage(workflowName, baseUrl, message));
      return;
    }
    
    // Default: Project Status page
    res.writeHead(200);
    res.end(buildProjectStatusPage(project, baseUrl));
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
    console.log(`[web-status-ui] Server running at http://localhost:${port}`);
    console.log(`[web-status-ui] Workspace: ${WORKSPACE_ROOT}`);
    console.log(`[web-status-ui] Routes:`);
    console.log(`  - http://localhost:${port}/           (Project Status)`);
    console.log(`  - http://localhost:${port}/workflows  (Workflow List)`);
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
