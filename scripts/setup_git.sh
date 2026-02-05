#!/usr/bin/env bash
# Setup git for Phase C: create branch or worktree if not exists
# PRD: docs/sprints/PHASE-C-PRD.md
# Branch: feature/phase-c-web-status-ui

set -e

BRANCH="feature/phase-c-web-status-ui"

# Create branch if not exists, checkout
if git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

echo "On branch: $(git branch --show-current)"
