import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetUserSessionData Node - Calls userMessageManager.getSessionData()
export class BaseGetUserSessionDataNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/user-message-manager/getusersessiondata",
    title: "Get User Session Data",
    category: "codebolt/user-message-manager",
    description: "Gets session data from the user message manager",
    icon: "📂",
    color: "#795548"
  };

  constructor() {
    super(BaseGetUserSessionDataNode.metadata.title, BaseGetUserSessionDataNode.metadata.type);
    this.title = BaseGetUserSessionDataNode.metadata.title;
    this.size = [220, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for session key
    this.addInput("key", "string");

    // Event output for dataRetrieved
    this.addOutput("dataRetrieved", LiteGraph.EVENT);

    // Output for session value
    this.addOutput("value", 0 as any); // Can be any type

    // Output for has value boolean
    this.addOutput("hasValue", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}