#!/usr/bin/env node
/**
 * Orchestration Workflow Engine - MCP Server
 * Entry point for stdio transport (Cursor spawns this process)
 */

import { runServer } from "./server.js";

runServer().catch((err) => {
  console.error("[workflow-engine] Fatal error:", err);
  process.exit(1);
});
