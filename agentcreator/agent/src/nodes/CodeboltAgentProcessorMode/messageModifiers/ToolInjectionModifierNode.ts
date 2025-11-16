import { BaseToolInjectionModifierNode } from '@agent-creator/shared-nodes';
import { ToolInjectionModifier } from '@agent-creator/message-modifiers';

// Backend Tool Injection Modifier Node - actual implementation
export class ToolInjectionModifierNode extends BaseToolInjectionModifierNode {
  private modifier: ToolInjectionModifier;

  constructor() {
    super();
    this.modifier = new ToolInjectionModifier(this.getToolInjectionConfig());
  }

  async onExecute() {
    const message = this.getInputData(0) as any;
    const toolFilters = this.getInputData(1) as string; // Optional input

    if (!message) {
      console.error('ToolInjectionModifierNode: No message input provided');
      this.setOutputData(2, false);
      return;
    }

    try {
      // Update configuration with current node properties and optional tool filters
      const config = this.getToolInjectionConfig();
      if (toolFilters) {
        config.enabledCategories = toolFilters.split(',').map(cat => cat.trim()).filter(cat => cat);
      }
      this.modifier = new ToolInjectionModifier(config);

      // Create a processed message object
      const processedMessage = {
        ...message,
        messages: message.messages || []
      };

      // Apply the modifier
      const result = await this.modifier.modify(message, processedMessage);

      // Set outputs
      this.setOutputData(0, result);
      this.setOutputData(2, true);

      // Extract injected tools and tool config from the result
      const { injectedTools, toolConfig } = this.extractToolInfo(result);
      this.setOutputData(3, injectedTools);
      this.setOutputData(4, toolConfig);

      // Trigger completion
      this.triggerSlot(0, null, null);

    } catch (error) {
      console.error('ToolInjectionModifierNode: Error processing message:', error);
      this.setOutputData(0, message); // Return original message on error
      this.setOutputData(2, false);
      this.setOutputData(3, []);
      this.setOutputData(4, null);
    }
  }

  // Extract tool information from the processed message
  private extractToolInfo(result: any): { injectedTools: any[]; toolConfig: any } {
    try {
      const messages = result.messages || [];
      const toolMessage = messages.find((msg: any) =>
        msg.role === 'system' && msg.content &&
        (msg.content.includes('Available Tools:') || msg.content.includes('Tools:'))
      );

      if (toolMessage && toolMessage.content) {
        // Parse tools from the content (this is a simplified parser)
        const injectedTools = this.parseToolsFromContent(toolMessage.content);

        return {
          injectedTools: injectedTools,
          toolConfig: {
            toolsLocation: this.properties.toolsLocation,
            includeToolDescriptions: this.properties.includeToolDescriptions,
            maxToolsInMessage: this.properties.maxToolsInMessage,
            giveToolExamples: this.properties.giveToolExamples,
            maxToolExamples: this.properties.maxToolExamples,
            enabledCategories: this.properties.enabledCategories,
            timestamp: new Date().toISOString(),
            toolsFound: injectedTools.length
          }
        };
      }

      return {
        injectedTools: [],
        toolConfig: {
          toolsLocation: this.properties.toolsLocation,
          includeToolDescriptions: this.properties.includeToolDescriptions,
          maxToolsInMessage: this.properties.maxToolsInMessage,
          giveToolExamples: this.properties.giveToolExamples,
          maxToolExamples: this.properties.maxToolExamples,
          enabledCategories: this.properties.enabledCategories,
          timestamp: new Date().toISOString(),
          toolsFound: 0,
          message: 'No tools found in processed message'
        }
      };

    } catch (error) {
      console.error('Error extracting tool info:', error);
      return {
        injectedTools: [],
        toolConfig: {
          toolsLocation: this.properties.toolsLocation,
          includeToolDescriptions: this.properties.includeToolDescriptions,
          maxToolsInMessage: this.properties.maxToolsInMessage,
          giveToolExamples: this.properties.giveToolExamples,
          maxToolExamples: this.properties.maxToolExamples,
          enabledCategories: this.properties.enabledCategories,
          timestamp: new Date().toISOString(),
          error: 'Failed to extract tool information'
        }
      };
    }
  }

  // Parse tools from the content string (simplified implementation)
  private parseToolsFromContent(content: string): any[] {
    try {
      const tools: any[] = [];
      const lines = content.split('\n');
      let currentTool: any = null;

      for (const line of lines) {
        if (line.includes('- ') || line.includes('* ')) {
          // New tool entry
          if (currentTool) {
            tools.push(currentTool);
          }
          currentTool = {
            name: line.replace(/^[-*]\s*/, '').trim(),
            description: '',
            parameters: {}
          };
        } else if (currentTool && line.trim()) {
          // Tool description or parameters
          if (currentTool.description === '') {
            currentTool.description = line.trim();
          } else {
            currentTool.description += ' ' + line.trim();
          }
        }
      }

      if (currentTool) {
        tools.push(currentTool);
      }

      return tools;

    } catch (error) {
      console.error('Error parsing tools from content:', error);
      return [];
    }
  }
}