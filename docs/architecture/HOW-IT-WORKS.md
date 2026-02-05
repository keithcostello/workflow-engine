# How the Workflow Engine Works

## Overview

The workflow engine is a **state machine** that reads YAML definitions and executes tasks in sequence, pausing at HITL gates and handling retries/branching automatically.

---

## Architecture

```
┌─────────────────┐
│  Workflow YAML  │  ← You define workflow here
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  YAML Parser    │  ← Reads and parses YAML
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Task Executor  │  ← Executes tasks in order
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HITL Handler   │  ← Pauses for user input
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  State Manager  │  ← Tracks progress, retries
└─────────────────┘
```

---

## Step-by-Step Execution

### Phase 1: Load Workflow

```python
# 1. Read YAML file
with open("workflow.yaml") as f:
    workflow = yaml.safe_load(f)

# 2. Extract components
tasks = workflow['workflow']['tasks']
roles = workflow['workflow']['roles']
settings = workflow['workflow']['settings']
```

**Result**: Workflow structure loaded into memory

---

### Phase 2: Initialize State

```python
current_task_index = 0        # Which task we're on
task_states = {}              # Status of each task
retry_counts = {}             # How many times each task retried
```

**Execution Log**: Open `memory/workflows/<project>/execution-log.md` and append run header. Log every action (task_start, action_done, hitl_reached, hitl_response, task_complete, retry, branch, workflow_complete). See [docs/design/workflow-execution-log.md](../design/workflow-execution-log.md).

**Result**: State tracking initialized, execution log started

---

### Phase 3: Execute Loop

```python
while current_task_index < len(tasks):
    task = tasks[current_task_index]
    task_id = task['id']
    
    # Execute this task
    result = execute_task(task)
    
    # Handle result
    if result == 'complete':
        move_to_next_task()
    elif result == 'error':
        handle_error(task)
    elif result == 'condition':
        evaluate_conditions(task)
```

**Result**: Tasks execute one by one

---

## Task Execution Flow

### Step 1: Check Retry Limit

```python
if retry_counts[task_id] >= task['retry']['max_attempts']:
    escalate_to_human()
    break
```

**Purpose**: Prevent infinite loops

---

### Step 2: Handle Pre-Execution HITL

```python
hitl = task.get('hitl')
if hitl and hitl['type'] == 'approval':
    # Approval gates block BEFORE execution
    user_response = ask_user_approval(hitl['message'])
    if user_response == 'no':
        return 'blocked'  # Don't execute
```

**Purpose**: Get approval before starting task

---

### Step 3: Execute Action

```python
role = task['role']           # Which AI role
action = task['action']        # What to do
params = task['params']        # Parameters

# AI interprets action and uses Cursor tools
if action == 'create_plan':
    write_file('plan.md', plan_content)
elif action == 'implement':
    write_file('code.py', code_content)
# ... etc
```

**Purpose**: Actually do the work

**How Actions Work**:
- AI reads `action` name (e.g., "create_plan")
- AI reads `params` (e.g., `output: "plan.md"`)
- AI uses Cursor tools to perform action:
  - `write()` - Create files
  - `read_file()` - Read files
  - `search_replace()` - Edit files
  - `run_terminal_cmd()` - Run commands
  - etc.

---

### Step 4: Handle Post-Execution HITL

```python
hitl = task.get('hitl')
if hitl:
    if hitl['type'] == 'approval':
        user_response = ask_user_approval(hitl['message'])
        if user_response == 'no':
            return 'blocked'
    
    elif hitl['type'] == 'question':
        user_response = ask_user_question(hitl['message'], hitl['options'])
        if user_response == 'no' and hitl.get('on_no'):
            jump_to_task(hitl['on_no'])  # Branch
            return 'redirected'
    
    elif hitl['type'] == 'info':
        show_info(hitl['message'])
        # Auto-continue
    
    elif hitl['type'] == 'none':
        # No interaction, continue
        pass
```

**Purpose**: Get user input after task completes

---

### Step 5: Evaluate Conditions

