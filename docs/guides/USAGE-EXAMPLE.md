# Usage Example: Executing Minimal Workflow

## What You Say

```
"Execute orchestration-training/workflow-engine/workflows/minimal-workflow.yaml"
```

## What AI Does

### Step 1: Load Workflow

```
**Reading workflow: Minimal Demo Workflow**

Found 4 tasks:
1. Create Demo File
2. Modify File
3. Review Work
4. Workflow Complete
```

### Step 2: Execute Stage 1

```
============================================================
Executing: Create Demo File (Task 1/4)
============================================================
Role: developer
Action: create_file
Creating demo.txt...
✅ File created

[HITL] Approval: File created. Review and approve to continue?
⏸️  Waiting for your response...
```

**You respond**: "yes"

```
✅ Approved. Continuing...
```

### Step 3: Execute Stage 2

```
============================================================
Executing: Modify File (Task 2/4)
============================================================
Role: developer
Action: modify_file
Reading demo.txt...
Modifying file...
✅ File modified

[HITL] Question: File modified. Does it look correct?
Options: yes, no
⏸️  Waiting for your selection...
```

**You respond**: "no"

```
⚠️  User said "no". Looping back to: modify_file
[Retrying modification...]

============================================================
Executing: Modify File (Task 2/4) - Retry 1
============================================================
...
[HITL] Question: File modified. Does it look correct?
Options: yes, no
```

**You respond**: "yes"

```
✅ Continuing to next task...
```

### Step 4: Execute Stage 3

```
============================================================
Executing: Review Work (Task 3/4)
============================================================
Role: reviewer
Action: review
Reading demo.txt for review...
File content:
---
Hello from workflow!
Modified by workflow stage 2
---

[HITL] Question: Review complete. Pass or fail?
Options: pass, fail
⏸️  Waiting for your selection...
```

**You respond**: "fail"

```
⚠️  User said "fail". Looping back to: modify_file
[Returning to modification stage...]

============================================================
Executing: Modify File (Task 2/4) - Retry 2
============================================================
...
```

**You respond**: "yes" (after modification)

```
✅ Continuing to next task...

============================================================
Executing: Review Work (Task 3/4) - Retry
============================================================
...
[HITL] Question: Review complete. Pass or fail?
Options: pass, fail
```

**You respond**: "pass"

```
✅ Review passed. Continuing...
```

### Step 5: Execute Stage 4

```
============================================================
Executing: Workflow Complete (Task 4/4)
============================================================
Role: developer
Action: complete

ℹ️  ✅ Workflow completed successfully!
[Continuing automatically...]

✅ Workflow execution complete!
```

---

## What You See

- **Clear task progress** (Task X/Y)
- **HITL gates** that pause for your input
- **Automatic retries** when you say "no" or "fail"
- **Branching** based on your responses
- **Completion** message at the end

---

## Key Features Demonstrated

✅ **Task sequencing** - Tasks execute in order  
✅ **HITL gates** - Approval and question gates  
✅ **Retry loops** - Loops back on "no" or "fail"  
✅ **Conditional branching** - Different paths based on responses  
✅ **State tracking** - AI knows which task it's on  

---

## Try It

Say: **"Execute minimal-workflow.yaml"** and watch it work!
