# Quick Start: Cursor-Native Workflow

## What This Is

A **minimal, functional workflow system** that works **natively in Cursor** right now - no installation, no MCP server, no external tools.

**Purpose**: See the workflow concept working before building the full MCP server interface.

---

## What You Get

✅ **4-stage demo workflow** that demonstrates:
- Task sequencing
- HITL gates (approval, question)
- Retry loops
- Conditional branching

✅ **Cursor Rule** that tells AI how to execute workflows

✅ **Ready to test** - works immediately

---

## How to Use (3 Steps)

### Step 1: Tell AI to Execute

```
"Execute orchestration-training/workflow-engine/workflows/minimal-workflow.yaml"
```

or

```
"Execute workflows/minimal-workflow.yaml"
```

### Step 2: Watch AI Execute

AI will:
1. Read the workflow YAML
2. Execute each stage in order
3. Pause at HITL gates
4. Wait for your response
5. Continue automatically

### Step 3: Respond to HITL Gates

When AI pauses:
- **Approval gate**: Say "yes" or "no"
- **Question gate**: Pick an option (e.g., "yes", "pass", "fail")
- **Info gate**: Auto-continues

---

## What Happens

### Stage 1: Create File
- AI creates `artifacts/demo.txt`
- [HITL] "File created. Approve?"
- You: "yes"
- ✅ Continues

### Stage 2: Modify File
- AI modifies `artifacts/demo.txt`
- [HITL] "Does it look correct?"
- You: "no" → Retries stage 2
- You: "yes" → Continues

### Stage 3: Review
- AI reviews `artifacts/demo.txt`
- [HITL] "Pass or fail?"
- You: "fail" → Loops back to stage 2
- You: "pass" → Continues

### Stage 4: Complete
- AI shows completion message
- ✅ Workflow done

---

## Files

- `workflows/minimal-workflow.yaml` - The workflow definition
- `.cursor/rules/workflow-executor.mdc` - Rule that tells AI how to execute
- `artifacts/demo.txt` - Output from minimal workflow
- [usage-example.md](usage-example.md) - Detailed execution example

---

## Try It Now

**Say this to AI**:
```
"Execute orchestration-training/workflow-engine/workflows/minimal-workflow.yaml"
```

**Then**:
- Watch AI execute each stage
- Respond to HITL gates when prompted
- See retry loops in action
- See conditional branching

---

## What This Demonstrates

✅ **Workflow concept works** in Cursor  
✅ **HITL gates work** (pauses, asks, branches)  
✅ **Retry loops work** (loops back on failure)  
✅ **Conditional branching works** (different paths)  
✅ **No external tools needed** - pure Cursor native  

**Once you see it working**, we can build the MCP server for better UX and workflow management.

---

## Next Steps After Testing

1. ✅ See it working (this demo)
2. ⏭️ Build MCP server (workflow management)
3. ⏭️ Add UI extension (better UX)
4. ⏭️ Create workflow library (reusable workflows)
