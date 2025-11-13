import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

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

  constructor() {
    super();
    this.title = BaseOnMessageNode.metadata.title;
    this.desc = "Entry point for agent flow - waits for incoming messages";
    this.size = [200, 80];

    this.properties = {
      message: "", // Will be populated from data.json
      eventType: "onMessage"
    };

    // Event output to trigger connected nodes
    this.addOutput("onTrigger", LiteGraph.EVENT);
    
    // Data output for the payload
    this.addOutput("message", "string");
  }

  // Get the message from global execution context or data.json
  getMessage() {
    // Check if we're in backend environment
    const isBackend = typeof window === 'undefined';

    if (isBackend) {
      // Backend: try global execution context first
      try {
        if (global && global.executionContext && global.executionContext.message) {
          return global.executionContext.message;
        }
      } catch (e) {
        // Ignore global access errors
      }

      // Backend: fallback to data.json file
      try {
        const fs = require('fs');
        const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
        return data.message || this.properties.message;
      } catch (error) {
        // console.log('OnMessageNode: Could not read message from data.json, using default');
        return this.properties.message;
      }
    } else {
      // Frontend: use property or default message
      return this.properties.message || "Waiting for message...";
    }
  }

  // Execute method for backend only
  onExecute() {
    // Check if we're in backend environment before executing
    // if (typeof window === 'undefined') {
    //   const message = this.getMessage();

    //   // Set output data
    //   this.setOutputData(0, message);

    //   // // console.log(`OnMessageNode ${this.id}: Processing message: ${message ? message.substring(0, 50) + '...' : 'empty'}`);
    // }
    // Frontend: do nothing
  }

  // Handle message received and trigger event
  onMessage(message) {
    this.properties.message = message;
    
    // Debug: log before triggering
    try {
      console.log('[BaseOnMessageNode] triggering onTrigger with message');
      console.log('[BaseOnMessageNode] output[0] links:', this.outputs?.[0]?.links);
      console.log('[BaseOnMessageNode] output[1] links:', this.outputs?.[1]?.links);
    } catch {}
    
    // Compose payload with metadata for downstream nodes
    const payload = {
      message,
      event: this.properties.eventType || 'onMessage',
      timestamp: new Date().toISOString()
    };
    
    // Set the data output at slot 1
    this.setOutputData(1, payload);
    
    // Trigger the event output at slot 0 (onTrigger)
    this.triggerSlot(0, payload);
  }
}