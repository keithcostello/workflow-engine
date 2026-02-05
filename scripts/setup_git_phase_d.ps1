# Setup git for Phase D: create branch or worktree if not exists
# PRD: docs/sprints/PHASE-D-PRD.md
# Branch: feature/phase-d-web-workflow-builder

$ErrorActionPreference = "Stop"
$Branch = "feature/phase-d-web-workflow-builder"

$exists = git rev-parse --verify $Branch 2>$null
if ($LASTEXITCODE -eq 0) {
    git checkout $Branch
} else {
    git checkout -b $Branch
}

Write-Host "On branch: $(git branch --show-current)"
