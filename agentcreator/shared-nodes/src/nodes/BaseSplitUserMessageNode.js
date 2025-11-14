import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

// Base SplitUserMessage Node - Splits a FlatUserMessage into individual properties
export class BaseSplitUserMessageNode extends LGraphNode {
  static metadata = {
    type: "utils/splitusermessage",
    title: "Split User Message",
    category: "utils",
    description: "Splits a FlatUserMessage into individual output properties",
    icon: "📋",
    color: "#9C27B0"
  };

  
  constructor() {
    super();
    this.title = BaseSplitUserMessageNode.metadata.title;
    this.desc = "Splits FlatUserMessage into individual properties";
    this.size = [240, 400];

    // Input for the FlatUserMessage object with extra_info for type validation
    this.addInput("message", "object", {
      extra_info: {
        dataType: "FlatUserMessage",
        description: "Complete user message object with all properties",
        acceptedTypes: ["FlatUserMessage", "object"] // Accept specific type or generic object
      }
    });

    // Individual outputs for each FlatUserMessage property using standard types with extra_info
    this.addOutput("userMessage", "string", {
      extra_info: {
        dataType: "string",
        description: "The user's message text"
      }
    });

    this.addOutput("currentFile", "string", {
      extra_info: {
        dataType: "filePath",
        description: "Path to the currently active file"
      }
    });

    this.addOutput("selectedAgent", "object", {
      extra_info: {
        dataType: "selectedAgent",
        description: "Selected agent information with id, name, type"
      }
    });

    this.addOutput("mentionedFiles", "array", {
      extra_info: {
        dataType: "array",
        elementType: "string",
        arrayType: "filePath",
        description: "Array of mentioned file names"
      }
    });

    this.addOutput("mentionedFullPaths", "array", {
      extra_info: {
        dataType: "array",
        elementType: "string",
        arrayType: "fullPath",
        description: "Array of mentioned file full paths"
      }
    });

    this.addOutput("mentionedFolders", "array", {
      extra_info: {
        dataType: "array",
        elementType: "string",
        arrayType: "folderPath",
        description: "Array of mentioned folder names"
      }
    });

    this.addOutput("mentionedMultiFile", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: "multiFile",
        description: "Array of multi-file selections"
      }
    });

    this.addOutput("mentionedMCPs", "array", {
      extra_info: {
        dataType: "array",
        elementType: "string",
        arrayType: "mcpServer",
        description: "Array of mentioned MCP server names"
      }
    });

    this.addOutput("uploadedImages", "array", {
      extra_info: {
        dataType: "array",
        elementType: "string",
        arrayType: "imagePath",
        description: "Array of uploaded image paths/URLs"
      }
    });

    this.addOutput("actions", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: "action",
        description: "Array of action objects"
      }
    });

    this.addOutput("mentionedAgents", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: "agent",
        description: "Array of mentioned agent objects"
      }
    });

    this.addOutput("mentionedDocs", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: "document",
        description: "Array of mentioned document objects"
      }
    });

    this.addOutput("links", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: "link",
        description: "Array of link objects"
      }
    });

    this.addOutput("universalAgentLastMessage", "string", {
      extra_info: {
        dataType: "string",
        description: "Last message from universal agent"
      }
    });

    this.addOutput("selection", "object", {
      extra_info: {
        dataType: "selection",
        description: "Selection object with ranges and selected text"
      }
    });

    this.addOutput("controlFiles", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: "controlFile",
        description: "Array of control file references"
      }
    });

    this.addOutput("feedbackMessage", "string", {
      extra_info: {
        dataType: "string",
        description: "Feedback message text"
      }
    });

    this.addOutput("terminalMessage", "string", {
      extra_info: {
        dataType: "string",
        description: "Terminal message text"
      }
    });

    this.addOutput("messageId", "string", {
      extra_info: {
        dataType: "messageId",
        description: "Unique message identifier"
      }
    });

    this.addOutput("threadId", "string", {
      extra_info: {
        dataType: "threadId",
        description: "Conversation thread identifier"
      }
    });

    this.addOutput("templateType", "string", {
      extra_info: {
        dataType: "templateType",
        description: "Template type identifier"
      }
    });

    this.addOutput("processId", "string", {
      extra_info: {
        dataType: "processId",
        description: "Process identifier"
      }
    });

    this.addOutput("shadowGitHash", "string", {
      extra_info: {
        dataType: "string",
        description: "Shadow git hash"
      }
    });

    this.addOutput("remixPrompt", "object", {
      extra_info: {
        dataType: "remixPrompt",
        description: "Remix prompt configuration object"
      }
    });

    this.addOutput("activeFile", "string", {
      extra_info: {
        dataType: "filePath",
        description: "Path to the active file"
      }
    });

    this.addOutput("openedFiles", "array", {
      extra_info: {
        dataType: "array",
        elementType: "string",
        arrayType: "filePath",
        description: "Array of currently opened file paths"
      }
    });
  }

  // Base execution logic - outputs individual message properties
  onExecute() {
    const message = this.getInputData(0);

    if (!message) {
      // Clear all outputs if no input
      for (let i = 1; i < this.outputs.length; i++) {
        this.setOutputData(i, null);
      }
      return;
    }

    try {
      // Output individual properties
      this.setOutputData(1, message.userMessage || "");
      this.setOutputData(2, message.currentFile || "");
      this.setOutputData(3, message.selectedAgent || {});
      this.setOutputData(4, message.mentionedFiles || []);
      this.setOutputData(5, message.mentionedFullPaths || []);
      this.setOutputData(6, message.mentionedFolders || []);
      this.setOutputData(7, message.mentionedMultiFile || []);
      this.setOutputData(8, message.mentionedMCPs || []);
      this.setOutputData(9, message.uploadedImages || []);
      this.setOutputData(10, message.actions || []);
      this.setOutputData(11, message.mentionedAgents || []);
      this.setOutputData(12, message.mentionedDocs || []);
      this.setOutputData(13, message.links || []);
      this.setOutputData(14, message.universalAgentLastMessage || "");
      this.setOutputData(15, message.selection || null);
      this.setOutputData(16, message.controlFiles || []);
      this.setOutputData(17, message.feedbackMessage || "");
      this.setOutputData(18, message.terminalMessage || "");
      this.setOutputData(19, message.messageId || "");
      this.setOutputData(20, message.threadId || "");
      this.setOutputData(21, message.templateType || "");
      this.setOutputData(22, message.processId || "");
      this.setOutputData(23, message.shadowGitHash || "");
      this.setOutputData(24, message.remixPrompt || {});
      this.setOutputData(25, message.activeFile || "");
      this.setOutputData(26, message.openedFiles || []);
    } catch (error) {
      console.error('SplitUserMessage: Error processing message:', error);
    }
  }

  // Optional: Add validation for the input
  onConnectionsChange(type, slotIndex, isConnected, link_info) {
    if (type === LiteGraph.INPUT && slotIndex === 0 && !isConnected) {
      // Clear outputs when input is disconnected
      for (let i = 1; i < this.outputs.length; i++) {
        this.setOutputData(i, null);
      }
    }
  }
}