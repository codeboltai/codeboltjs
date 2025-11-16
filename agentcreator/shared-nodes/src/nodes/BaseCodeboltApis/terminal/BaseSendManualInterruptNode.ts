import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base SendManualInterrupt Node - Calls codebolt.terminal.sendManualInterrupt
export class BaseSendManualInterruptNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/terminal/sendManualInterrupt",
    title: "Send Manual Interrupt",
    category: "codebolt/terminal",
    description: "Sends a manual interrupt signal to the terminal using codebolt.terminal.sendManualInterrupt",
    icon: "⏹️",
    color: "#F44336"
  };

  constructor() {
    super(BaseSendManualInterruptNode.metadata.title, BaseSendManualInterruptNode.metadata.type);
    this.title = BaseSendManualInterruptNode.metadata.title;
    this.size = [220, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for interrupt completion
    this.addOutput("interruptSent", LiteGraph.EVENT);

    // Output for interrupt response
    this.addOutput("response", "string");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}