# Push workflow-engine to GitHub

This folder is ready to be pushed to https://github.com/keithcostello/workflow-engine.

## Option A: New repo (workflow-engine is standalone)

If the GitHub repo is empty and you want this folder to be the repo root:

```bash
cd orchestration-training/workflow-engine
git init
git add .
git commit -m "Initial commit: workflow-engine npm package"
git branch -M main
git remote add origin https://github.com/keithcostello/workflow-engine.git
git push -u origin main
```

## Option B: From cursor_allvue (workflow-engine as subfolder)

If you need to push only the workflow-engine subtree:

```bash
# From cursor_allvue root
git subtree push --prefix=orchestration-training/workflow-engine https://github.com/keithcostello/workflow-engine.git main
```

(Requires `git subtree` and the subtree to be committed in cursor_allvue.)

## After push

Users can install via:

```bash
npm install github:keithcostello/workflow-engine
```
