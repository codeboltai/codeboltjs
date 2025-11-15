import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../utils';

// Interface for node properties
interface NodeProperties {
  showSplitOutputs: boolean;
  message: any;
}

// Base OnMessage Node - Entry point for agent flows
export class BaseOnMessageNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "events/onmessage",
    title: "OnMessage",
    category: "codebolt/events",
    description: "Entry point that waits for incoming messages and outputs either single message or split properties",
    icon: "📨",
    color: "#FF5722"
  };


  constructor() {
    super(BaseOnMessageNode.metadata.title);
    this.size = [200, 60];

    // Event output to trigger connected nodes
    this.addOutput("message_received", LiteGraph.EVENT);

    // State for output mode
    this.properties = {
      showSplitOutputs: false,
      message: null
    };

    // Data output for the FlatUserMessage object with extra_info for type validation
    this.addOutput("message", "object", {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "Complete user message object with all properties"
      }
    } as any);

    // Add toggle widget for frontend
    this.addWidget("toggle", "", false, "showSplitOutputs", { on: "Unified", off: "Split" });
  }

  // Handle property changes (toggle between single and split outputs)
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    if (name === "showSplitOutputs") {
      // In the frontend editor, we rebuild outputs when the toggle changes.
      // On the backend, outputs (and their links) come from the saved graphData
      // and must be preserved so Litegraph can propagate values correctly.
      const isBrowser = typeof window !== "undefined";
      const hasCanvas = isBrowser && this.graph && (this.graph as any).list_of_graphcanvas?.length;

      if (hasCanvas) {
         this.updateOutputs(value as boolean);
      }
    }
    return true; // Return true to allow default behavior
  }

  // Update outputs based on toggle state
  updateOutputs(showSplit: boolean): void {
    // Clear existing outputs (keep event output)
    const eventOutput = this.outputs[0];
    this.outputs = [eventOutput];

    if (showSplit) {
      // Add split outputs with detailed extra_info
      this.addOutput("userMessage", "string", {
        extra_info: {
          dataType: "string",
          description: "The user's message text"
        }
      } as any);

      this.addOutput("currentFile", "string", {
        extra_info: {
          dataType: DATA_TYPES.FILE_PATH,
          description: "Path to the currently active file"
        }
      } as any);

      this.addOutput("selectedAgent", "object", {
        extra_info: {
          dataType: DATA_TYPES.SELECTED_AGENT,
          description: "Selected agent information with id, name, type"
        }
      } as any);

      this.addOutput("mentionedFiles", "array", {
        extra_info: {
          dataType: "array",
          elementType: "string",
          arrayType: "filePath",
          description: "Array of mentioned file names"
        }
      } as any);

      this.addOutput("mentionedFullPaths", "array", {
        extra_info: {
          dataType: "array",
          elementType: "string",
          arrayType: "fullPath",
          description: "Array of mentioned file full paths"
        }
      } as any);

      this.addOutput("mentionedFolders", "array", {
        extra_info: {
          dataType: "array",
          elementType: "string",
          arrayType: "folderPath",
          description: "Array of mentioned folder names"
        }
      } as any);

      this.addOutput("mentionedMCPs", "array", {
        extra_info: {
          dataType: "array",
          elementType: "string",
          arrayType: "mcpServer",
          description: "Array of mentioned MCP server names"
        }
      } as any);

      this.addOutput("uploadedImages", "array", {
        extra_info: {
          dataType: "array",
          elementType: "string",
          arrayType: "imagePath",
          description: "Array of uploaded image paths/URLs"
        }
      } as any);

      this.addOutput("actions", "array", {
        extra_info: {
          dataType: "array",
          elementType: "object",
          arrayType: "action",
          description: "Array of action objects"
        }
      } as any);

      this.addOutput("mentionedAgents", "array", {
        extra_info: {
          dataType: "array",
          elementType: "object",
          arrayType: "agent",
          description: "Array of mentioned agent objects"
        }
      } as any);

      this.addOutput("selection", "object", {
        extra_info: {
          dataType: "selection",
          description: "Selection object with ranges and selected text"
        }
      } as any);

      // Adjust node size for split outputs
      this.size = [240, 300];
    } else {
      // Add single message output
      this.addOutput("message", "object", {
        extra_info: {
          dataType: "FlatUserMessage",
          description: "Complete user message object with all properties"
        }
      } as any);

      // Reset node size for single output
      this.size = [200, 60];
    }

    // Update the graph to show the changes
    if (this.graph) {
      this.graph.setDirtyCanvas(true, true);
    }
  }


}