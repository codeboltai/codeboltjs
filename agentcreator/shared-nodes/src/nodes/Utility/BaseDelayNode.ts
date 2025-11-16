import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

// Base Delay Node - shared metadata and structure
export class BaseDelayNode extends LGraphNode {
  static metadata = {
    type: "basic/delay",
    title: "Delay",
    category: "basic",
    description: "Delay execution by specified time",
    icon: "⏱️",
    color: "#FF5722"
  };

  constructor() {
    super(BaseDelayNode.metadata.title, BaseDelayNode.metadata.type);
    this.title = BaseDelayNode.metadata.title;

    // Add inputs and outputs
    this.addInput("trigger", LiteGraph.ACTION);
    this.addInput("data", 0); // Pass-through data
    this.addInput("delay", "number"); // Configurable delay time

    this.addOutput("onComplete", LiteGraph.EVENT);
    this.addOutput("data", 0); // Pass-through data output

    // Add properties
    this.addProperty("delay", 1000); // Default 1 second delay
    this.addProperty("async", true); // Whether delay should be async

    this.size = [140, 80];
    this.mode = LiteGraph.ON_TRIGGER;
  }

  // Shared delay logic
  async executeDelay(delayMs: number, data?: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data);
      }, delayMs);
    });
  }

  // Validation helpers
  validateDelay(value: any): number {
    const delay = parseFloat(value);
    return isNaN(delay) || delay < 0 ? 1000 : Math.min(delay, 60000); // Max 60 seconds
  }

  // Shared property setter
  setProperty(name: string, value: any) {
    switch (name) {
      case 'delay':
        this.properties.delay = this.validateDelay(value);
        break;
      case 'async':
        this.properties.async = Boolean(value);
        break;
      default:
        super.setProperty(name, value);
    }
  }
}