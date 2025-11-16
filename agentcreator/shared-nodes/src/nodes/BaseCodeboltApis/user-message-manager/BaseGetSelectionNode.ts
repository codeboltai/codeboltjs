import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetSelection Node - Calls userMessageManager.getSelection()
export class BaseGetSelectionNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/user-message-manager/getselection",
    title: "Get Selection",
    category: "codebolt/user-message-manager",
    description: "Gets the text selection from the current user message",
    icon: "🎯",
    color: "#795548"
  };

  constructor() {
    super(BaseGetSelectionNode.metadata.title, BaseGetSelectionNode.metadata.type);
    this.title = BaseGetSelectionNode.metadata.title;
    this.size = [220, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for selectionRetrieved
    this.addOutput("selectionRetrieved", LiteGraph.EVENT);

    // Output for selected text
    this.addOutput("selection", "string");

    // Output for has selection boolean
    this.addOutput("hasSelection", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}