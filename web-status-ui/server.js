#!/usr/bin/env node
/**
 * Phase D Web Workflow Builder - Piece 2
 * Web app with workflow editing: metadata + roles
 * 
 * Features:
 * - Workflow List: Table with Name, Tasks count, Last Run, Status
 * - Workflow Detail: Split 60/40 layout - YAML code block + role cards
 * - Workflow Metadata Editing: Edit name and version
 * - Role Editor: Add, edit, remove roles with modal dialogs
 * - Modern UI matching Phase D UI Spec
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

function saveWorkflowYaml(name, content) {
  if (!name || name.includes("..") || name.includes("/")) return { success: false, error: "Invalid filename" };
  const p = path.join(WORKSPACE_ROOT, "workflows", name);
  try {
    fs.writeFileSync(p, content, "utf-8");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function updateWorkflowMetadata(name, updates) {
  const raw = getWorkflowYaml(name);
  if (!raw) return { success: false, error: "Workflow not found" };
  
  try {
    const doc = yaml.load(raw);
    const w = doc.workflow || doc;
    
    // Update name and version
    if (updates.name !== undefined) w.name = updates.name;
    if (updates.version !== undefined) w.version = updates.version;
    
    // Ensure workflow wrapper
    if (!doc.workflow) {
      doc.workflow = w;
    }
    
    const newYaml = yaml.dump(doc, { lineWidth: -1, quotingType: '"', forceQuotes: false });
    return saveWorkflowYaml(name, newYaml);
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function updateWorkflowRoles(name, roles) {
  const raw = getWorkflowYaml(name);
  if (!raw) return { success: false, error: "Workflow not found" };
  
  try {
    const doc = yaml.load(raw);
    const w = doc.workflow || doc;
    
    // Update roles
    w.roles = roles;
    
    // Ensure workflow wrapper
    if (!doc.workflow) {
      doc.workflow = w;
    }
    
    const newYaml = yaml.dump(doc, { lineWidth: -1, quotingType: '"', forceQuotes: false });
    return saveWorkflowYaml(name, newYaml);
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
// Workflow Detail Page with Editing (Piece 2)
// Split 60/40: YAML code block | Metadata + Role editor
// ─────────────────────────────────────────────────────────────────────────────

function buildWorkflowDetailPage(name, baseUrl, message = null) {
  const yamlRaw = getWorkflowYaml(name);
  const doc = getWorkflowParsed(name);
  const w = doc?.workflow || doc || {};
  const roles = w.roles || {};
  const workflowName = w.name || name.replace(".yaml", "");
  const workflowVersion = w.version || "1.0";

  // Build role cards with edit/delete buttons
  const roleCards = Object.entries(roles).map(([id, role]) => `
    <div class="role-card" data-role-id="${escapeHtml(id)}">
      <div class="role-header">
        <span class="role-name">${escapeHtml(id)}</span>
        <span class="role-mode ${role.mode === 'agent' ? 'mode-agent' : 'mode-plan'}">
          ${escapeHtml(role.mode || 'agent')}
        </span>
        <div class="role-actions">
          <button class="btn-icon" onclick="openEditRoleModal('${escapeHtml(id)}', '${escapeHtml(role.mode || 'agent')}', '${escapeHtml((role.description || '').replace(/'/g, "\\'"))}')" title="Edit role">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon btn-danger" onclick="confirmDeleteRole('${escapeHtml(id)}')" title="Delete role">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
      <div class="role-description">${escapeHtml(role.description || 'No description')}</div>
    </div>
  `).join("");

  // Syntax highlight YAML
  const highlightedYaml = yamlRaw ? syntaxHighlightYaml(yamlRaw) : '<span class="no-content">Workflow not found</span>';

  // Build message banner if present
  const messageBanner = message ? `
    <div class="message-banner ${message.type === 'success' ? 'message-success' : 'message-error'}">
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
    
    .message-banner {
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 500;
    }
    .message-success {
      background: #d4edda;
      color: #155724;
      border-bottom: 1px solid #c3e6cb;
    }
    .message-error {
      background: #f8d7da;
      color: #721c24;
      border-bottom: 1px solid #f5c6cb;
    }
    
    .detail-header {
      background: #fff;
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .detail-header-left {
      flex: 1;
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
      flex: 0 0 60%;
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
      flex: 0 0 40%;
      background: #fafafa;
      padding: 24px;
      overflow: auto;
      border-left: 1px solid #e0e0e0;
    }
    
    /* Metadata Section */
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
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
    .form-group {
      margin-bottom: 16px;
    }
    .form-group:last-child {
      margin-bottom: 0;
    }
    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #666;
      margin-bottom: 6px;
    }
    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.15s;
    }
    .form-input:focus {
      outline: none;
      border-color: #0066cc;
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    }
    .form-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }
    
    /* Role Cards */
    .roles-section {
      margin-top: 24px;
    }
    .role-card {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      transition: box-shadow 0.15s;
    }
    .role-card:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .role-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
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
      gap: 4px;
    }
    .btn-icon {
      background: transparent;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 6px;
      cursor: pointer;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .btn-icon:hover {
      background: #f0f0f0;
      color: #333;
    }
    .btn-icon.btn-danger:hover {
      background: #fee;
      border-color: #f88;
      color: #c00;
    }
    .role-description {
      font-size: 13px;
      color: #666;
    }
    
    .no-roles {
      color: #888;
      font-style: italic;
      padding: 20px;
      text-align: center;
    }
    
    .add-role-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 16px;
      background: #fff;
      border: 2px dashed #ccc;
      border-radius: 8px;
      color: #666;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }
    .add-role-btn:hover {
      border-color: #0066cc;
      color: #0066cc;
      background: #f8fbff;
    }
    .add-role-btn svg {
      width: 18px;
      height: 18px;
    }
    
    /* Modal */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }
    .modal-overlay.active {
      display: flex;
    }
    .modal {
      background: #fff;
      border-radius: 12px;
      width: 100%;
      max-width: 480px;
      max-height: 90vh;
      overflow: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
    .modal-close {
      background: none;
      border: none;
      cursor: pointer;
      color: #888;
      padding: 4px;
    }
    .modal-close:hover {
      color: #333;
    }
    .modal-body {
      padding: 24px;
    }
    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    
    /* Form in modal */
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .form-select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      background: #fff;
    }
    .form-select:focus {
      outline: none;
      border-color: #0066cc;
    }
    .form-textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      min-height: 80px;
    }
    .form-textarea:focus {
      outline: none;
      border-color: #0066cc;
    }
    
    .no-content {
      color: #888;
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
  
  ${messageBanner}
  
  <div class="detail-header">
    <div class="detail-header-left">
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
      <!-- Metadata Section -->
      <div class="metadata-section">
        <div class="section-header">
          <h3 class="section-title">Workflow Metadata</h3>
        </div>
        <form class="metadata-form" action="${baseUrl}/api/workflow/metadata" method="POST">
          <input type="hidden" name="filename" value="${escapeHtml(name)}">
          <div class="form-group">
            <label class="form-label" for="workflow-name">Name</label>
            <input type="text" id="workflow-name" name="name" class="form-input" value="${escapeHtml(workflowName)}" placeholder="Workflow name">
          </div>
          <div class="form-group">
            <label class="form-label" for="workflow-version">Version</label>
            <input type="text" id="workflow-version" name="version" class="form-input" value="${escapeHtml(workflowVersion)}" placeholder="1.0">
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save Metadata</button>
          </div>
        </form>
      </div>
      
      <!-- Roles Section -->
      <div class="roles-section">
        <div class="section-header">
          <h3 class="section-title">Roles</h3>
        </div>
        ${Object.keys(roles).length === 0 ? 
          '<p class="no-roles">No roles defined</p>' : 
          roleCards
        }
        <button class="add-role-btn" onclick="openAddRoleModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Role
        </button>
      </div>
    </div>
  </div>
  
  <!-- Role Modal -->
  <div class="modal-overlay" id="roleModal">
    <div class="modal">
      <div class="modal-header">
        <h4 class="modal-title" id="roleModalTitle">Add Role</h4>
        <button class="modal-close" onclick="closeRoleModal()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <form action="${baseUrl}/api/workflow/role" method="POST">
        <input type="hidden" name="filename" value="${escapeHtml(name)}">
        <input type="hidden" name="action" id="roleAction" value="add">
        <input type="hidden" name="originalId" id="originalRoleId" value="">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="role-id">Role ID</label>
            <input type="text" id="role-id" name="roleId" class="form-input" placeholder="e.g., developer" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="role-mode">Mode</label>
            <select id="role-mode" name="mode" class="form-select">
              <option value="agent">Agent</option>
              <option value="plan">Plan</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="role-description">Description</label>
            <textarea id="role-description" name="description" class="form-textarea" placeholder="What does this role do?"></textarea>
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
  <div class="modal-overlay" id="deleteModal">
    <div class="modal">
      <div class="modal-header">
        <h4 class="modal-title">Delete Role</h4>
        <button class="modal-close" onclick="closeDeleteModal()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <form action="${baseUrl}/api/workflow/role" method="POST">
        <input type="hidden" name="filename" value="${escapeHtml(name)}">
        <input type="hidden" name="action" value="delete">
        <input type="hidden" name="roleId" id="deleteRoleId" value="">
        <div class="modal-body">
          <p>Are you sure you want to delete the role "<strong id="deleteRoleName"></strong>"?</p>
          <p style="color: #888; font-size: 13px; margin-top: 8px;">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeDeleteModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="background: #dc3545;">Delete</button>
        </div>
      </form>
    </div>
  </div>
  
  <script>
    // Role Modal Functions
    function openAddRoleModal() {
      document.getElementById('roleModalTitle').textContent = 'Add Role';
      document.getElementById('roleAction').value = 'add';
      document.getElementById('originalRoleId').value = '';
      document.getElementById('role-id').value = '';
      document.getElementById('role-mode').value = 'agent';
      document.getElementById('role-description').value = '';
      document.getElementById('roleSubmitBtn').textContent = 'Add Role';
      document.getElementById('roleModal').classList.add('active');
    }
    
    function openEditRoleModal(id, mode, description) {
      document.getElementById('roleModalTitle').textContent = 'Edit Role';
      document.getElementById('roleAction').value = 'edit';
      document.getElementById('originalRoleId').value = id;
      document.getElementById('role-id').value = id;
      document.getElementById('role-mode').value = mode;
      document.getElementById('role-description').value = description;
      document.getElementById('roleSubmitBtn').textContent = 'Save Changes';
      document.getElementById('roleModal').classList.add('active');
    }
    
    function closeRoleModal() {
      document.getElementById('roleModal').classList.remove('active');
    }
    
    function confirmDeleteRole(id) {
      document.getElementById('deleteRoleId').value = id;
      document.getElementById('deleteRoleName').textContent = id;
      document.getElementById('deleteModal').classList.add('active');
    }
    
    function closeDeleteModal() {
      document.getElementById('deleteModal').classList.remove('active');
    }
    
    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', function(e) {
        if (e.target === this) {
          this.classList.remove('active');
        }
      });
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
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
// HTTP Server with API Endpoints
// ─────────────────────────────────────────────────────────────────────────────

function parseFormBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => { body += chunk.toString(); });
    req.on("end", () => {
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
    req.on("error", reject);
  });
}

function createServer() {
  const server = http.createServer(async (req, res) => {
    const port = server.address()?.port;
    const url = new URL(req.url || "/", `http://localhost:${port}`);
    const project = url.searchParams.get("project") || DEFAULT_PROJECT;
    const workflowName = url.searchParams.get("name");
    const baseUrl = `http://localhost:${port}`;

    // API: Update workflow metadata
    if (url.pathname === "/api/workflow/metadata" && req.method === "POST") {
      try {
        const body = await parseFormBody(req);
        const filename = body.filename;
        const result = updateWorkflowMetadata(filename, {
          name: body.name,
          version: body.version
        });
        
        // Redirect back to workflow detail with message
        res.writeHead(302, { 
          "Location": `${baseUrl}/workflow?name=${encodeURIComponent(filename)}&msg=${result.success ? 'saved' : 'error'}`
        });
        res.end();
        return;
      } catch (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error: " + err.message);
        return;
      }
    }
    
    // API: Add/Edit/Delete role
    if (url.pathname === "/api/workflow/role" && req.method === "POST") {
      try {
        const body = await parseFormBody(req);
        const filename = body.filename;
        const action = body.action; // add, edit, delete
        const roleId = body.roleId;
        const originalId = body.originalId;
        
        // Get current workflow
        const doc = getWorkflowParsed(filename);
        if (!doc) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Workflow not found");
          return;
        }
        
        const w = doc.workflow || doc;
        let roles = w.roles || {};
        
        if (action === "add" || action === "edit") {
          // If editing and ID changed, remove old entry
          if (action === "edit" && originalId && originalId !== roleId) {
            delete roles[originalId];
          }
          
          // Add/update the role
          roles[roleId] = {
            mode: body.mode || "agent",
            description: body.description || ""
          };
        } else if (action === "delete") {
          delete roles[roleId];
        }
        
        const result = updateWorkflowRoles(filename, roles);
        
        // Redirect back to workflow detail with message
        const msgType = result.success ? 'saved' : 'error';
        res.writeHead(302, { 
          "Location": `${baseUrl}/workflow?name=${encodeURIComponent(filename)}&msg=${msgType}`
        });
        res.end();
        return;
      } catch (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error: " + err.message);
        return;
      }
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");

    // Routes
    if (url.pathname === "/workflows") {
      res.writeHead(200);
      res.end(buildWorkflowListPage(baseUrl));
      return;
    }
    
    if (url.pathname === "/workflow" && workflowName) {
      // Check for message parameter
      const msg = url.searchParams.get("msg");
      let message = null;
      if (msg === "saved") {
        message = { type: "success", text: "Changes saved successfully!" };
      } else if (msg === "error") {
        message = { type: "error", text: "Error saving changes. Please try again." };
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
