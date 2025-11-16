import { BaseArgumentProcessorModifierNode } from '@agent-creator/shared-nodes';
import { ArgumentProcessorModifier } from '@agent-creator/message-modifiers';

// Backend Argument Processor Modifier Node - actual implementation
export class ArgumentProcessorModifierNode extends BaseArgumentProcessorModifierNode {
  private modifier: ArgumentProcessorModifier;

  constructor() {
    super();
    this.modifier = new ArgumentProcessorModifier(this.getArgumentProcessorConfig());
  }

  async onExecute() {
    const message = this.getInputData(0) as any;
    const customArguments = this.getInputData(1) as string; // Optional custom arguments

    if (!message) {
      console.error('ArgumentProcessorModifierNode: No message input provided');
      this.setOutputData(2, false);
      return;
    }

    try {
      // Update modifier configuration with current node properties
      this.modifier = new ArgumentProcessorModifier(this.getArgumentProcessorConfig());

      // Create a processed message object
      let processedMessage = {
        ...message,
        messages: message.messages || []
      };

      // If custom arguments are provided, enhance the message with them
      if (customArguments) {
        processedMessage.userMessage += '\n\nCustom Arguments: ' + customArguments;
      }

      // Apply the modifier
      const result = await this.modifier.modify(message, processedMessage);

      // Set outputs
      this.setOutputData(0, result);
      this.setOutputData(2, true);

      // Extract processed arguments and argument string
      const { processedArguments, argumentString } = this.extractArgumentInformation(result);
      this.setOutputData(3, processedArguments);
      this.setOutputData(4, argumentString);

      // Trigger completion
      this.triggerSlot(0, null, null);

    } catch (error) {
      console.error('ArgumentProcessorModifierNode: Error processing message:', error);
      this.setOutputData(0, message); // Return original message on error
      this.setOutputData(2, false);
      this.setOutputData(3, null);
      this.setOutputData(4, null);
    }
  }

  // Extract argument processing information from the processed message
  private extractArgumentInformation(result: any): { processedArguments: any; argumentString: string | null } {
    try {
      const messages = result.messages || [];
      const processedMessage = messages[messages.length - 1]; // Get the last message

      if (processedMessage && processedMessage.content) {
        const content = processedMessage.content;

        // Check if arguments were appended
        const argumentStart = content.lastIndexOf('\n\nArguments:');
        let argumentString = null;

        if (argumentStart !== -1) {
          argumentString = content.substring(argumentStart + 12).trim();
        }

        return {
          processedArguments: {
            appendRawInvocation: this.properties.appendRawInvocation,
            argumentSeparator: this.properties.argumentSeparator,
            includeCommandName: this.properties.includeCommandName,
            formatStyle: this.properties.formatStyle,
            timestamp: new Date().toISOString(),
            customArgumentsProvided: this.getInputData(1) != null
          },
          argumentString: argumentString
        };
      }

      return {
        processedArguments: {
          appendRawInvocation: this.properties.appendRawInvocation,
          argumentSeparator: this.properties.argumentSeparator,
          includeCommandName: this.properties.includeCommandName,
          formatStyle: this.properties.formatStyle,
          timestamp: new Date().toISOString(),
          customArgumentsProvided: false,
          message: 'No arguments found in processed message'
        },
        argumentString: null
      };

    } catch (error) {
      console.error('Error extracting argument information:', error);
      return {
        processedArguments: {
          appendRawInvocation: this.properties.appendRawInvocation,
          argumentSeparator: this.properties.argumentSeparator,
          includeCommandName: this.properties.includeCommandName,
          formatStyle: this.properties.formatStyle,
          timestamp: new Date().toISOString(),
          error: 'Failed to extract argument information'
        },
        argumentString: null
      };
    }
  }
}