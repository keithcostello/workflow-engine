# Validate git context for Phase D: must be on feature/phase-d-web-workflow-builder
# Exit 0 if correct, 1 if wrong. No HITL when correct.

$ExpectedBranch = "feature/phase-d-web-workflow-builder"
$Current = git branch --show-current 2>$null

if ($Current -eq $ExpectedBranch) {
    Write-Host "validate_git: OK (branch=$Current)"
    exit 0
} else {
    Write-Host "validate_git: FAIL (expected=$ExpectedBranch, current=$Current)"
    exit 1
}
