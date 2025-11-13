import { BaseTaskInstructionNode } from '@agent-creator/shared-nodes';

// Backend-specific TaskInstruction Node - execution logic only
export class TaskInstructionNode extends BaseTaskInstructionNode {
  constructor() {
    super();
    // Backend doesn't need UI widgets
  }

  async onExecute() {
    const agentTools = this.getInputData(0) || [];
    const userMessage = this.getInputData(1);
    const taskContent = this.getInputData(2) || this.properties.taskContent;
    const filePath = this.getInputData(3) || this.properties.filePath;
    const taskName = this.getInputData(4) || this.properties.taskName;

    if (!agentTools || !userMessage) {
      console.error('TaskInstructionNode: Agent Tools and User Message inputs are required');
      this.setOutputData(0, null);
      return;
    }

    try {
      // Import and use actual TaskInstruction class from @codebolt/utils
      const { TaskInstruction } = require("@codebolt/utils");

      // Use actual TaskInstruction constructor - it takes agentTools, userMessage, filePath, and taskName
      const task = new TaskInstruction(agentTools, userMessage, filePath, taskName);

      this.setOutputData(0, task);
      // console.log(`TaskInstructionNode ${this.id}: Created TaskInstruction instance for ${taskName}`);
    } catch (error) {
      console.error(`TaskInstructionNode ${this.id}: Error creating TaskInstruction:`, error);
      this.setOutputData(0, null);
    }
  }
}