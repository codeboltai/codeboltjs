import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetRemixPrompt Node - Calls userMessageManager.getRemixPrompt()
export class BaseGetRemixPromptNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/user-message-manager/getremixprompt",
    title: "Get Remix Prompt",
    category: "codebolt/user-message-manager",
    description: "Gets the remix prompt from the current user message",
    icon: "🎨",
    color: "#795548"
  };

  constructor() {
    super(BaseGetRemixPromptNode.metadata.title, BaseGetRemixPromptNode.metadata.type);
    this.title = BaseGetRemixPromptNode.metadata.title;
    this.size = [220, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for promptRetrieved
    this.addOutput("promptRetrieved", LiteGraph.EVENT);

    // Output for remix prompt
    this.addOutput("prompt", "string");

    // Output for has prompt boolean
    this.addOutput("hasPrompt", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}