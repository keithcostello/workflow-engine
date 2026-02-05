# How Workflow Engine Works with Cursor

## Current State

The workflow engine is a **definition system** - it defines what should happen, but the actual execution happens through **Cursor's AI assistant** (me).

---

## How It Actually Works in Cursor

### Step 1: You Create a Workflow YAML

```yaml
workflow:
  tasks:
    - id: "plan"
      name: "Create Plan"
      role: "architect"
      action: "create_plan"
      hitl:
        type: "approval"
        message: "Review plan. Approve?"
```

### Step 2: You Share It with Cursor AI

**Option A: Attach File**
```
You: "Execute this workflow" [attaches workflow.yaml]
```

**Option B: Reference File**
```
You: "Execute orchestration-training/workflow-engine/my-workflow.yaml"
```

**Option C: Paste YAML**
```
You: "Execute this workflow:
workflow:
  tasks: ...
"
```

### Step 3: AI Reads and Executes

I (the AI) will:
1. **Read the YAML** - Parse the workflow definition
2. **Execute tasks in order** - Use Cursor's tools to perform actions
3. **Pause at HITL gates** - Ask you questions or wait for approval
4. **Handle retries** - Loop back automatically on failures
5. **Branch on conditions** - Take different paths based on results

---

## Example: Real Execution in Cursor

### You Say:
```
"Execute orchestration-training/workflow-engine/workflows/simple-workflow.yaml"
```

### AI Responds and Executes:

```
**Reading workflow: Simple Workflow Example**

============================================================
Executing: Create Plan (Task 1/3)
============================================================
  Role: architect
  Action: create_plan
  Creating plan.md...
  [Using Cursor tools: write file, create structure]

[HITL AFTER] APPROVAL
  Message: Review the plan. Approve to continue?
  ⏸️  Waiting for user approval...
```

### You Respond:
```
"yes" or "approve"
```

### AI Continues:

```
✅ Approved. Continuing...

============================================================
Executing: Implement Plan (Task 2/3)
============================================================
  Role: developer
  Action: implement
  Implementing according to plan...
  [Using Cursor tools: read files, write code, modify files]

[HITL AFTER] QUESTION
  Question: Implementation complete. Does it look good?
  Options: yes, no
  ⏸️  Waiting for user response...
```

### You Respond:
```
"yes" or "no"
```

### If "yes":
```
✅ Continuing to next task...
```

### If "no":
```
⚠️  User said "no". Looping back to: implement
[Retrying implementation...]
```

---

## How Actions Actually Execute

When the workflow says `action: "create_plan"`, I use Cursor's tools:

```python
# AI internally does:
1. read_file("plan.md")  # Check if exists
2. write("plan.md", plan_content)  # Create plan
3. list_dir()  # Verify creation
```

**Available Cursor Tools I Can Use:**
- `read_file` - Read files
- `write` - Create/modify files
- `search_replace` - Edit files
- `run_terminal_cmd` - Run commands
- `list_dir` - List directories
- `grep` - Search code
- `codebase_search` - Semantic search
- And all other Cursor tools

---

## HITL Gates in Cursor

### Approval Gate
```yaml
hitl:
  type: "approval"
  message: "Review code. Approve?"
```

**What happens:**
1. AI pauses execution
2. AI shows you the message
3. AI waits for your response
4. If "yes" → continue
5. If "no" → block or loop back

### Question Gate
```yaml
hitl:
  type: "question"
  message: "Does this look correct?"
  options: ["yes", "no"]
  on_no: "previous_task"
```

**What happens:**
1. AI pauses execution
2. AI asks the question with options
3. You pick an option
4. AI branches based on your answer
5. If "no" → jumps to `previous_task`

### Info Gate
```yaml
hitl:
  type: "info"
  message: "Task complete"
  auto_continue: true
```

**What happens:**
1. AI shows message
2. AI continues automatically (no pause)

### None Gate
```yaml
hitl:
  type: "none"
```

**What happens:**
1. AI executes task
2. AI continues automatically (no interaction)

---

## Action Handlers (What AI Does)

When workflow says `action: "create_plan"`, AI needs to know what that means.

### Current Approach: AI Interprets

The AI (me) reads the action name and params, then uses Cursor tools:

```yaml
- id: "create_plan"
  action: "create_plan"
  params:
    output: "plan.md"
    structure: ["src/", "docs/"]
```

**AI interprets as:**
1. Create `plan.md` file with plan content
2. Create directory structure `src/`, `docs/`
3. Use `write()` and `run_terminal_cmd()` tools

### Future: Action Registry

Could create an action registry:

```python
ACTION_HANDLERS = {
    "create_plan": create_plan_handler,
    "implement": implement_handler,
    "validate": validate_handler,
}
```

But for now, **AI interprets actions** based on name and params.

---

## Complete Example Flow

### Workflow YAML:
```yaml
workflow:
  tasks:
    - id: "plan"
      role: "architect"
      action: "create_plan"
      hitl: {type: "approval", message: "Approve plan?"}
    
    - id: "implement"
      role: "developer"
      action: "implement"
      hitl: {type: "question", message: "Good?", options: ["yes", "no"]}
```

### You in Cursor:
```
"Execute my-workflow.yaml"
```

### AI Execution:
```
1. Reads YAML
2. Task 1: Creates plan.md using write() tool
3. [HITL] "Approve plan?" → Waits
4. You: "yes"
5. Task 2: Implements code using write(), search_replace() tools
6. [HITL] "Good?" → Waits
7. You: "yes"
8. ✅ Workflow complete
```

---

## Key Points

1. **No Separate Executor Needed**: AI (me) IS the executor
2. **Uses Cursor Tools**: All actions use Cursor's built-in tools
3. **HITL = Conversation**: HITL gates are just AI pausing and asking you
4. **YAML = Instructions**: YAML tells AI what to do and when to ask
5. **Automatic Execution**: AI handles sequencing, retries, branching

---

## How to Use It Right Now

1. **Create workflow YAML** in your project
2. **Tell AI**: "Execute this workflow" [attach file]
3. **AI executes** using Cursor tools
4. **AI pauses** at HITL gates, asks you
5. **You respond**, AI continues
6. **Workflow completes** automatically

---

## Example Commands

```
"Execute orchestration-training/workflow-engine/workflows/simple-workflow.yaml"

"Run the workflow in my-workflow.yaml"

"Execute this workflow:
workflow:
  tasks:
    - id: 'plan'
      role: 'architect'
      action: 'create_plan'
      hitl: {type: 'approval'}
"
```

---

## Summary

**The workflow engine in Cursor:**
- ✅ YAML defines the workflow
- ✅ AI (me) reads and executes it
- ✅ AI uses Cursor tools for actions
- ✅ AI pauses at HITL gates (conversation)
- ✅ You respond, AI continues
- ✅ Automatic sequencing, retries, branching

**It's not a separate program** - it's a **definition language** that tells the AI how to orchestrate tasks using Cursor's existing tools.
