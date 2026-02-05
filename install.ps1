# Workflow Engine - Terminal Install (Windows PowerShell)
# Run from workflow-engine/ or after cloning the repo

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "=============================================="
Write-Host "  Workflow Engine - Installation"
Write-Host "=============================================="

# Ensure memory structure exists (workspace root: 2 levels up from workflow-engine)
$WorkspaceRoot = Split-Path (Split-Path $ScriptDir -Parent) -Parent
$MemoryDir = Join-Path $WorkspaceRoot "memory\projects\orchestration-training"
if (-not (Test-Path $MemoryDir)) {
    New-Item -ItemType Directory -Path $MemoryDir -Force | Out-Null
    Write-Host "  Created: memory/projects/orchestration-training/"
}

# Verify key files
$RequiredFiles = @(
    "workflows/minimal-workflow.yaml",
    ".cursor/rules/workflow-executor.mdc"
)
foreach ($f in $RequiredFiles) {
    if (-not (Test-Path $f)) {
        Write-Host "  ERROR: Missing $f"
        exit 1
    }
}
Write-Host "  Verified: workflow files and AI rules"

# Optional: Docker for docker-hello-workflow
try {
    $null = Get-Command docker -ErrorAction Stop
    Write-Host "  Docker: found (docker-hello-workflow available)"
} catch {
    Write-Host "  Docker: not found (optional; needed for docker-hello-workflow)"
}

Write-Host "=============================================="
Write-Host "  Next steps:"
Write-Host "  1. Open this folder in Cursor"
Write-Host "  2. Say: Execute workflows/minimal-workflow.yaml"
Write-Host "  3. Or: What's the status of orchestration-training?"
Write-Host "=============================================="
