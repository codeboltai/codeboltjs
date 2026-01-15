import { NodeMetadata } from '../../../types';
import { BaseChatActionNode } from './BaseChatActionNode';

export class BaseAskQuestionNode extends BaseChatActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/chat/askQuestion",
    title: "Ask Question",
    category: "codebolt/chat",
    description: "Asks a question with buttons and waits for answer",
    icon: "💬",
    color: "#03A9F4"
  };

  constructor() {
    super(BaseAskQuestionNode.metadata, [360, 200]);
    this.addProperty("question", "", "string");
    this.addProperty("buttons", "[]", "string");
    this.addProperty("withFeedback", false, "boolean");

    this.addInput("question", "string");
    this.addInput("buttons", "array");
    this.addInput("withFeedback", "boolean");

    this.addOutput("answer", "string");
  }
}
