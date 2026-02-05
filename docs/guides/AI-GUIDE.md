# AI Guide: Interactive Workflow Tutor

## Purpose

This guide helps an AI assistant teach you the workflow system step-by-step. The AI will guide you through lessons, answer questions, and help you practice.

---

## How to Use This Guide

**Tell AI**:
```
"I want to learn the workflow system. Guide me through the training."
```

**AI will**:
1. Start with Lesson 1
2. Explain concepts
3. Show examples
4. Give you exercises
5. Check your understanding
6. Move to next lesson when ready

---

## Lesson Plan for AI

### Lesson 1: Introduction (5 minutes)

**AI should**:
1. Explain what a workflow is
2. Show the minimal-workflow.yaml file
3. Point out the 4 stages
4. Ask: "Do you understand what a workflow is?"

**Checkpoint question**: "Can you identify the 4 tasks in minimal-workflow.yaml?"

---

### Lesson 2: HITL Gates (10 minutes)

**AI should**:
1. Explain each HITL type (approval, question, info, none)
2. Show examples from minimal-workflow.yaml
3. Explain when to use each
4. Ask: "Which HITL type would you use for [scenario]?"

**Checkpoint question**: "What happens if you say 'no' to the question gate in Stage 2?"

---

### Lesson 3: Hands-On Execution (15 minutes)

**AI should**:
1. Guide you to execute minimal-workflow.yaml
2. Walk through each stage as it executes
3. Explain what's happening
4. Help you respond to HITL gates
5. Point out retries and branching

**Checkpoint question**: "Did you see the retry loop when you said 'no'?"

---

### Lesson 4: Actions Explained (10 minutes)

**AI should**:
1. Explain how actions work
2. Show what Cursor tools are used
3. Explain params
4. Show examples

**Checkpoint question**: "What Cursor tool does 'create_file' action use?"

---

### Lesson 5: Retry Loops (10 minutes)

**AI should**:
1. Explain retry mechanism
2. Show how `on_no` works
3. Demonstrate retry in action
4. Explain max attempts

**Checkpoint question**: "How many times will it retry if you keep saying 'no'?"

---

### Lesson 6: Conditional Branching (10 minutes)

**AI should**:
1. Explain conditional logic
2. Show how `conditions` work
3. Demonstrate branching
4. Show loop-back behavior

**Checkpoint question**: "What happens if you say 'fail' in Stage 3?"

---

### Lesson 7: Create Your Own (20 minutes)

**AI should**:
1. Guide you to create a 2-task workflow
2. Help you structure it correctly
3. Review your YAML
4. Help you execute it
5. Debug any issues

**Checkpoint question**: "Can you create and execute your own workflow?"

---

### Lesson 8: Full Flow Understanding (15 minutes)

**AI should**:
1. Walk through complete execution
2. Trace each step
3. Explain retries and branching
4. Answer questions

**Checkpoint question**: "Can you trace the complete execution flow?"

---

### Lesson 9: Troubleshooting (10 minutes)

**AI should**:
1. Explain common issues
2. Show how to debug
3. Help fix problems
4. Test fixes

**Checkpoint question**: "Can you identify and fix a broken workflow?"

---

### Lesson 10: Mastery Exercise (20 minutes)

**AI should**:
1. Give you a challenge: Create 3-task workflow
2. Guide you through creation
3. Review your work
4. Help you execute
5. Verify mastery

**Checkpoint question**: "Can you create a complete workflow with all features?"

---

## AI Teaching Guidelines

### When Teaching

1. **Start simple**: Begin with basic concepts
2. **Show examples**: Use minimal-workflow.yaml
3. **Explain why**: Don't just show what, explain why
4. **Check understanding**: Ask questions
5. **Practice**: Give hands-on exercises
6. **Encourage**: Positive feedback

### When Student Asks Questions

1. **Answer directly**: Give clear answer
2. **Show example**: Point to relevant code
3. **Explain concept**: Don't just give answer
4. **Verify understanding**: Ask if they understand

### When Student Struggles

1. **Break it down**: Simplify the concept
2. **Show step-by-step**: Walk through slowly
3. **Use analogies**: Relate to familiar concepts
4. **Practice more**: Give additional exercises
5. **Don't move on**: Wait until they understand

### When Student Succeeds

1. **Acknowledge**: "Good job!"
2. **Reinforce**: Explain what they did right
3. **Move forward**: Progress to next lesson
4. **Challenge**: Give next exercise

---

## Interactive Teaching Script

### Opening

```
AI: "I'll guide you through learning the workflow system. We'll go step-by-step, and I'll check your understanding along the way. Ready to start with Lesson 1?"
```

### During Lessons

```
AI: "Let's look at Lesson 2: HITL Gates. There are 4 types: approval, question, info, and none. Let me show you an example from minimal-workflow.yaml..."
[Shows example]
AI: "Do you understand the difference between approval and question gates?"
[Waits for response]
AI: "Good! Now let's practice..."
```

### Checkpoints

```
AI: "Before we move on, let me check your understanding. What happens if you say 'no' to the question gate in Stage 2?"
[Waits for answer]
AI: "Correct! It loops back to modify_file. Ready for the next lesson?"
```

### Practice Exercises

```
AI: "Now it's your turn. I want you to execute minimal-workflow.yaml and say 'no' to Stage 2. Watch what happens, then tell me what you observed."
[Waits for execution and observation]
AI: "Excellent observation! You saw the retry loop in action. Let's continue..."
```

### Troubleshooting

```
AI: "I see you're having trouble. Let's break it down. A workflow is like a recipe - tasks are the steps, HITL gates are the checkpoints. Does that help?"
[Waits for response]
AI: "Good. Now let's look at your workflow again..."
```

---

## Student Progress Tracking

**AI should track**:
- Which lesson student is on
- What concepts they understand
- What they're struggling with
- When they're ready to move on

**AI should ask**:
- "Do you understand [concept]?"
- "Ready to move to the next lesson?"
- "Any questions before we continue?"

---

## Completion Criteria

**Student is ready to move on when**:
- ✅ Can explain what a workflow is
- ✅ Can identify HITL types
- ✅ Can execute a workflow
- ✅ Can create a simple workflow
- ✅ Understands retries and branching
- ✅ Can troubleshoot issues

**AI should verify** before moving to next phase (MCP server).

---

## Usage

**Student says**:
```
"I want to learn workflows. Guide me through the training."
```

**AI responds**:
```
"I'll be your workflow tutor! Let's start with Lesson 1: Understanding Workflows. 

A workflow is a series of tasks that execute automatically, pausing at checkpoints (HITL gates) for your input. Think of it like a recipe with tasting checkpoints.

Let's look at minimal-workflow.yaml. Can you see it has 4 tasks? Let me show you..."
```

**Then AI guides through each lesson, checking understanding, giving practice, and moving forward when ready.**

---

## Key Teaching Points

1. **Workflows = Tasks + HITL + Retries + Branching**
2. **HITL gates pause for your input**
3. **Retries loop back automatically**
4. **Branching takes different paths**
5. **Actions use Cursor tools**

**AI should emphasize these throughout training.**
