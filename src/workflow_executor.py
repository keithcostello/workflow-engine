"""
Workflow Executor

Reads workflow definition from YAML and executes tasks with HITL support.
This is a skeleton implementation - action handlers need to be implemented
for actual task execution.

Usage:
    executor = WorkflowExecutor("workflow.yaml")
    executor.execute()

For AI assistant usage, share the workflow YAML and the AI will execute
tasks, pausing at HITL gates for user input.
"""
import re
import sys
import yaml
from enum import Enum
from typing import Dict, List, Any, Optional


class HITLType(Enum):
    APPROVAL = "approval"
    QUESTION = "question"
    INFO = "info"
    NONE = "none"


class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETE = "complete"
    FAILED = "failed"
    RETRYING = "retrying"


class WorkflowExecutor:
    def __init__(self, workflow_file: str):
        """Load workflow definition from YAML file."""
        with open(workflow_file, 'r') as f:
            self.workflow = yaml.safe_load(f)
        
        self.current_task_index = 0
        self.task_states: Dict[str, Dict] = {}
        self.retry_counts: Dict[str, int] = {}
        
    def execute(self):
        """Execute workflow from start to finish."""
        tasks = self.workflow['workflow']['tasks']
        
        while self.current_task_index < len(tasks):
            task = tasks[self.current_task_index]
            task_id = task['id']
            
            print(f"\n{'='*60}")
            print(f"Executing: {task['name']} (Task {self.current_task_index + 1}/{len(tasks)})")
            print(f"{'='*60}")
            
            # Check retry limit
            if self.retry_counts.get(task_id, 0) >= task.get('retry', {}).get('max_attempts', 3):
                print(f"❌ Max retries reached for {task_id}. Escalating...")
                self._escalate(task)
                break
            
            # Execute task
            result = self._execute_task(task)
            
            # Handle result
            if result['status'] == 'complete':
                self._handle_complete(task, result)
            elif result['status'] == 'error':
                self._handle_error(task, result)
    
    def _execute_task(self, task: Dict) -> Dict:
        """Execute a single task."""
        task_id = task['id']
        role = task['role']
        action = task['action']
        
        # Update state
        self.task_states[task_id] = {
            'status': TaskStatus.IN_PROGRESS.value,
            'role': role,
            'action': action
        }
        
        # Handle HITL before task execution
        hitl_result = self._handle_hitl(task, 'before')
        if hitl_result == 'blocked':
            return {'status': 'blocked', 'message': 'HITL gate blocked execution'}
        
        # Execute action (placeholder - would call actual action handlers)
        print(f"  Role: {role}")
        print(f"  Action: {action}")
        print(f"  Params: {task.get('params', {})}")
        
        # Simulate task execution
        # In real implementation, this would call action handlers
        result = {
            'status': 'complete',
            'data': {'task_id': task_id}
        }
        
        # Handle HITL after task execution
        hitl_result = self._handle_hitl(task, 'after')
        if hitl_result == 'blocked':
            return {'status': 'blocked', 'message': 'HITL gate blocked continuation'}
        
        return result
    
    def _handle_hitl(self, task: Dict, timing: str) -> str:
        """Handle Human-In-The-Loop interaction."""
        hitl = task.get('hitl')
        if not hitl or hitl.get('type') == 'none':
            return 'continue'
        
        hitl_type = HITLType(hitl['type'])
        message = hitl.get('message', '')
        
        if timing == 'before' and hitl_type != HITLType.APPROVAL:
            # Only approval gates block before execution
            return 'continue'
        
        print(f"\n  [HITL {timing.upper()}] {hitl_type.value.upper()}")
        print(f"  Message: {message}")
        
        if hitl_type == HITLType.APPROVAL:
            response = self._get_user_approval(message)
            if response == 'no':
                return 'blocked'
            return 'continue'
        
        elif hitl_type == HITLType.QUESTION:
            options = hitl.get('options', ['yes', 'no'])
            response = self._ask_user_question(message, options)
            
            # Handle branching based on answer
            on_no = hitl.get('on_no')
            if response == 'no' and on_no:
                self._jump_to_task(on_no)
                return 'redirected'
            
            return 'continue'
        
        elif hitl_type == HITLType.INFO:
            print(f"  ℹ️  {message}")
            if hitl.get('auto_continue', True):
                return 'continue'
            return self._get_user_approval("Continue?")
        
        return 'continue'
    
    def _get_user_approval(self, message: str) -> str:
        """Get user approval (placeholder - would use actual UI/API)."""
        # In real implementation, this would:
        # - Display message to user
        # - Wait for user response
        # - Return 'yes' or 'no'
        
        print(f"  ⏸️  Waiting for user approval...")
        print(f"  [SIMULATED] User approves")
        return 'yes'  # Simulated
    
    def _ask_user_question(self, message: str, options: List[str]) -> str:
        """Ask user a question (placeholder - would use actual UI/API)."""
        # In real implementation, this would:
        # - Display question and options
        # - Wait for user selection
        # - Return selected option
        
        print(f"  ❓ Question: {message}")
        print(f"  Options: {', '.join(options)}")
        print(f"  [SIMULATED] User selects: {options[0]}")
        return options[0]  # Simulated
    
    def _handle_complete(self, task: Dict, result: Dict):
        """Handle task completion. Conditions (from subagent result) override on_complete when matched."""
        task_id = task['id']
        self.task_states[task_id]['status'] = TaskStatus.COMPLETE.value
        
        # Evaluate conditions first (use subagent result from result.get('data', {}))
        conditions = task.get('conditions', [])
        subagent_result = result.get('data', {})
        for condition in conditions:
            if self._evaluate_condition(condition['if'], subagent_result):
                target = condition.get('then')
                if target == 'next':
                    self.current_task_index += 1
                else:
                    self._jump_to_task(target)
                return
        
        # No condition matched: use on_complete
        on_complete = task.get('on_complete', 'next')
        if on_complete == 'next':
            self.current_task_index += 1
        else:
            self._jump_to_task(on_complete)
    
    def _handle_error(self, task: Dict, result: Dict):
        """Handle task error."""
        task_id = task['id']
        self.task_states[task_id]['status'] = TaskStatus.FAILED.value
        
        on_error = task.get('on_error', 'retry')
        if on_error == 'retry':
            self.retry_counts[task_id] = self.retry_counts.get(task_id, 0) + 1
            print(f"  ⚠️  Error occurred. Retrying... (Attempt {self.retry_counts[task_id]})")
            # Stay on same task to retry
        else:
            self._jump_to_task(on_error)
    
    def _evaluate_condition(self, condition_expr: str, subagent_result: Dict) -> bool:
        """Evaluate condition using subagent result. Supports expressions like result == 'pass' or result == 'fail'."""
        match = re.match(r"(\w+)\s*==\s*['\"]([^'\"]+)['\"]", condition_expr.strip())
        if not match:
            return False
        var_name, expected = match.group(1), match.group(2)
        actual = subagent_result.get(var_name)
        if actual is None:
            return False
        return str(actual) == expected
    
    def _jump_to_task(self, task_id: str):
        """Jump to a specific task by ID."""
        tasks = self.workflow['workflow']['tasks']
        for i, task in enumerate(tasks):
            if task['id'] == task_id:
                self.current_task_index = i
                return
        print(f"  ⚠️  Task '{task_id}' not found. Continuing to next task.")
        self.current_task_index += 1
    
    def _escalate(self, task: Dict):
        """Escalate to human intervention."""
        message = self.workflow['workflow'].get('error_handling', {}).get('escalation_message', 
                                                                          'Workflow error: Human intervention required.')
        print(f"\n🚨 ESCALATION REQUIRED")
        print(f"   {message}")
        print(f"   Task: {task['name']}")
        print(f"   Task ID: {task['id']}")


if __name__ == "__main__":
    # Example usage - path relative to project root
    import os
    workflow_path = os.path.join(os.path.dirname(__file__), '..', 'workflows', 'workflow-definition.yaml')
    executor = WorkflowExecutor(workflow_path)
    executor.execute()
