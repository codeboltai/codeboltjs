import { BaseAddTaskToActionPlanNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { TaskPriority } from '@codebolt/types/lib';

// Backend-specific AddTaskToActionPlan Node - actual implementation
export class AddTaskToActionPlanNode extends BaseAddTaskToActionPlanNode {
  constructor() {
    super();
  }

  async onExecute() {
    const planId = this.getInputData(1) as string;
    const task = this.getInputData(2) as { [key: string]: any; name: string; description?: string; priority?: TaskPriority; taskType?: string; } | undefined;
    const taskName = this.getInputData(3) as string;
    const taskDescription = this.getInputData(4) as string;
    const taskPriority = this.getInputData(5) as TaskPriority;
    const taskType = this.getInputData(6) as string;

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