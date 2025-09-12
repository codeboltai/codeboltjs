import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, MessageObject } from "@codebolt/types/sdk";
import * as fs from 'fs';
import * as path from 'path';

export interface ChatRecordingOptions {
    enableRecording?: boolean;
    recordingPath?: string;
    maxRecordingSize?: number;
    includeMetadata?: boolean;
    recordingFormat?: 'json' | 'markdown';
}

interface ChatRecord {
    timestamp: string;
    messageId?: string;
    threadId?: string;
    role: string;
    content: string;
    metadata?: any;
}

export class ChatRecordingModifier extends BaseMessageModifier {
    private readonly options: ChatRecordingOptions;
    private recordingFile?: string;

    constructor(options: ChatRecordingOptions = {}){
        super()
        this.options = {
            enableRecording: options.enableRecording || false,
            recordingPath: options.recordingPath || path.join(process.cwd(), '.chat-recordings'),
            maxRecordingSize: options.maxRecordingSize || 10 * 1024 * 1024, // 10MB
            includeMetadata: options.includeMetadata !== false,
            recordingFormat: options.recordingFormat || 'json'
        };

        if (this.options.enableRecording) {
            this.initializeRecording();
        }
    }

    async modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        try {
            if (!this.options.enableRecording || !this.recordingFile) {
                return createdMessage;
            }

            // Record the conversation
            await this.recordMessages(createdMessage, originalRequest);

            return Promise.resolve({
                ...createdMessage,
                metadata: {
                    ...createdMessage.metadata,
                    chatRecorded: true,
                    recordingFile: this.recordingFile
                }
            });
        } catch (error) {
            console.error('Error in ChatRecordingModifier:', error);
            return createdMessage;
        }
    }

    private initializeRecording(): void {
        try {
            // Ensure recording directory exists
            if (!fs.existsSync(this.options.recordingPath!)) {
                fs.mkdirSync(this.options.recordingPath!, { recursive: true });
            }

            // Create recording file with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const extension = this.options.recordingFormat === 'markdown' ? 'md' : 'jsonl';
            this.recordingFile = path.join(this.options.recordingPath!, `chat-${timestamp}.${extension}`);

            // Initialize file with header
            if (this.options.recordingFormat === 'markdown') {
                fs.writeFileSync(this.recordingFile, `# Chat Recording\n\nStarted: ${new Date().toISOString()}\n\n---\n\n`);
            }
        } catch (error) {
            console.error('Failed to initialize chat recording:', error);
            this.recordingFile = undefined;
        }
    }

    private async recordMessages(createdMessage: ProcessedMessage, originalRequest: FlatUserMessage): Promise<void> {
        if (!this.recordingFile) return;

        try {
            // Check file size before writing
            if (fs.existsSync(this.recordingFile)) {
                const stats = fs.statSync(this.recordingFile);
                if (stats.size > this.options.maxRecordingSize!) {
                    console.warn(`Chat recording file ${this.recordingFile} exceeds maximum size. Stopping recording.`);
                    return;
                }
            }

            const timestamp = new Date().toISOString();
            
            // Record each message
            for (const message of createdMessage.message.messages) {
                const record: ChatRecord = {
                    timestamp,
                    messageId: createdMessage.metadata?.messageId as string | undefined,
                    threadId: createdMessage.metadata?.threadId as string | undefined,
                    role: message.role,
                    content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content)
                };

                if (this.options.includeMetadata) {
                    record.metadata = {
                        originalRequest: {
                            userMessage: originalRequest.userMessage,
                            messageId: originalRequest.messageId,
                            threadId: originalRequest.threadId
                        },
                        processedMetadata: createdMessage.metadata
                    };
                }

                await this.writeRecord(record);
            }
        } catch (error) {
            console.error('Error recording chat messages:', error);
        }
    }

    private async writeRecord(record: ChatRecord): Promise<void> {
        if (!this.recordingFile) return;

        try {
            if (this.options.recordingFormat === 'markdown') {
                const content = `## ${record.role.toUpperCase()} - ${record.timestamp}\n\n${record.content}\n\n---\n\n`;
                fs.appendFileSync(this.recordingFile, content);
            } else {
                const jsonLine = JSON.stringify(record) + '\n';
                fs.appendFileSync(this.recordingFile, jsonLine);
            }
        } catch (error) {
            console.error('Error writing chat record:', error);
        }
    }

    public startRecording(customPath?: string): void {
        this.options.enableRecording = true;
        if (customPath) {
            this.options.recordingPath = customPath;
        }
        this.initializeRecording();
    }

    public stopRecording(): void {
        this.options.enableRecording = false;
        if (this.recordingFile && this.options.recordingFormat === 'markdown') {
            fs.appendFileSync(this.recordingFile, `\n---\n\nRecording ended: ${new Date().toISOString()}\n`);
        }
        this.recordingFile = undefined;
    }

    public getRecordingFile(): string | undefined {
        return this.recordingFile;
    }

    public isRecording(): boolean {
        return (this.options.enableRecording || false) && !!this.recordingFile;
    }
}
