# Deploy workflow-engine to https://github.com/keithcostello/workflow-engine
# Run this from workflow-engine/ in PowerShell (outside Cursor to avoid hooks)

$ErrorActionPreference = "Stop"
$RepoDir = $PSScriptRoot
Set-Location $RepoDir

Write-Host "=== Deploy workflow-engine to GitHub ===" -ForegroundColor Cyan

# Remove corrupted .git if it exists
if (Test-Path ".git") {
    Write-Host "Removing existing .git folder..."
    Remove-Item -Recurse -Force ".git"
}

# Initialize and push
Write-Host "Initializing git..."
git init

Write-Host "Adding files..."
git add .

Write-Host "Committing..."
git commit -m "Initial commit: workflow-engine npm package for Cursor"

Write-Host "Setting branch to main..."
git branch -M main

Write-Host "Adding remote..."
git remote add origin https://github.com/keithcostello/workflow-engine.git

Write-Host "Pushing to GitHub..."
git push -u origin main

Write-Host ""
Write-Host "Done! Install with: npm install github:keithcostello/workflow-engine" -ForegroundColor Green
