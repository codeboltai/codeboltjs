import { BaseToolValidationNode } from '@agent-creator/shared-nodes';
import { ToolValidationModifier } from '@agent-creator/message-modifiers';

// Backend Tool Validation Node - actual implementation
export class ToolValidationNode extends BaseToolValidationNode {
  private modifier: ToolValidationModifier;

  constructor() {
    super();
    this.modifier = new ToolValidationModifier(this.getToolValidationConfig());
  }

  async onExecute() {
    const toolCall = this.getInputData(0) as any;
    const customValidationRules = this.getInputData(1) as any; // Optional custom validation rules

    if (!toolCall) {
      console.error('ToolValidationNode: No tool call input provided');
      this.setOutputData(1, false);
      return;
    }

    try {
      // Update modifier configuration with current node properties and custom rules
      const config = this.getToolValidationConfig();
      if (customValidationRules) {
        // Merge custom validation rules with existing ones
        config.customRules = customValidationRules;
      }
      this.modifier = new ToolValidationModifier(config);

      // Create validation context
      const validationContext = {
        toolCall: toolCall,
        timestamp: new Date().toISOString(),
        config: config
      };

      // Apply the validation
      const result = await this.modifier.validate(toolCall, validationContext);

      // Extract validation results and errors
      const { validationResults, validationErrors, success } = this.extractValidationResults(result);

      // Set outputs
      this.setOutputData(0, result);
      this.setOutputData(1, success);
      this.setOutputData(2, this.getToolValidationConfig());
      this.setOutputData(3, validationResults);
      this.setOutputData(4, validationErrors);

      // Trigger completion
      this.triggerSlot(0, null, null);

    } catch (error) {
      console.error('ToolValidationNode: Error validating tool call:', error);
      this.setOutputData(0, toolCall); // Return original tool call on error
      this.setOutputData(1, false);
      this.setOutputData(2, this.getToolValidationConfig());
      this.setOutputData(3, { error: error.message, timestamp: new Date().toISOString() });
      this.setOutputData(4, [error.message]);
    }
  }

  // Extract validation results from the validation response
  private extractValidationResults(result: any): { validationResults: any; validationErrors: string[]; success: boolean } {
    try {
      const validationResults = {
        isValid: result.isValid || false,
        toolType: result.toolType || 'unknown',
        parameterCount: result.parameterCount || 0,
        validationChecks: result.validationChecks || {},
        timestamp: new Date().toISOString()
      };

      const validationErrors: string[] = [];
      if (result.errors && Array.isArray(result.errors)) {
        validationErrors.push(...result.errors);
      } else if (result.error) {
        validationErrors.push(result.error);
      }

      return {
        validationResults: validationResults,
        validationErrors: validationErrors,
        success: validationResults.isValid && validationErrors.length === 0
      };

    } catch (error) {
      console.error('Error extracting validation results:', error);
      return {
        validationResults: {
          isValid: false,
          error: 'Failed to extract validation results',
          timestamp: new Date().toISOString()
        },
        validationErrors: ['Validation extraction failed'],
        success: false
      };
    }
  }
}