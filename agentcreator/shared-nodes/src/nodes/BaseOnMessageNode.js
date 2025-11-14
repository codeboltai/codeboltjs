import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

// Base OnMessage Node - Entry point for agent flows
export class BaseOnMessageNode extends LGraphNode {
  static metadata = {
    type: "events/onmessage",
    title: "OnMessage",
    category: "events",
    description: "Entry point that waits for incoming messages and triggers agent flow",
    icon: "📨",
    color: "#FF5722"
  };

  // Custom type definitions for output restrictions
  // These custom types ensure only compatible connections can be made in the UI
  static typeDefinitions = {
    // Object types
    "selectedAgent": "Object with agent metadata (id, name, type, details)",
    "selection": "Selection object (ranges, selected text, position)",
    "remixPrompt": "Remix prompt configuration object",

    // Array types
    "fileArray": "Array of file names (strings)",
    "pathArray": "Array of full file paths (strings)",
    "folderArray": "Array of folder names (strings)",
    "multiFileArray": "Array of multi-file selections",
    "mcpArray": "Array of MCP server names",
    "imageArray": "Array of uploaded image URLs/paths",
    "actionArray": "Array of action objects",
    "agentArray": "Array of agent metadata objects",
    "documentArray": "Array of document references",
    "linkArray": "Array of link objects",
    "controlFileArray": "Array of control file references",
    "openedFileArray": "Array of currently opened file paths",

    // File types
    "file": "File path string",

    // ID types (for specific identification)
    "messageId": "Unique message identifier string",
    "threadId": "Conversation thread identifier string",
    "templateType": "Template type identifier string",
    "processId": "Process identifier string"
  };

  constructor() {
    super();
    this.title = BaseOnMessageNode.metadata.title;
    this.desc = "Entry point for agent flow - waits for incoming messages";
    this.size = [200, 80];

    // Event output to trigger connected nodes
    this.addOutput("message_received", LiteGraph.EVENT);

    // Data outputs for individual FlatUserMessage properties with specific type restrictions
    this.addOutput("userMessage", "string");
    this.addOutput("currentFile", "file");
    this.addOutput("selectedAgent", "selectedAgent");
    this.addOutput("mentionedFiles", "fileArray");
    this.addOutput("mentionedFullPaths", "pathArray");
    this.addOutput("mentionedFolders", "folderArray");
    this.addOutput("mentionedMultiFile", "multiFileArray");
    this.addOutput("mentionedMCPs", "mcpArray");
    this.addOutput("uploadedImages", "imageArray");
    this.addOutput("actions", "actionArray");
    this.addOutput("mentionedAgents", "agentArray");
    this.addOutput("mentionedDocs", "documentArray");
    this.addOutput("links", "linkArray");
    this.addOutput("universalAgentLastMessage", "string");
    this.addOutput("selection", "selection");
    this.addOutput("controlFiles", "controlFileArray");
    this.addOutput("feedbackMessage", "string");
    this.addOutput("terminalMessage", "string");
    this.addOutput("messageId", "messageId");
    this.addOutput("threadId", "threadId");
    this.addOutput("templateType", "templateType");
    this.addOutput("processId", "processId");
    this.addOutput("shadowGitHash", "string");
    this.addOutput("remixPrompt", "remixPrompt");
    this.addOutput("activeFile", "file");
    this.addOutput("openedFiles", "openedFileArray");
  }

  

}