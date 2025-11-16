import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base class for TaskInstruction node
export class BaseTaskInstructionNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "agent/task_instruction",
    title: "Task Instruction",
    category: "agent",
    description: "Creates a TaskInstruction with tools and user message",
    icon: "📝",
    color: "#FF9800"
  };
  constructor() {
    super(BaseTaskInstructionNode.metadata.title, BaseTaskInstructionNode.metadata.type);
    this.title = BaseTaskInstructionNode.metadata.title;
    this.properties = {
      taskContent: '',
      filePath: './task.yaml',
      taskName: 'main_task'
    };

    this.addInput("Agent Tools", "array");
    this.addInput("User Message", "object");
    this.addInput("Task Content", "string");
    this.addInput("File Path", "string");
    this.addInput("Task Name", "string");
    this.addOutput("TaskInstruction", "object");

    // Add widgets for UI
    this.addWidget("text", "Task Content", String(this.properties.taskContent), "onTaskContentChange");
    this.addWidget("text", "File Path", String(this.properties.filePath), "onFilePathChange");
    this.addWidget("text", "Task Name", String(this.properties.taskName), "onTaskNameChange");
  }

  onTaskContentChange(value) {
    this.properties.taskContent = value;
  }

  onFilePathChange(value) {
    this.properties.filePath = value;
  }

  onTaskNameChange(value) {
    this.properties.taskName = value;
  }

  async onExecute() {
    const agentTools = this.getInputData(0) || [];
    const userMessage = this.getInputData(1);
    const taskContent = this.getInputData(2) || this.properties.taskContent;
    const filePath = this.getInputData(3) || this.properties.filePath;
    const taskName = this.getInputData(4) || this.properties.taskName;

    if (!agentTools || !userMessage) {
      console.error('TaskInstructionNode: Agent Tools and User Message inputs are required');
      return;
    }

    // Create TaskInstruction object
    const taskInstruction = {
      agentTools: agentTools,
      userMessage: userMessage,
      taskContent: taskContent,
      filePath: filePath,
      taskName: taskName,
      type: 'task'
    };

    this.setOutputData(0, taskInstruction);
  }
}