# Instructional Guide: Learning the Workflow System

## Purpose

This guide walks you through learning the cursor-native workflow system step-by-step. Follow each lesson in order.

---

## Prerequisites

- Cursor IDE installed
- Basic understanding of YAML
- Willingness to experiment

---

## Lesson Structure

Each lesson has:
- **Concept**: What you're learning
- **Example**: Real example from minimal-workflow.yaml
- **Practice**: Hands-on exercise
- **Checkpoint**: Verify you understand

---

## Lesson 1: Understanding Workflows (10 minutes)

### Concept

A workflow is a **series of tasks** that execute automatically, pausing at **HITL gates** for your input.

**Analogy**: Like a recipe with checkpoints where you taste the food.

### Example

Look at `minimal-workflow.yaml`:
- 4 tasks (stages)
- Each task has an action
- Each task has a HITL gate
- Tasks execute in order

### Practice

1. Open `minimal-workflow.yaml`
2. Count the tasks (should be 4)
3. Identify the HITL types (approval, question, question, info)
4. Trace the flow: Task 1 → Task 2 → Task 3 → Task 4

### Checkpoint

✅ Can you identify:
- How many tasks?
- What each task does?
- What HITL type each task has?

---

## Lesson 2: HITL Gates Explained (15 minutes)

### Concept

HITL gates are **checkpoints** where the workflow pauses for your input.

### Example: Approval Gate

```yaml
hitl:
  type: "approval"
  message: "File created. Review and approve to continue?"
```

**What happens**:
1. AI creates file
2. AI pauses
3. Shows message
4. Waits for your "yes" or "no"
5. Continues or blocks

### Example: Question Gate

```yaml
hitl:
  type: "question"
  message: "File modified. Does it look correct?"
  options: ["yes", "no"]
  on_no: "modify_file"  # Loops back if "no"
```

**What happens**:
1. AI modifies file
2. AI pauses
3. Asks question with options
4. You pick option
5. If "no": Loops back to modify_file
6. If "yes": Continues

### Practice

1. Find all HITL gates in `minimal-workflow.yaml`
2. Identify the type of each
3. Predict what happens if you say "no" to each

### Checkpoint

✅ Can you explain:
- What each HITL type does?
- When to use each type?
- How branching works with questions?

---

## Lesson 3: Executing Your First Workflow (20 minutes)

### Concept

Workflows execute when you tell AI to run them. AI reads the YAML and executes tasks.

### Step-by-Step

1. **Open Cursor chat**

2. **Tell AI to execute**:
   ```
   "Execute orchestration-training/workflow-engine/workflows/minimal-workflow.yaml"
   ```

3. **Watch Stage 1**:
   - AI reads workflow
   - AI creates `demo.txt`
   - AI shows: "[HITL] Approval: File created. Approve?"
   - **You respond**: "yes"

4. **Watch Stage 2**:
   - AI modifies `demo.txt`
   - AI shows: "[HITL] Question: Does it look correct? Options: yes, no"
   - **You respond**: "no" (to see retry)
   - AI loops back, modifies again
   - **You respond**: "yes"

5. **Watch Stage 3**:
   - AI reviews `demo.txt`
   - AI shows: "[HITL] Question: Pass or fail? Options: pass, fail"
   - **You respond**: "fail" (to see loop back)
   - AI loops to Stage 2
   - After retry, **you respond**: "pass"

6. **Watch Stage 4**:
   - AI shows completion message
   - Workflow done!

### Practice

Execute the workflow and:
- Say "no" to Stage 2 (see retry)
- Say "fail" to Stage 3 (see loop back)
- Say "pass" to complete

### Checkpoint

✅ Did you see:
- Tasks execute in order?
- HITL gates pause workflow?
- Retry when you said "no"?
- Loop back when you said "fail"?
- Completion message?

---

## Lesson 4: Understanding Actions (15 minutes)

### Concept

**Actions** are what the AI does. AI interprets action names and uses Cursor tools.

### How Actions Work

```yaml
action: "create_file"
params:
  path: "demo.txt"
  content: "Hello!"
```

**AI interprets**:
1. Action = "create_file"
2. Params = path and content
3. Uses Cursor `write()` tool
4. Creates file

### Common Actions

**create_file**:
- AI uses `write()` tool
- Creates new file

**modify_file**:
- AI uses `read_file()` then `search_replace()` or `write()`
- Modifies existing file

**review**:
- AI uses `read_file()` tool
- Shows content for review

**complete**:
- Shows completion message
- Ends workflow

### Practice

1. Look at actions in `minimal-workflow.yaml`
2. Predict what Cursor tool AI will use for each
3. Execute workflow and verify

### Checkpoint

✅ Can you explain:
- What each action does?
- What Cursor tool AI uses?
- How params are used?

---

## Lesson 5: Retry Loops (15 minutes)

### Concept

**Retry loops** automatically retry tasks when they fail or you reject them.

### How It Works

```yaml
- id: "modify_file"
  hitl:
    type: "question"
    message: "Does it look correct?"
    options: ["yes", "no"]
    on_no: "modify_file"  # Loops back if "no"
```

**What happens**:
1. Task executes
2. HITL gate asks question
3. You say "no"
4. `on_no: "modify_file"` triggers
5. AI jumps back to "modify_file" task
6. Task executes again (retry)

### Practice

1. Execute workflow
2. At Stage 2, say "no"
3. Watch it retry Stage 2
4. Say "yes" to continue

### Checkpoint

✅ Did you see:
- Task retry when you said "no"?
- Same task execute again?
- Retry count or indication?

---

## Lesson 6: Conditional Branching (15 minutes)

### Concept

