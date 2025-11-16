import { BaseToolParameterModifierNode } from '@agent-creator/shared-nodes';
import { ToolParameterModifier } from '@agent-creator/message-modifiers';

// Backend Tool Parameter Modifier Node - actual implementation
export class ToolParameterModifierNode extends BaseToolParameterModifierNode {
  private modifier: ToolParameterModifier;

  constructor() {
    super();
    this.modifier = new ToolParameterModifier(this.getToolParameterModifierConfig());
  }

  async onExecute() {
    const toolCall = this.getInputData(0) as any;
    const customRules = this.getInputData(1) as any; // Optional custom modification rules

    if (!toolCall) {
      console.error('ToolParameterModifierNode: No tool call input provided');
      this.setOutputData(1, false);
      return;
    }

    try {
      // Update modifier configuration with current node properties and custom rules
      const config = this.getToolParameterModifierConfig();
      if (customRules) {
        config.customRules = customRules;
      }
      this.modifier = new ToolParameterModifier(config);

      // Create modification context
      const modificationContext = {
        toolCall: toolCall,
        originalParameters: toolCall.parameters || {},
        timestamp: new Date().toISOString(),
        config: config
      };

      // Apply the modification
      const result = await this.modifier.modify(toolCall, modificationContext);

      // Extract modification log and final parameters
      const { modificationLog, finalParameters } = this.extractModificationResults(toolCall, result);

      // Set outputs
      this.setOutputData(0, result);
      this.setOutputData(1, true);
      this.setOutputData(2, this.getToolParameterModifierConfig());
      this.setOutputData(3, modificationLog);
      this.setOutputData(4, finalParameters);

      // Trigger completion
      this.triggerSlot(0, null, null);

    } catch (error) {
      console.error('ToolParameterModifierNode: Error modifying tool parameters:', error);
      this.setOutputData(0, toolCall); // Return original tool call on error
      this.setOutputData(1, false);
      this.setOutputData(2, this.getToolParameterModifierConfig());
      this.setOutputData(3, [{ error: error.message, timestamp: new Date().toISOString() }]);
      this.setOutputData(4, toolCall.parameters || {});
    }
  }

  // Extract modification results from the modified tool call
  private extractModificationResults(originalToolCall: any, modifiedToolCall: any): { modificationLog: any[]; finalParameters: any } {
    try {
      const originalParameters = originalToolCall.parameters || {};
      const finalParameters = modifiedToolCall.parameters || {};

      const modificationLog: any[] = [];

      // Compare parameters to identify changes
      for (const [key, value] of Object.entries(finalParameters)) {
        if (originalParameters[key] !== value) {
          modificationLog.push({
            parameter: key,
            originalValue: originalParameters[key],
            modifiedValue: value,
            modificationType: 'changed',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Check for removed parameters
      for (const key of Object.keys(originalParameters)) {
        if (!(key in finalParameters)) {
          modificationLog.push({
            parameter: key,
            originalValue: originalParameters[key],
            modifiedValue: null,
            modificationType: 'removed',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Check for added parameters
      for (const [key, value] of Object.entries(finalParameters)) {
        if (!(key in originalParameters)) {
          modificationLog.push({
            parameter: key,
            originalValue: null,
            modifiedValue: value,
            modificationType: 'added',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Add configuration-based modifications
      const config = this.getToolParameterModifierConfig();
      if (config.sanitizationEnabled) {
        modificationLog.push({
          parameter: 'all',
          modificationType: 'sanitized',
          rules: config.sanitizationRules,
          timestamp: new Date().toISOString()
        });
      }

      if (config.transformationEnabled) {
        modificationLog.push({
          parameter: 'all',
          modificationType: 'transformed',
          rules: config.transformationRules,
          timestamp: new Date().toISOString()
        });
      }

      if (config.validationEnabled) {
        modificationLog.push({
          parameter: 'all',
          modificationType: 'validated',
          rules: config.validationRules,
          timestamp: new Date().toISOString()
        });
      }

      return {
        modificationLog: modificationLog,
        finalParameters: finalParameters
      };

    } catch (error) {
      console.error('Error extracting modification results:', error);
      return {
        modificationLog: [{ error: 'Failed to extract modification results', timestamp: new Date().toISOString() }],
        finalParameters: originalToolCall.parameters || {}
      };
    }
  }
}