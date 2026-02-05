# Training: Cursor-Native Workflow System

## Overview

This training teaches you how to use the minimal, functional workflow system that works natively in Cursor. You'll learn to create, execute, and understand workflows before building the full MCP server interface.

---

## Learning Objectives

By the end of this training, you will:
1. ✅ Understand what a workflow is and how it works
2. ✅ Know how to create a workflow YAML file
3. ✅ Execute workflows in Cursor
4. ✅ Understand HITL gates (approval, question, info, none)
5. ✅ See retry loops and conditional branching in action
6. ✅ Be ready to build the MCP server version

---

## Lesson 1: What is a Workflow?

### Concept

A **workflow** is a series of **tasks** that execute in order, with **HITL gates** (Human-In-The-Loop) where you can approve, answer questions, or get information.

**Think of it like a recipe**:
- Tasks = Steps in the recipe
- HITL gates = Checkpoints where you taste/approve
- Retry loops = If something doesn't taste right, try again
- Conditional branching = Different paths based on results

### Example

```yaml
workflow:
  tasks:
    - id: "step1"
      name: "Create File"
      action: "create_file"
      hitl:
        type: "approval"
        message: "Approve?"
```

**What this means**:
1. Execute "Create File" task
2. Pause and ask: "Approve?"
3. Wait for your response
4. Continue to next task

---

## Lesson 2: Workflow Structure

### Basic Structure

```yaml
workflow:
  name: "My Workflow"
  
  roles:
    developer:
      mode: "agent"
  
  tasks:
    - id: "task1"
      name: "Task Name"
      role: "developer"
      action: "action_name"
      params:
        key: "value"
      hitl:
        type: "approval"
        message: "Message here"
      on_complete: "next"
```

### Key Components

**Roles**: Define AI personas (developer, architect, PM, etc.)

**Tasks**: What needs to be done
- `id`: Unique identifier
- `name`: Human-readable name
- `role`: Which AI handles it
- `action`: What to do (create_file, modify_file, etc.)
- `params`: Parameters for the action
- `hitl`: Human interaction (approval, question, info, none)
- `on_complete`: What to do when done ("next" or task ID)

---

## Lesson 3: HITL Gates

### 4 Types of HITL Gates

#### 1. Approval Gate
**Use when**: You need to review before continuing

```yaml
hitl:
  type: "approval"
  message: "Review work. Approve?"
```

**What happens**: Workflow pauses, waits for your approval, then continues.

**You respond**: "yes" or "no"

---

#### 2. Question Gate
**Use when**: AI needs to ask you something

```yaml
hitl:
  type: "question"
  message: "Does this look correct?"
  options: ["yes", "no"]
  on_no: "previous_task"  # Loop back if "no"
```

**What happens**: AI asks question, you pick an option, workflow branches based on answer.

**You respond**: Pick an option (e.g., "yes", "no", "pass", "fail")

---

#### 3. Info Gate
**Use when**: Just want to notify, don't need approval

```yaml
hitl:
  type: "info"
  message: "Task complete. Continuing automatically..."
  auto_continue: true
```

**What happens**: Shows message, continues automatically.

**You respond**: Nothing needed (auto-continues)

---

#### 4. None Gate
**Use when**: No human interaction needed

```yaml
hitl:
  type: "none"
```

**What happens**: Task runs, continues automatically.

**You respond**: Nothing needed

---

## Lesson 4: Retry Loops

### How Retries Work

```yaml
- id: "fix"
  retry:
    max_attempts: 3
  conditions:
    - if: "retry_count < 3"
      then: "previous_task"  # Loop back
    - if: "retry_count >= 3"
      then: "escalate"  # Give up
```

**What happens**:
1. Task executes
2. If fails or you say "no":
   - Retry count increases
   - If < max attempts: Loop back
   - If >= max attempts: Escalate to human

---

## Lesson 5: Conditional Branching

### How Branching Works

```yaml
conditions:
  - if: "result == 'pass'"
    then: "next"  # Continue to next task
  - if: "result == 'fail'"
    then: "fix"  # Jump to "fix" task
```

**What happens**:
- After task completes, check conditions
- If condition matches: Branch to `then` target
- Can jump to different tasks or continue

---

## Lesson 6: Executing Workflows

### Step-by-Step Execution

1. **Create workflow YAML file**
   - Define tasks, roles, HITL gates
   - Save as `.yaml` file

2. **Tell AI to execute**
   ```
   "Execute minimal-workflow.yaml"
   ```

3. **AI executes**
   - Reads workflow YAML
   - Executes tasks in order
   - Uses Cursor tools (write, read_file, etc.)
   - Pauses at HITL gates