```python
conditions = task.get('conditions', [])
for condition in conditions:
    if evaluate(condition['if']):
        target = condition['then']
        if target == 'next':
            current_task_index += 1
        else:
            jump_to_task(target)  # Branch to different task
        break
```

**Purpose**: Branch based on results

**Example**:
```yaml
conditions:
  - if: "validation_result == 'pass'"
    then: "next"              # Continue to next task
  - if: "validation_result == 'fail'"
    then: "fix"               # Jump to "fix" task
```

---

### Step 6: Handle Completion/Error

```python
on_complete = task.get('on_complete', 'next')
if on_complete == 'next':
    current_task_index += 1
else:
    jump_to_task(on_complete)  # Jump to specific task

# Or if error:
on_error = task.get('on_error', 'retry')
if on_error == 'retry':
    retry_counts[task_id] += 1
    # Stay on same task (will retry)
else:
    jump_to_task(on_error)
```

**Purpose**: Determine next step

---

## HITL Gate Types Explained

### 1. Approval Gate

```yaml
hitl:
  type: "approval"
  message: "Review work. Approve?"
```

**Execution**:
```python
def handle_approval(message):
    # AI pauses execution
    print(f"[HITL] {message}")
    print("⏸️  Waiting for user approval...")
    
    # In Cursor: AI waits for user message
    user_response = wait_for_user_input()  # "yes" or "no"
    
    if user_response == "yes":
        return "continue"
    else:
        return "blocked"  # Don't continue
```

**When it blocks**: Before task (if `timing: 'before'`) or after task

---

### 2. Question Gate

```yaml
hitl:
  type: "question"
  message: "Does this look correct?"
  options: ["yes", "no"]
  on_no: "previous_task"
```

**Execution**:
```python
def handle_question(message, options, on_no):
    # AI pauses execution
    print(f"[HITL] Question: {message}")
    print(f"Options: {', '.join(options)}")
    
    # In Cursor: AI waits for user selection
    user_response = wait_for_user_input()  # "yes", "no", etc.
    
    # Branch based on answer
    if user_response == "no" and on_no:
        jump_to_task(on_no)  # Loop back
        return "redirected"
    
    return "continue"
```

**When it branches**: Based on user's answer

---

### 3. Info Gate

```yaml
hitl:
  type: "info"
  message: "Task complete"
  auto_continue: true
```

**Execution**:
```python
def handle_info(message, auto_continue):
    # AI shows message
    print(f"ℹ️  {message}")
    
    if auto_continue:
        return "continue"  # Don't wait
    else:
        return wait_for_approval("Continue?")
```

**When it blocks**: Only if `auto_continue: false`

---

### 4. None Gate

```yaml
hitl:
  type: "none"
```

**Execution**:
```python
def handle_none():
    # No interaction
    return "continue"  # Immediately continue
```

**When it blocks**: Never - fully automated

---

## Retry Loop Mechanics

### Retry Configuration

```yaml
- id: "fix"
  retry:
    max_attempts: 3
    on_max_retries: "escalate"
```

### Retry Execution

```python
def execute_with_retry(task):
    task_id = task['id']
    max_attempts = task['retry']['max_attempts']
    
    while retry_counts[task_id] < max_attempts:
        # Execute task
        result = execute_task(task)
        
        if result == 'complete':
            return 'complete'
        elif result == 'error':
            retry_counts[task_id] += 1
            print(f"⚠️  Retry {retry_counts[task_id]}/{max_attempts}")
            # Loop continues (will retry)
        else:
            return result
    
    # Max retries reached
    escalate_to_human()
    return 'escalated'
```

### Retry with Conditions

```yaml
- id: "fix"
  retry:
    max_attempts: 3
  conditions:
    - if: "retry_count < 3"
      then: "validate"  # Loop back to validation
    - if: "retry_count >= 3"
      then: "escalate"   # Give up
```

**Execution**:
```python
# After task completes
if retry_counts[task_id] < 3:
    jump_to_task("validate")  # Loop back
else:
    escalate_to_human()  # Give up
```

---

## Conditional Branching

### Condition Evaluation

```yaml
conditions:
  - if: "validation_result == 'pass'"
    then: "next"
  - if: "validation_result == 'fail'"
    then: "fix"
```

