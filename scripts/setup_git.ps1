# Setup git for Phase C: create branch or worktree if not exists
# PRD: docs/sprints/PHASE-C-PRD.md
# Branch: feature/phase-c-web-status-ui

$ErrorActionPreference = "Stop"
$Branch = "feature/phase-c-web-status-ui"

$exists = git rev-parse --verify $Branch 2>$null
if ($LASTEXITCODE -eq 0) {
    git checkout $Branch
} else {
    git checkout -b $Branch
}

Write-Host "On branch: $(git branch --show-current)"
