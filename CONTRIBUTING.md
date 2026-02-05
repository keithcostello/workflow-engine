# Contributing to Workflow Engine

Thank you for your interest in contributing!

## Getting Started

1. Read [docs/guides/TRAINING-GUIDE.md](./docs/guides/TRAINING-GUIDE.md) to understand the system
2. Review [workflows/workflow-definition.yaml](./workflows/workflow-definition.yaml) for the full schema
3. Check [workflows/](./workflows/) for workflow patterns

## How to Contribute

### Adding Examples

Add example workflows to `workflows/`:
- Use descriptive filenames
- Include comments explaining the pattern
- Keep examples simple and focused

### Improving Documentation

- Update [docs/guides/TRAINING-GUIDE.md](./docs/guides/TRAINING-GUIDE.md) with new patterns
- Add examples to [README.md](./README.md)
- Document new HITL types or features

### Enhancing Executor

The `src/workflow_executor.py` is a skeleton. Contributions welcome for:
- Action handler framework
- HITL UI/API integration
- Condition evaluation engine
- State persistence
- Error recovery

## Code Style

- Follow PEP 8 for Python
- Use type hints
- Add docstrings
- Keep functions focused and small

## Testing

When adding features:
1. Create example workflow demonstrating the feature
2. Test with AI assistant
3. Document usage in docs/guides/TRAINING-GUIDE.md

## Questions?

Open an issue or discussion for questions about:
- Workflow patterns
- HITL types
- Executor implementation
- Best practices
