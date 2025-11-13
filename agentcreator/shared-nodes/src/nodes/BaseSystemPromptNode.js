import { LGraphNode } from '@comfyorg/litegraph';

// Base class for SystemPrompt node
export class BaseSystemPromptNode extends LGraphNode {
  constructor() {
    super();
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
    this.addWidget("text", "Prompt Content", this.properties.promptContent, "onPromptChange");
    this.addWidget("text", "File Path", this.properties.filePath, "onFilePathChange");
    this.addWidget("text", "Profile", this.properties.profile, "onProfileChange");
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