import { BaseProcessor, ProcessorInput, ProcessorOutput } from '../../processor';
import codebolt from '@codebolt/codeboltjs';

export interface LoopDetectionInfo {
    promptId: string;
    loopCount: number;
    maxLoops: number;
    recentMessages: any[];
    isLoop: boolean;
}

export interface LoopDetectionProcessorOptions {
    maxLoops?: number;
    messageThreshold?: number;
    enableLoopDetection?: boolean;
}

export class LoopDetectionProcessor extends BaseProcessor {
    private readonly maxLoops: number;
    private readonly messageThreshold: number;
    private readonly enableLoopDetection: boolean;
    private lastPromptId: string | null = null;
    private loopCount: number = 0;

    constructor(options: LoopDetectionProcessorOptions = {}) {
        super(options);
        this.maxLoops = options.maxLoops || 3;
        this.messageThreshold = options.messageThreshold || 6;
        this.enableLoopDetection = options.enableLoopDetection !== false;
    }

    async processInput(input: ProcessorInput): Promise<ProcessorOutput[]> {
        try {
            const { message, context } = input;
            
            if (!this.enableLoopDetection) {
                return [this.createEvent('LoopDetectionDisabled', {
                    reason: 'Loop detection is disabled for this session'
                })];
            }

            // Get prompt ID from context or generate one
            const promptId = context?.promptId || this.generatePromptId();
            
            // Reset loop detector if new prompt
            if (this.lastPromptId !== promptId) {
                await this.resetLoopDetector(promptId);
                this.lastPromptId = promptId;
            } else {
                this.loopCount++;
            }

            // Check for conversation loops using CodeBolt state
            const loopDetected = await this.checkLoopDetection();
            
            if (loopDetected) {
                // Send notification about loop detection
                await codebolt.chat.sendNotificationEvent('Loop detected in conversation', 'debug');
                
                return [this.createEvent('LoopDetected', {
                    promptId,
                    loopCount: this.loopCount,
                    maxLoops: this.maxLoops
                })];
            }

            // Check if max loops reached
            if (this.loopCount > this.maxLoops) {
                return [this.createEvent('MaxLoopsReached', {
                    promptId,
                    loopCount: this.loopCount,
                    maxLoops: this.maxLoops
                })];
            }

            // Continue processing
            return [this.createEvent('LoopDetectionPassed', {
                promptId,
                loopCount: this.loopCount,
                maxLoops: this.maxLoops
            })];

        } catch (error) {
            console.error('Error in LoopDetectionProcessor:', error);
            return [this.createEvent('LoopDetectionError', {
                error: error instanceof Error ? error.message : String(error)
            })];
        }
    }

    private generatePromptId(): string {
        return `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private async resetLoopDetector(promptId: string): Promise<void> {
        this.loopCount = 0;
        this.setContext('currentPromptId', promptId);
        this.setContext('loopDetectorReset', Date.now().toString());
        
        // Update CodeBolt agent state
        try {
            await codebolt.cbstate.addToAgentState('lastPromptId', promptId);
            await codebolt.cbstate.addToAgentState('loopDetectorReset', Date.now().toString());
        } catch (error) {
            console.warn('Failed to update CodeBolt agent state:', error);
        }
    }

    private async checkLoopDetection(): Promise<boolean> {
        try {
            // Get recent messages from CodeBolt state
            const agentState = await codebolt.cbstate.getAgentState();
            const recentMessages = agentState.data?.recentMessages || [];
            
            // Simple loop detection: check for repeated patterns
            if (recentMessages.length >= this.messageThreshold) {
                const lastThree = recentMessages.slice(-3);
                const previousThree = recentMessages.slice(-6, -3);
                
                if (lastThree.length === 3 && previousThree.length === 3) {
                    const isLoop = JSON.stringify(lastThree) === JSON.stringify(previousThree);
                    if (isLoop) {
                        console.log('[Loop Detection] Loop detected in conversation');
                        return true;
                    }
                }
            }
            
            return false;
        } catch (error) {
            console.warn('Failed to check loop detection:', error);
            return false;
        }
    }

    // Public methods for external control
    resetSession(): void {
        this.loopCount = 0;
        this.lastPromptId = null;
        this.clearContext();
        
        // Clear CodeBolt agent state
        try {
            codebolt.cbstate.addToAgentState('sessionTurnCount', '0');
            codebolt.cbstate.addToAgentState('lastPromptId', '');
        } catch (error) {
            console.warn('Failed to clear CodeBolt agent state:', error);
        }
    }

    getCurrentLoopCount(): number {
        return this.loopCount;
    }

    setMaxLoops(maxLoops: number): void {
        (this as any).maxLoops = Math.max(1, maxLoops);
    }

    enableLoopDetectionForSession(): void {
        (this as any).enableLoopDetection = true;
    }

    disableLoopDetectionForSession(): void {
        (this as any).enableLoopDetection = false;
    }
}
