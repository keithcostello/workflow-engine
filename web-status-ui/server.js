#!/usr/bin/env node
/**
 * Phase C Web Status UI - Piece 1
 * Minimal server that reads memory/projects/<project>/WAITING_ON.md
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

function html(body) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Web Status UI</title></head>
<body>
<pre>${body.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
</body>
</html>`;
}

function createServer() {
  const server = http.createServer((req, res) => {
    const port = server.address()?.port;
    const url = new URL(req.url || "/", `http://localhost:${port}`);
    const project = url.searchParams.get("project") || DEFAULT_PROJECT;

    const content = getWaitingOn(project);
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
