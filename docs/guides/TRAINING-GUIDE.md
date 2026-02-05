# Workflow Engine Training Guide

## What You Have

You have a **workflow engine** that lets you define AI orchestration workflows in simple YAML files.

**Location**: `c:\PROJECTS\cursor_allvue\orchestration-training\workflow-engine\`

---

## Core Concept

Instead of manually documenting every step, you define **tasks** in YAML, and the engine executes them automatically.

---

## Quick Start: Your First Workflow

### Step 1: Create a Simple Workflow

Create a file `my-workflow.yaml`:

```yaml
workflow:
  name: "My First Workflow"
  
  roles:
    architect:
      mode: "plan"
    developer:
      mode: "agent"
  
  tasks:
    - id: "plan"
      name: "Create Plan"
      role: "architect"
      action: "create_plan"
      hitl:
        type: "approval"
        message: "Review the plan. Approve to continue?"
      on_complete: "next"
    
    - id: "implement"
      name: "Implement Plan"
      role: "developer"
      action: "implement"
      hitl:
        type: "question"
        message: "Implementation complete. Does it look good?"
        options: ["yes", "no"]
        on_no: "implement"  # Retry if "no"
      on_complete: "complete"
```

### Step 2: Understand the Parts

**Roles**: Define AI personas (architect, developer, PM, etc.)

**Tasks**: What needs to be done
- `id`: Unique identifier
- `name`: Human-readable name
- `role`: Which AI handles it
- `action`: What to do (create_plan, implement, etc.)
- `hitl`: Human interaction (approval, question, info, none)
- `on_complete`: What to do when done ("next" or task ID)

---

## HITL Types (Human-In-The-Loop)

### 1. Approval Gate
**Use when**: You need to review before continuing

```yaml
hitl:
  type: "approval"
  message: "Review the code. Approve to continue?"
```

**What happens**: Workflow pauses, waits for your approval, then continues.

---

### 2. Question/Answer
**Use when**: AI needs to ask you something

```yaml
hitl:
  type: "question"
  message: "Does this look correct?"
  options: ["yes", "no", "needs_revision"]
  on_no: "previous_task"  # Loop back if you say "no"
```

**What happens**: AI asks question, you pick an option, workflow branches based on your answer.

---

### 3. Information Only
**Use when**: Just want to notify, don't need approval

```yaml
hitl:
  type: "info"
  message: "Task complete. Continuing automatically..."
  auto_continue: true
```

**What happens**: Shows message, continues automatically.

---

### 4. None (Fully Automated)
**Use when**: No human interaction needed

```yaml
hitl:
  type: "none"
```

**What happens**: Task runs, continues automatically.

---

## Retry Loops

**Use when**: Task might fail and you want automatic retries

```yaml
- id: "dev_fix"
  name: "Fix Issues"
  role: "developer"
  action: "fix_work"
  retry:
    max_attempts: 3
    on_max_retries: "escalate"
  conditions:
    - if: "retry_count < 3"
      then: "pm_validate"  # Loop back to validation
    - if: "retry_count >= 3"
      then: "escalate"  # Give up, escalate to human
```

**What happens**: If task fails, retry up to 3 times, then escalate.

---

## Conditional Branching

**Use when**: Different paths based on results

```yaml
- id: "pm_validate"
  name: "PM Validates"
  role: "pm"
  action: "validate"
  conditions:
    - if: "validation_result == 'pass'"
      then: "next"  # Continue to next task
    - if: "validation_result == 'fail'"
      then: "dev_fix"  # Loop back to fix
```

**What happens**: Checks condition, branches to different tasks.

---

## Common Patterns

### Pattern 1: Simple Approval Workflow
```yaml
tasks:
  - id: "create"
    role: "architect"
    action: "create"
    hitl:
      type: "approval"
      message: "Approve?"
    on_complete: "next"
  
  - id: "implement"
    role: "developer"
    action: "implement"
    hitl:
      type: "approval"
      message: "Approve?"
    on_complete: "complete"
```

---

### Pattern 2: Question-Based Validation
```yaml
tasks:
  - id: "create"
    role: "architect"
    action: "create"
    hitl:
      type: "question"
      message: "Does this look good?"
      options: ["yes", "no"]
      on_no: "create"  # Retry if "no"
    on_complete: "next"
```

---

### Pattern 3: Retry Loop with Validation
```yaml
tasks:
  - id: "implement"
    role: "developer"
    action: "implement"
    on_complete: "next"
  
  - id: "validate"
    role: "pm"
    action: "validate"
    conditions:
      - if: "result == 'pass'"
        then: "complete"
      - if: "result == 'fail'"
        then: "fix"
  
  - id: "fix"
    role: "developer"
    action: "fix"
    retry:
      max_attempts: 3
    conditions:
      - if: "retry_count < 3"
        then: "validate"  # Loop back
      - if: "retry_count >= 3"
        then: "escalate"
```

---

## How to Use It

### Option 1: Use with AI Assistant
1. Show AI your workflow YAML
2. AI reads it and executes tasks in order
3. When HITL gate reached, AI pauses and asks you
4. You respond, AI continues

### Option 2: Build Executor (Future)
- The `workflow-executor.py` is a skeleton
- Would need action handlers for each action type
- Would need UI/API for HITL interactions
- For now, use with AI assistant

---

## Example: Complete Workflow

```yaml
workflow:
  name: "Build Feature"
  
  roles:
    architect:
      mode: "plan"
    developer:
      mode: "agent"
    pm:
      mode: "plan"
  
  tasks:
    # Step 1: Create plan
    - id: "create_plan"
      name: "Create Feature Plan"
      role: "architect"
      action: "create_plan"
      hitl:
        type: "approval"
        message: "Review plan. Approve?"
      on_complete: "next"
    
    # Step 2: Implement
    - id: "implement"
      name: "Implement Feature"
      role: "developer"
      action: "implement"
      hitl:
        type: "none"  # Fully automated
      on_complete: "next"
    
    # Step 3: Validate
    - id: "validate"
      name: "PM Validates"
      role: "pm"
      action: "validate"
      hitl:
        type: "question"
        message: "Does implementation meet requirements?"
        options: ["yes", "no"]
        on_no: "fix"  # If "no", go to fix
      conditions:
        - if: "result == 'pass'"
          then: "complete"
        - if: "result == 'fail'"
          then: "fix"
    
    # Step 4: Fix (if needed)
    - id: "fix"
      name: "Fix Issues"
      role: "developer"
      action: "fix"
      retry:
        max_attempts: 3
      conditions:
        - if: "retry_count < 3"
          then: "validate"  # Loop back
        - if: "retry_count >= 3"
          then: "escalate"
```

---

## Tips

1. **Start Simple**: Begin with 2-3 tasks, add complexity later
2. **Use Approval**: When in doubt, use approval gates for important steps
3. **Use Questions**: When AI needs your input to decide next step
4. **Retry Loops**: Use for tasks that might fail (validation, fixes)
5. **Conditions**: Use for branching logic (pass/fail, yes/no)

---

## Next Steps

1. **Create your first workflow**: Copy the example, modify for your needs
2. **Test with AI**: Show AI the YAML, ask it to execute
3. **Iterate**: Add tasks, modify HITL types, add retry loops
4. **Reuse**: Same workflow for different projects (just change params)

---

## Questions?

- **"How do I add a new task?"** → Add to `tasks:` list
- **"How do I change the order?"** → Reorder tasks in list
- **"How do I add a retry?"** → Add `retry:` section to task
- **"How do I branch on condition?"** → Add `conditions:` section

The workflow engine is **declarative** - you define **what** you want, not **how** to do it.
