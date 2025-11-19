import React from 'react';
import { BaseMCPToolsNode } from '@codebolt/agent-shared-nodes';

// Frontend UI-specific MCP Tools Node
export class MCPToolsNode extends BaseMCPToolsNode {
  constructor() {
    super();
    // Enhanced UI-specific properties
    this.properties = {
      ...this.properties,
      servers: ['codebolt'],
      autoRefresh: false,
      showToolCount: true
    };

    // Enhanced UI widgets
    this.addWidget("text", "Servers (comma separated)", this.properties.servers.join(','), "onServersChange");
    this.addWidget("toggle", "Auto Refresh", this.properties.autoRefresh, "onAutoRefreshToggle");
    this.addWidget("toggle", "Show Tool Count", this.properties.showToolCount, "onShowCountToggle");
  }

  onAutoRefreshToggle(value) {
    this.properties.autoRefresh = value;
  }

  onShowCountToggle(value) {
    this.properties.showToolCount = value;
    this.setDirtyCanvas(true);
  }

  // Frontend doesn't execute, just stores data for backend
  onExecute() {
    // Store the server data for later backend execution
    this.storedServers = this.getInputData(0) || this.properties.servers;
    this.storedToolCount = 0; // Will be updated by backend execution
  }

  // Override the base onExecute to provide UI feedback
  onDrawBackground(ctx) {
    if (this.flags.collapsed) return;

    // Draw status indicator
    ctx.fillStyle = "#9C27B0";
    ctx.fillRect(0, 0, this.size[0], 2);

    // Draw server list
    ctx.fillStyle = "#666";
    ctx.font = "10px Arial";
    const serverList = this.storedServers ? this.storedServers.join(', ') : this.properties.servers.join(', ');
    const serverText = serverList.length > 25
      ? serverList.substring(0, 25) + "..."
      : serverList;
    ctx.fillText(`Servers: ${serverText}`, 10, 15);

    // Draw tool count if enabled
    if (this.properties.showToolCount) {
      ctx.fillText(`Tools: ${this.storedToolCount || '?'}`, 10, 30);
    }
  }

  getTitle() {
    return "MCP Tools 🔧";
  }
}