4. **You respond**
   - Approval: "yes" or "no"
   - Question: Pick an option
   - Info: Auto-continues

5. **Workflow continues**
   - Moves to next task
   - Or loops back on retry
   - Or branches on condition

6. **Completes**
   - Shows completion message
   - Workflow done

---

## Lesson 7: Hands-On Practice

### Exercise 1: Execute Minimal Workflow

**Goal**: See a workflow execute end-to-end

**Steps**:
1. Tell AI: "Execute orchestration-training/workflow-engine/workflows/minimal-workflow.yaml"
2. Watch AI execute Stage 1 (creates file)
3. Respond to HITL: "yes"
4. Watch AI execute Stage 2 (modifies file)
5. Respond to HITL: "no" (see retry)
6. Respond to HITL: "yes"
7. Watch AI execute Stage 3 (reviews)
8. Respond to HITL: "fail" (see loop back)
9. Respond to HITL: "pass"
10. Watch workflow complete

**What you'll learn**:
- How tasks execute in order
- How HITL gates pause workflow
- How retries work
- How branching works

---

### Exercise 2: Create Your Own Workflow

**Goal**: Create a simple 2-task workflow

**Steps**:
1. Create `my-workflow.yaml`:
   ```yaml
   workflow:
     name: "My First Workflow"
     tasks:
       - id: "create"
         name: "Create File"
         role: "developer"
         action: "create_file"
         params:
           path: "test.txt"
           content: "Hello!"
         hitl:
           type: "approval"
           message: "Approve?"
         on_complete: "next"
       
       - id: "complete"
         name: "Complete"
         role: "developer"
         action: "complete"
         hitl:
           type: "info"
           message: "Done!"
           auto_continue: true
         on_complete: "end"
   ```

2. Tell AI: "Execute my-workflow.yaml"
3. Watch it execute
4. Respond to HITL gates

**What you'll learn**:
- How to structure a workflow
- How to define tasks
- How to use HITL gates

---

## Lesson 8: Understanding Actions

### How Actions Work

When workflow says `action: "create_file"`, AI interprets it:

```yaml
action: "create_file"
params:
  path: "demo.txt"
  content: "Hello!"
```

**AI does**:
1. Reads action name: "create_file"
2. Reads params: path and content
3. Uses Cursor `write()` tool to create file

### Common Actions

**create_file**:
- Uses `write()` tool
- Creates file with content

**modify_file**:
- Uses `read_file()` then `search_replace()` or `write()`
- Modifies existing file

**review**:
- Uses `read_file()` to read file
- Shows content for review

**complete**:
- Shows completion message
- Ends workflow

---

## Lesson 9: Troubleshooting

### Workflow Doesn't Execute

**Problem**: AI doesn't recognize workflow

**Solution**: 
- Make sure you say "execute workflow" or "run workflow"
- Reference the full path to YAML file
- Check that workflow-executor.mdc rule exists

---

### HITL Gate Doesn't Pause

**Problem**: AI continues without waiting

**Solution**:
- Check HITL type is correct (approval, question, info, none)
- Make sure message is provided
- AI should pause for approval and question types

---

### Retry Loop Doesn't Work

**Problem**: Workflow doesn't loop back

**Solution**:
- Check `on_no` or `on_fail` is set correctly
- Check task ID matches
- Check conditions are set up correctly

---

## Lesson 10: Next Steps

After completing this training:

1. ✅ You understand workflows
2. ✅ You can create workflows
3. ✅ You can execute workflows
4. ⏭️ Ready to build MCP server
5. ⏭️ Ready to add workflow management
6. ⏭️ Ready to add project assignment

---

## Summary

**Key Concepts**:
- Workflows = Tasks + HITL gates + Retries + Branching
- HITL gates = Approval, Question, Info, None
- Retry loops = Automatic retries up to max attempts
- Conditional branching = Different paths based on results

**How to Use**:
1. Create workflow YAML
2. Tell AI to execute
3. Respond to HITL gates
4. Watch workflow complete

**What You've Learned**:
- Workflow structure
- HITL gate types
- Retry mechanisms
- Conditional logic
- Action interpretation

---

## Practice Exercises

1. **Execute minimal workflow** - See it work
2. **Create 2-task workflow** - Build your own
3. **Add retry loop** - Test retry mechanism
4. **Add conditional branch** - Test branching
5. **Modify existing workflow** - Customize it

---

## Questions?

If you have questions:
- Review the examples in `minimal-workflow.yaml`
- Check `USAGE-EXAMPLE.md` for detailed execution
- Ask AI: "Explain how [concept] works in workflows"
