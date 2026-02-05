#!/usr/bin/env bash
# Setup git for Phase D: create branch or worktree if not exists
# PRD: docs/sprints/PHASE-D-PRD.md
# Branch: feature/phase-d-web-workflow-builder

set -e

BRANCH="feature/phase-d-web-workflow-builder"

# Create branch if not exists, checkout
if git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

echo "On branch: $(git branch --show-current)"
