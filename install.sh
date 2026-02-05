#!/usr/bin/env bash
# Workflow Engine - Terminal Install (Unix/macOS)
# Run from workflow-engine/ or after cloning the repo

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=============================================="
echo "  Workflow Engine - Installation"
echo "=============================================="

# Ensure memory structure exists (workspace root: 2 levels up from workflow-engine)
MEMORY_DIR="$SCRIPT_DIR/../../memory/projects/orchestration-training"
if [ ! -d "$MEMORY_DIR" ]; then
  mkdir -p "$MEMORY_DIR"
  echo "  Created: memory/projects/orchestration-training/"
fi

# Verify key files
for f in workflows/minimal-workflow.yaml .cursor/rules/workflow-executor.mdc; do
  if [ ! -f "$f" ]; then
    echo "  ERROR: Missing $f"
    exit 1
  fi
done
echo "  Verified: workflow files and AI rules"

# Optional: Docker for docker-hello-workflow
if command -v docker &>/dev/null; then
  echo "  Docker: found (docker-hello-workflow available)"
else
  echo "  Docker: not found (optional; needed for docker-hello-workflow)"
fi

echo "=============================================="
echo "  Next steps:"
echo "  1. Open this folder in Cursor"
echo "  2. Say: Execute workflows/minimal-workflow.yaml"
echo "  3. Or: What's the status of orchestration-training?"
echo "=============================================="
