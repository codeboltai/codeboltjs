import { BaseAddTaskToActionPlanNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific AddTaskToActionPlan Node - actual implementation
export class AddTaskToActionPlanNode extends BaseAddTaskToActionPlanNode {
  constructor() {
    super();
  }

  async onExecute() {
    const planId = this.getInputData(1);
    const task = this.getInputData(2);
    const taskName = this.getInputData(3);
    const taskDescription = this.getInputData(4);
    const taskPriority = this.getInputData(5);
    const taskType = this.getInputData(6);

    if (!planId || typeof planId !== 'string' || !planId.trim()) {
      const errorMessage = 'Error: Plan ID cannot be empty';
      console.error('AddTaskToActionPlanNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    try {
      let finalTask = task;

      // If no task object provided, construct it from individual inputs
      if (!finalTask && taskName) {
        finalTask = {
          name: taskName,
          description: taskDescription || '',
          priority: taskPriority || 'medium',
          taskType: taskType || 'general'
        };
      }

      if (!finalTask || !finalTask.name) {
        const errorMessage = 'Error: Task object or task name is required';
        console.error('AddTaskToActionPlanNode error:', errorMessage);
        this.setOutputData(2, false);
        this.setOutputData(1, null);
        return;
      }

      const result = await codebolt.actionPlan.addTaskToActionPlan(planId, finalTask);

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the taskAdded event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error adding task to action plan: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      console.error('AddTaskToActionPlanNode error:', error);
    }
  }
}