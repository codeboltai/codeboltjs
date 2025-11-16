import { BaseShellProcessorModifierNode } from '@agent-creator/shared-nodes';
import { ShellProcessorModifier } from '@agent-creator/message-modifiers';

// Backend Shell Processor Modifier Node - actual implementation
export class ShellProcessorModifierNode extends BaseShellProcessorModifierNode {
  private modifier: ShellProcessorModifier;

  constructor() {
    super();
    this.modifier = new ShellProcessorModifier(this.getShellProcessorConfig());
  }

  async onExecute() {
    const message = this.getInputData(0) as any;
    const customWorkingDir = this.getInputData(1) as string; // Optional custom working directory

    if (!message) {
      console.error('ShellProcessorModifierNode: No message input provided');
      this.setOutputData(1, false);
      return;
    }

    try {
      // Update modifier configuration with current node properties and custom working dir
      const config = this.getShellProcessorConfig();
      if (customWorkingDir) {
        config.workingDirectory = customWorkingDir;
      }
      this.modifier = new ShellProcessorModifier(config);

      // Create a processed message object
      const processedMessage = {
        ...message,
        messages: message.messages || []
      };

      // Apply the modifier
      const result = await this.modifier.modify(message, processedMessage);

      // Extract shell execution results and statistics
      const { shellConfig, commandResults, executionSummary } = this.extractShellResults(result);

      // Set outputs
      this.setOutputData(0, result);
      this.setOutputData(1, true);
      this.setOutputData(2, shellConfig);
      this.setOutputData(3, commandResults);
      this.setOutputData(4, executionSummary);

      // Trigger completion
      this.triggerSlot(0, null, null);

    } catch (error) {
      console.error('ShellProcessorModifierNode: Error processing shell commands:', error);
      this.setOutputData(0, message); // Return original message on error
      this.setOutputData(1, false);
      this.setOutputData(2, null);
      this.setOutputData(3, []);
      this.setOutputData(4, `Error: ${error.message}`);
    }
  }

  // Extract shell execution results from the processed message
  private extractShellResults(result: any): { shellConfig: any; commandResults: any[]; executionSummary: string } {
    try {
      const messages = result.messages || [];
      const shellMessages = messages.filter((msg: any) =>
        msg.role === 'system' && msg.content &&
        msg.content.includes('Shell Execution:')
      );

      const commandResults: any[] = [];
      let totalCommands = 0;
      let successfulCommands = 0;
      let failedCommands = 0;

      for (const msg of shellMessages) {
        // Parse shell execution message
        const content = msg.content;

        // Extract command information
        const commandMatch = content.match(/Command: (.+?)\n/);
        const statusMatch = content.match(/Status: (.+?)\n/);
        const outputMatch = content.match(/Output: (.+?)(?=\nStatus:|\nCommand:|$)/s);

        if (commandMatch && statusMatch) {
          const command = commandMatch[1].trim();
          const status = statusMatch[1].trim();
          const output = outputMatch ? outputMatch[1].trim() : '';

          totalCommands++;
          if (status === 'Success') {
            successfulCommands++;
          } else {
            failedCommands++;
          }

          commandResults.push({
            command: command,
            status: status,
            output: output,
            timestamp: new Date().toISOString()
          });
        }
      }

      const shellConfig = {
        enableShellExecution: this.properties.enableShellExecution,
        allowedCommands: this.properties.allowedCommands,
        blockedCommands: this.properties.blockedCommands,
        timeoutSeconds: this.properties.timeoutSeconds,
        workingDirectory: this.getInputData(1) || this.properties.workingDirectory,
        enableOutputCapture: this.properties.enableOutputCapture,
        maxOutputLength: this.properties.maxOutputLength,
        allowFileModification: this.properties.allowFileModification,
        timestamp: new Date().toISOString()
      };

      const executionSummary = `Executed ${totalCommands} commands: ${successfulCommands} successful, ${failedCommands} failed`;

      return {
        shellConfig: shellConfig,
        commandResults: commandResults,
        executionSummary: executionSummary
      };

    } catch (error) {
      console.error('Error extracting shell results:', error);
      return {
        shellConfig: {
          error: 'Failed to extract shell configuration',
          timestamp: new Date().toISOString()
        },
        commandResults: [],
        executionSummary: 'Error extracting execution results'
      };
    }
  }
}