**Conditional branching** takes different paths based on results or your responses.

### How It Works

```yaml
- id: "review"
  hitl:
    type: "question"
    message: "Pass or fail?"
    options: ["pass", "fail"]
  conditions:
    - if: "result == 'pass'"
      then: "complete"
    - if: "result == 'fail'"
      then: "modify_file"
```

**What happens**:
1. Task executes
2. HITL gate asks: "Pass or fail?"
3. You say "fail"
4. Condition checks: `result == 'fail'` → True
5. `then: "modify_file"` executes
6. AI jumps to "modify_file" task
7. Workflow loops back

### Practice

1. Execute workflow
2. At Stage 3, say "fail"
3. Watch it loop back to Stage 2
4. After retry, say "pass"
5. Watch it continue to Stage 4

### Checkpoint

✅ Did you see:
- Branch when you said "fail"?
- Loop back to previous task?
- Continue when you said "pass"?

---

## Lesson 7: Creating Your Own Workflow (30 minutes)

### Goal

Create a simple 2-task workflow from scratch.

### Steps

1. **Create `my-first-workflow.yaml`**:
   ```yaml
   workflow:
     name: "My First Workflow"
     tasks:
       - id: "create"
         name: "Create File"
         role: "developer"
         action: "create_file"
         params:
           path: "myfile.txt"
           content: "Hello World!"
         hitl:
           type: "approval"
           message: "File created. Approve?"
         on_complete: "next"
       
       - id: "complete"
         name: "Complete"
         role: "developer"
         action: "complete"
         hitl:
           type: "info"
           message: "Workflow complete!"
           auto_continue: true
         on_complete: "end"
   ```

2. **Save the file**

3. **Tell AI**: "Execute my-first-workflow.yaml"

4. **Watch it execute**:
   - Stage 1: Creates file, asks approval
   - You: "yes"
   - Stage 2: Shows completion

### Practice

Modify your workflow:
- Add a third task that modifies the file
- Add a question gate
- Add a retry loop

### Checkpoint

✅ Can you:
- Create a workflow from scratch?
- Execute it successfully?
- Modify it?

---

## Lesson 8: Understanding the Full Flow (20 minutes)

### Concept

Understand how all pieces work together: tasks, HITL gates, retries, branching.

### Complete Flow Example

**Workflow**: minimal-workflow.yaml

**Execution**:
```
1. AI reads workflow
2. Task 1: Create file
   → Uses write() tool
   → [HITL] Approval: "Approve?"
   → You: "yes"
   → Continue
3. Task 2: Modify file
   → Uses read_file() then search_replace()
   → [HITL] Question: "Correct?"
   → You: "no"
   → on_no: "modify_file"
   → Loop back to Task 2
   → [HITL] Question: "Correct?"
   → You: "yes"
   → Continue
4. Task 3: Review
   → Uses read_file()
   → [HITL] Question: "Pass or fail?"
   → You: "fail"
   → Condition: result == 'fail' → then: "modify_file"
   → Loop back to Task 2
   → (Retry loop)
   → [HITL] Question: "Pass or fail?"
   → You: "pass"
   → Condition: result == 'pass' → then: "complete"
   → Continue
5. Task 4: Complete
   → Shows message
   → Done!
```

### Practice

1. Execute workflow
2. Trace through each step
3. Identify when retries happen
4. Identify when branching happens

### Checkpoint

✅ Can you trace:
- Complete execution flow?
- When retries trigger?
- When branching happens?
- How HITL gates affect flow?

---

## Lesson 9: Troubleshooting (15 minutes)

### Common Issues

#### Issue 1: Workflow Doesn't Execute

**Symptoms**: AI doesn't recognize workflow

**Solutions**:
- Say "execute workflow" explicitly
- Provide full path to YAML file
- Check workflow-executor.mdc rule exists

#### Issue 2: HITL Gate Doesn't Pause

**Symptoms**: AI continues without waiting

**Solutions**:
- Check HITL type is correct
- Make sure message is provided
- Approval and question types should pause

#### Issue 3: Retry Doesn't Work

**Symptoms**: Workflow doesn't loop back

**Solutions**:
- Check `on_no` or `on_fail` is set
- Verify task ID matches
- Check conditions are correct

### Practice

1. Intentionally break a workflow
2. See what error you get
3. Fix it
4. Execute successfully

### Checkpoint

✅ Can you:
- Identify common issues?
- Fix broken workflows?
- Debug execution problems?

---

## Lesson 10: Mastery Check (20 minutes)

### Final Exercise

Create a **3-task workflow** that:
1. Creates a file
2. Modifies it (with retry loop)
3. Reviews it (with pass/fail branching)
4. Completes

**Requirements**:
- Use all 4 HITL types (approval, question, info, none)
- Include a retry loop
- Include conditional branching
- Execute successfully

### Mastery Criteria

✅ You can:
- Create workflows from scratch
- Use all HITL types correctly
- Implement retry loops
- Implement conditional branching
- Execute workflows successfully
- Troubleshoot issues

---

## Completion

**Congratulations!** You've completed the training.

**You now know**:
- What workflows are
- How to create them
- How to execute them
- How HITL gates work
- How retries and branching work

**Next Steps**:
- Build MCP server for workflow management
- Add project assignment
- Create workflow library
- Add UI extension

---

## Resources

- `minimal-workflow.yaml` - Example workflow
- `USAGE-EXAMPLE.md` - Detailed execution example
- `README.md` - Full documentation
- `TRAINING.md` - This training guide

---

## Questions?

Ask AI:
- "Explain how [concept] works in workflows"
- "Show me an example of [feature]"
- "Help me debug my workflow"
