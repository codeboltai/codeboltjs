import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Base Workflow Node - Multi-step workflow orchestration
export class BaseWorkflowNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "unified/agent/workflow",
    title: "Workflow",
    category: "unified/agent",
    description: "Execute multi-step workflows with validation and step management",
    icon: "🔄",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseWorkflowNode.metadata.title, BaseWorkflowNode.metadata.type);
    this.title = BaseWorkflowNode.metadata.title;
    this.size = [280, 240];

    // Trigger input for workflow execution
    this.addInput("onExecute", LiteGraph.ACTION);

    // Input for workflow configuration
    this.addInput("workflowConfig", "object", {
      extra_info: {
        dataType: DATA_TYPES.WORKFLOW_CONFIG,
        description: "Workflow configuration with steps and validation schemas"
      }
    } as any);

    // Input for initial data
    this.addInput("data", "object", {
      extra_info: {
        dataType: "object",
        description: "Initial data for workflow execution"
      }
    } as any);

    // Event output for workflow start
    this.addOutput("onStart", LiteGraph.EVENT);

    // Event output for step completion
    this.addOutput("onStepComplete", LiteGraph.EVENT);

    // Event output for workflow completion
    this.addOutput("onComplete", LiteGraph.EVENT);

    // Event output for workflow error
    this.addOutput("onError", LiteGraph.EVENT);

    // Output for workflow result
    this.addOutput("result", "object", {
      extra_info: {
        dataType: DATA_TYPES.WORKFLOW_RESULT,
        description: "Complete workflow execution result with step results"
      }
    } as any);

    // Output for execution ID
    this.addOutput("executionId", "string");

    // Output for current step
    this.addOutput("currentStep", "string");

    // Output for step results
    this.addOutput("stepResults", "object");

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for error message
    this.addOutput("error", "string");

    // Workflow configuration properties
    this.properties = {
      workflowName: "My Workflow",
      enableValidation: true,
      enableLogging: true,
      maxExecutionTime: 300000, // 5 minutes
      continueOnError: false
    };

    // Add widgets for configuration
    this.addWidget("text", "workflow name", this.properties.workflowName, "workflowName");
    this.addWidget("toggle", "enable validation", this.properties.enableValidation, "enableValidation");
    this.addWidget("toggle", "enable logging", this.properties.enableLogging, "enableLogging");
    this.addWidget("number", "max execution time (ms)", this.properties.maxExecutionTime, "maxExecutionTime", { min: 1000, max: 3600000 });
    this.addWidget("toggle", "continue on error", this.properties.continueOnError, "continueOnError");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}