import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base class for SystemPrompt node
export class BaseSystemPromptNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "agent/system_prompt",
    title: "System Prompt",
    category: "agent",
    description: "Creates a system prompt payload for agents",
    icon: "🧠",
    color: "#3F51B5"
  };
  constructor() {
    super(BaseSystemPromptNode.metadata.title, BaseSystemPromptNode.metadata.type);
    this.title = BaseSystemPromptNode.metadata.title;
    this.properties = {
      promptContent: '',
      filePath: './agent.yaml',
      profile: 'default'
    };

    this.addInput("Prompt Content", "string");
    this.addInput("File Path", "string");
    this.addInput("Profile", "string");
    this.addOutput("SystemPrompt", "object");

    // Add widgets for UI
    this.addWidget("text", "Prompt Content", String(this.properties.promptContent), "onPromptChange");
    this.addWidget("text", "File Path", String(this.properties.filePath), "onFilePathChange");
    this.addWidget("text", "Profile", String(this.properties.profile), "onProfileChange");
  }

  onPromptChange(value) {
    this.properties.promptContent = value;
  }

  onFilePathChange(value) {
    this.properties.filePath = value;
  }

  onProfileChange(value) {
    this.properties.profile = value;
  }

  async onExecute() {
    const promptContent = this.getInputData(0) || this.properties.promptContent;
    const filePath = this.getInputData(1) || this.properties.filePath;
    const profile = this.getInputData(2) || this.properties.profile;

    // Create SystemPrompt object
    const systemPrompt = {
      content: promptContent,
      filePath: filePath,
      profile: profile,
      type: 'system'
    };

    this.setOutputData(0, systemPrompt);
  }
}