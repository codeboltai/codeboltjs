import { BaseLoopDetectionModifierNode } from '@agent-creator/shared-nodes';
import { LoopDetectionModifier } from '@codebolt/agent/processor-pieces';

// Backend Loop Detection Modifier Node - actual implementation
export class LoopDetectionModifierNode extends BaseLoopDetectionModifierNode {
  private modifier: LoopDetectionModifier;

  constructor() {
    super();
    this.modifier = new LoopDetectionModifier(this.getLoopDetectionConfig());
  }

  async onExecute() {
    const message = this.getInputData(0) as any;
    const chatHistory = this.getInputData(1) as any[]; // Optional chat history

    if (!message) {
      console.error('LoopDetectionModifierNode: No message input provided');
      this.setOutputData(2, false);
      return;
    }

    try {
      // Update modifier configuration with current node properties
      this.modifier = new LoopDetectionModifier(this.getLoopDetectionConfig());

      // Create a processed message object
      let processedMessage = {
        ...message,
        messages: message.messages || []
      };

      // If chat history is provided, add it to the message for analysis
      if (chatHistory && Array.isArray(chatHistory)) {
        processedMessage.chatHistory = chatHistory;
      }

      // Apply the modifier
      const result = await this.modifier.modify(message, processedMessage, processedMessage);

      // Analyze for loops and extract results
      const { loopDetected, isLoop, similarityScore } = this.analyzeForLoops(result);

      // Set outputs
      this.setOutputData(0, result);
      this.setOutputData(2, true);
      this.setOutputData(3, loopDetected);
      this.setOutputData(4, isLoop);
      this.setOutputData(5, similarityScore);

      // Trigger completion
      this.triggerSlot(0, null, null);

    } catch (error) {
      console.error('LoopDetectionModifierNode: Error detecting loops:', error);
      this.setOutputData(0, message); // Return original message on error
      this.setOutputData(2, false);
      this.setOutputData(3, null);
      this.setOutputData(4, false);
      this.setOutputData(5, 0.0);
    }
  }

  // Analyze the processed message for loop detection results
  private analyzeForLoops(result: any): { loopDetected: any; isLoop: boolean; similarityScore: number } {
    try {
      const messages = result.messages || [];

      // Look for loop detection messages
      const loopDetectionMessage = messages.find((msg: any) =>
        msg.role === 'system' && msg.content &&
        msg.content.includes('Loop Detection:')
      );

      let isLoop = false;
      let similarityScore = 0.0;

      if (loopDetectionMessage && loopDetectionMessage.content) {
        // Parse the loop detection message
        const content = loopDetectionMessage.content;
        isLoop = content.includes('Loop detected: true');

        // Extract similarity score if present
        const scoreMatch = content.match(/similarity: ([\d.]+)/);
        if (scoreMatch) {
          similarityScore = parseFloat(scoreMatch[1]);
        }
      }

      const loopDetected = {
        isLoop: isLoop,
        similarityScore: similarityScore,
        threshold: this.properties.similarityThreshold,
        timeWindowMinutes: this.properties.timeWindowMinutes,
        maxSimilarMessages: this.properties.maxSimilarMessages,
        detectionMode: this.properties.detectionMode,
        enableAutoBreak: this.properties.enableAutoBreak,
        breakMessage: this.properties.breakMessage,
        timestamp: new Date().toISOString(),
        messagesAnalyzed: messages.length
      };

      return {
        loopDetected: loopDetected,
        isLoop: isLoop,
        similarityScore: similarityScore
      };

    } catch (error) {
      console.error('Error analyzing for loops:', error);
      return {
        loopDetected: {
          error: 'Failed to analyze for loops',
          timestamp: new Date().toISOString()
        },
        isLoop: false,
        similarityScore: 0.0
      };
    }
  }
}