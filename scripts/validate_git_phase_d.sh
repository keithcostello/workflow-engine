#!/usr/bin/env bash
# Validate git context for Phase D: must be on feature/phase-d-web-workflow-builder
# Exit 0 if correct, 1 if wrong. No HITL when correct.

set -e

EXPECTED_BRANCH="feature/phase-d-web-workflow-builder"
CURRENT=$(git branch --show-current 2>/dev/null || echo "")

if [ "$CURRENT" = "$EXPECTED_BRANCH" ]; then
  echo "validate_git: OK (branch=$CURRENT)"
  exit 0
else
  echo "validate_git: FAIL (expected=$EXPECTED_BRANCH, current=$CURRENT)"
  exit 1
fi
