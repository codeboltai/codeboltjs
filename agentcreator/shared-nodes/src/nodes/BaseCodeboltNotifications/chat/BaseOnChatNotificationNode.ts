import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Interface for node properties
interface NodeProperties {
  showSplitOutputs: boolean;
  notificationType: string;
}

// Base OnChatNotification Node - Event listener for chat notifications
export class BaseOnChatNotificationNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/chat/onnotification",
    title: "On Chat Notification",
    category: "codebolt/notifications/chat",
    description: "Listens for incoming chat notifications and outputs either single notification or split properties",
    icon: "🔔",
    color: "#FF5722"
  };

  constructor() {
    super(BaseOnChatNotificationNode.metadata.title);
    this.size = [200, 80];

    // Event output to trigger connected nodes
    this.addOutput("notification_received", LiteGraph.EVENT);

    // State for output mode and filtering
    this.properties = {
      showSplitOutputs: false,
      notificationType: ""
    };

    // Data output for the complete notification object
    this.addOutput("notification", "object", {
      extra_info: {
        dataType: "object",
        description: "Complete chat notification object with all properties"
      }
    } as any);

    // Add widgets for frontend configuration
    this.addWidget("toggle", "", false, "showSplitOutputs", { on: "Split", off: "Unified" });
    this.addWidget("text", "Type Filter", "", "notificationType", {} as any);
  }

  // Handle property changes
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    if (name === "showSplitOutputs") {
      const isBrowser = typeof window !== "undefined";
      const hasCanvas = isBrowser && this.graph && (this.graph as any).list_of_graphcanvas?.length;

      if (hasCanvas) {
         this.updateOutputs(value as boolean);
      }
    }
    return true;
  }

  // Update outputs based on toggle state
  updateOutputs(showSplit: boolean): void {
    // Clear existing outputs (keep event output)
    const eventOutput = this.outputs[0];
    this.outputs = [eventOutput];

    if (showSplit) {
      // Add split outputs
      this.addOutput("toolUseId", "string", {
        extra_info: {
          dataType: "string",
          description: "Tool use identifier"
        }
      } as any);

      this.addOutput("action", "string", {
        extra_info: {
          dataType: "string",
          description: "Notification action type"
        }
      } as any);

      this.addOutput("data", "object", {
        extra_info: {
          dataType: "object",
          description: "Notification data payload"
        }
      } as any);

      this.addOutput("content", "object", {
        extra_info: {
          dataType: "object",
          description: "Notification content"
        }
      } as any);

      this.addOutput("isError", "boolean", {
        extra_info: {
          dataType: "boolean",
          description: "Error status"
        }
      } as any);

      // Adjust node size for split outputs
      this.size = [220, 200];
    } else {
      // Add single notification output
      this.addOutput("notification", "object", {
        extra_info: {
          dataType: "object",
          description: "Complete notification object"
        }
      } as any);

      // Reset node size for single output
      this.size = [200, 80];
    }

    // Update the graph to show the changes
    if (this.graph) {
      this.graph.setDirtyCanvas(true, true);
    }
  }
}