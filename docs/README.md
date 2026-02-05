# Workflow Engine Documentation

## Quick Navigation

### Start Here

| Document | Purpose | Time |
|----------|---------|------|
| [reference/cheat-sheet.md](reference/cheat-sheet.md) ⚡ | Visual cheat sheet | 2 min |
| [reference/quick-reference.md](reference/quick-reference.md) ⭐ | Quick lookups, who to talk to | 5 min |
| [reference/documentation-index.md](reference/documentation-index.md) | Complete navigation | — |

### By Category

**Architecture**
- [architecture/system-overview.md](architecture/system-overview.md) - System architecture
- [architecture/component-ai-architecture.md](architecture/component-ai-architecture.md) - Component AI design
- [architecture/how-it-works.md](architecture/how-it-works.md) - Execution flow

**Guides**
- [guides/quick-start.md](guides/quick-start.md) - Execute your first workflow
- [guides/training.md](guides/training.md) - Comprehensive training
- [guides/instructional-guide.md](guides/instructional-guide.md) - Step-by-step learning
- [guides/ai-guide.md](guides/ai-guide.md) - AI tutor guide
- [guides/usage-example.md](guides/usage-example.md) - Execution example

**Integration**
- [integration/integration-guide.md](integration/integration-guide.md) - How AIs work in system
- [integration/cursor-integration.md](integration/cursor-integration.md) - Cursor integration
- [integration/project-query-system.md](integration/project-query-system.md) - Query system
- [integration/query-system-guide.md](integration/query-system-guide.md) - Query guide

**Design**
- [design/workflow-execution-log.md](design/workflow-execution-log.md) - Execution logging
- [design/walking-skeleton.md](design/walking-skeleton.md) - Walking skeleton (execution path + incremental software building)
- [design/cursor-tool-design.md](design/cursor-tool-design.md) - Tool design
- [design/implementation-plan.md](design/implementation-plan.md) - Implementation plan

**Testing**
- [testing/validation-report.md](testing/validation-report.md) - Validation
- [testing/mvp-1-test-log.md](testing/mvp-1-test-log.md) - MVP 1 test log
- [testing/mvp-1-test-results.md](testing/mvp-1-test-results.md) - MVP 1 results

### File Structure

```
workflow-engine/
├── docs/                    # You are here
│   ├── architecture/        # System design
│   ├── guides/              # How-to guides
│   ├── reference/           # Quick lookups
│   ├── integration/        # Integration docs
│   ├── design/             # Design decisions
│   └── testing/            # Test reports
├── src/                     # Source code
├── workflows/               # Workflow YAML files
├── artifacts/               # Workflow outputs
└── .cursor/rules/           # AI rules
```