**Execution**:
```python
def evaluate_conditions(task, result):
    conditions = task.get('conditions', [])
    
    for condition in conditions:
        condition_expr = condition['if']  # "validation_result == 'pass'"
        target = condition['then']        # "next" or "fix"
        
        # Evaluate condition (simplified)
        if evaluate_expression(condition_expr, result):
            if target == 'next':
                current_task_index += 1
            else:
                jump_to_task(target)
            return
    
    # No condition met - default to next
    current_task_index += 1
```

**How evaluation works**:
- AI checks if condition matches result
- If match → branch to `then` target
- If no match → check next condition
- If no conditions match → continue to next task

---

## State Management

### Task States

```python
task_states = {
    "create_plan": {
        "status": "complete",
        "role": "architect",
        "action": "create_plan",
        "started_at": "2024-12-19 10:00:00",
        "completed_at": "2024-12-19 10:01:00"
    },
    "implement": {
        "status": "in_progress",
        "role": "developer",
        "action": "implement"
    }
}
```

### Retry Tracking

```python
retry_counts = {
    "fix": 2,        # Task "fix" has retried 2 times
    "validate": 0    # Task "validate" hasn't retried
}
```

### Current Position

```python
current_task_index = 3  # On task 4 (0-indexed)
```

---

## Complete Execution Example

### Workflow:
```yaml
tasks:
  - id: "plan"
    role: "architect"
    action: "create_plan"
    hitl: {type: "approval", message: "Approve?"}
  
  - id: "implement"
    role: "developer"
    action: "implement"
    hitl: {type: "question", message: "Good?", options: ["yes", "no"]}
  
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
    retry: {max_attempts: 3}
```

### Execution Trace:

```
1. Load workflow
   → tasks = [plan, implement, validate, fix]
   → current_task_index = 0

2. Execute task[0] = "plan"
   → Role: architect
   → Action: create_plan
   → [HITL] Approval: "Approve?"
   → User: "yes"
   → on_complete: "next"
   → current_task_index = 1

3. Execute task[1] = "implement"
   → Role: developer
   → Action: implement
   → [HITL] Question: "Good?"
   → User: "no"
   → on_no: "implement" (but we're already here)
   → Retry same task
   → [HITL] Question: "Good?"
   → User: "yes"
   → on_complete: "next"
   → current_task_index = 2

4. Execute task[2] = "validate"
   → Role: pm
   → Action: validate
   → Result: "fail"
   → Evaluate conditions:
     → "result == 'pass'" → false
     → "result == 'fail'" → true
   → then: "fix"
   → jump_to_task("fix")
   → current_task_index = 3

5. Execute task[3] = "fix"
   → Role: developer
   → Action: fix
   → retry_count["fix"] = 0
   → on_complete: "next"
   → current_task_index = 2 (back to validate)

6. Execute task[2] = "validate" (again)
   → Result: "pass"
   → Evaluate conditions:
     → "result == 'pass'" → true
   → then: "complete"
   → Workflow complete!
```

---

## Key Mechanisms

### 1. **Sequential Execution**
- Tasks execute one at a time
- `current_task_index` tracks position
- `on_complete: "next"` moves forward

### 2. **HITL Blocking**
- AI pauses execution at HITL gates
- Waits for user input in Cursor chat
- Continues based on response

### 3. **Retry Loops**
- `retry_counts` tracks attempts
- Stays on same task if retry
- Escalates after max attempts

### 4. **Conditional Branching**
- Evaluates conditions after task
- Jumps to different tasks based on result
- Can loop back or skip ahead

### 5. **State Persistence**
- `task_states` tracks all task statuses
- `retry_counts` tracks retry attempts
- `current_task_index` tracks position

---

## Summary

**The workflow engine works by:**

1. **Loading** YAML workflow definition
2. **Executing** tasks sequentially using Cursor tools
3. **Pausing** at HITL gates for user input
4. **Branching** based on conditions and user responses
5. **Retrying** on errors up to max attempts
6. **Tracking** state throughout execution

**It's a state machine** that orchestrates AI tasks with human oversight at key points.
