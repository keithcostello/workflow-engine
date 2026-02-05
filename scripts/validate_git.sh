#!/usr/bin/env bash
# Validate git context for Phase C: must be on feature/phase-c-web-status-ui
# Exit 0 if correct, 1 if wrong. No HITL when correct.
# PRD: docs/sprints/PHASE-C-PRD.md

set -e

EXPECTED_BRANCH="feature/phase-c-web-status-ui"
CURRENT=$(git branch --show-current 2>/dev/null || echo "")

if [ "$CURRENT" = "$EXPECTED_BRANCH" ]; then
  echo "validate_git: OK (branch=$CURRENT)"
  exit 0
else
  echo "validate_git: FAIL (expected=$EXPECTED_BRANCH, current=$CURRENT)"
  exit 1
fi
