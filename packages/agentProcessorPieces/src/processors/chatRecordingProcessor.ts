import { BaseProcessor, ProcessorInput, ProcessorOutput } from '@codebolt/agentprocessorframework';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ChatRecordingProcessorOptions {
    enableTokenTracking?: boolean;
    exportFormat?: 'json' | 'txt' | 'csv';
    outputDirectory?: string;
    maxFileSize?: number; // in bytes
    enableCompression?: boolean;
    includeMetadata?: boolean;
    autoExport?: boolean;
    exportInterval?: number; // in messages
}

export interface TokensSummary {
    input: number;
    output: number;
    cached: number;
    thoughts?: number;
    tool?: number;
    total: number;
}

export interface MessageRecord {
    id: string;
    timestamp: string;
    role: string;
    content: string;
    metadata?: Record<string, any>;
    tokens?: TokensSummary;
    toolCalls?: ToolCallRecord[];
}

export interface ToolCallRecord {
    id: string;
    name: string;
    args: Record<string, unknown>;
    result?: any;
    status: 'pending' | 'success' | 'error' | 'cancelled';
    timestamp: string;
    executionTime?: number;
}

export interface ConversationSession {
    sessionId: string;
    startTime: string;
    endTime?: string;
    messages: MessageRecord[];
    totalTokens: TokensSummary;
    toolCallCount: number;
    metadata: Record<string, any>;
}

export class ChatRecordingProcessor extends BaseProcessor {
    private readonly enableTokenTracking: boolean;
    private readonly exportFormat: 'json' | 'txt' | 'csv';
    private readonly outputDirectory: string;
    private readonly maxFileSize: number;
    private readonly enableCompression: boolean;
    private readonly includeMetadata: boolean;
    private readonly autoExport: boolean;
    private readonly exportInterval: number;

    // Session tracking
    private currentSession: ConversationSession | null = null;
    private messageCount = 0;
    private sessions: ConversationSession[] = [];

    constructor(options: ChatRecordingProcessorOptions = {}) {
        super();
        this.enableTokenTracking = options.enableTokenTracking !== false;
        this.exportFormat = options.exportFormat || 'json';
        this.outputDirectory = options.outputDirectory || './chat-recordings';
        this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
        this.enableCompression = options.enableCompression || false;
        this.includeMetadata = options.includeMetadata !== false;
        this.autoExport = options.autoExport || false;
        this.exportInterval = options.exportInterval || 50;
    }

    async processInput(input: ProcessorInput): Promise<ProcessorOutput[]> {
        const { message, context } = input;
        
        try {
            // Initialize session if not exists
            if (!this.currentSession) {
                this.initializeSession(context);
            }

            // Record the message
            const messageRecord = this.createMessageRecord(message, context);
            this.currentSession!.messages.push(messageRecord);
            this.messageCount++;

            // Update session totals
            this.updateSessionTotals(messageRecord);

            const results: ProcessorOutput[] = [
                this.createEvent('MessageRecorded', {
                    messageId: messageRecord.id,
                    sessionId: this.currentSession!.sessionId,
                    messageCount: this.messageCount
                })
            ];

            // Auto-export if enabled and interval reached
            if (this.autoExport && this.messageCount % this.exportInterval === 0) {
                try {
                    const exportPath = await this.exportSession(this.currentSession!);
                    results.push(this.createEvent('SessionExported', {
                        sessionId: this.currentSession!.sessionId,
                        exportPath,
                        messageCount: this.currentSession!.messages.length
                    }));
                } catch (exportError) {
                    results.push(this.createEvent('ExportError', {
                        error: exportError instanceof Error ? exportError.message : String(exportError),
                        sessionId: this.currentSession!.sessionId
                    }));
                }
            }

            return results;

        } catch (error) {
            console.error('[ChatRecording] Error recording message:', error);
            const messageStr = String(message);
            return [this.createEvent('RecordingError', {
                error: error instanceof Error ? error.message : String(error),
                messageContent: messageStr.slice(0, 100)
            })];
        }
    }

    private initializeSession(context?: Record<string, any>): void {
        const sessionId = this.generateSessionId();
        this.currentSession = {
            sessionId,
            startTime: new Date().toISOString(),
            messages: [],
            totalTokens: {
                input: 0,
                output: 0,
                cached: 0,
                total: 0
            },
            toolCallCount: 0,
            metadata: {
                llmConfig: context?.llmconfig || {},
                userAgent: 'codebolt-agent',
                version: '1.0.0',
                ...context?.sessionMetadata
            }
        };
    }

    private createMessageRecord(message: any, context?: Record<string, any>): MessageRecord {
        const id = this.generateMessageId();
        const timestamp = new Date().toISOString();

        // Extract basic message info
        let role = 'unknown';
        let content = '';
        let toolCalls: ToolCallRecord[] = [];

        if (message.messages && Array.isArray(message.messages) && message.messages.length > 0) {
            const lastMessage = message.messages[message.messages.length - 1];
            role = lastMessage.role || 'unknown';
            content = this.extractContent(lastMessage.content);
            
            if (lastMessage.tool_calls) {
                toolCalls = this.extractToolCalls(lastMessage.tool_calls);
            }
        } else if (typeof message === 'string') {
            role = 'user';
            content = message;
        } else {
            content = JSON.stringify(message);
        }

        // Calculate tokens if enabled
        let tokens: TokensSummary | undefined;
        if (this.enableTokenTracking) {
            tokens = this.estimateTokens(content);
        }

        return {
            id,
            timestamp,
            role,
            content: content.slice(0, 10000), // Limit content length for storage
            metadata: this.includeMetadata ? {
                originalMessageLength: content.length,
                hasToolCalls: toolCalls.length > 0,
                contextKeys: context ? Object.keys(context) : [],
                ...message.metadata
            } : undefined,
            tokens,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined
        };
    }

    private extractContent(content: any): string {
        if (typeof content === 'string') {
            return content;
        }
        if (Array.isArray(content)) {
            return content
                .map(part => {
                    if (typeof part === 'string') return part;
                    if (part?.text) return part.text;
                    if (part?.type === 'text') return part.text || '';
                    return JSON.stringify(part);
                })
                .join(' ');
        }
        return JSON.stringify(content);
    }

    private extractToolCalls(toolCalls: any[]): ToolCallRecord[] {
        return toolCalls.map(tc => ({
            id: tc.id || this.generateToolCallId(),
            name: tc.function?.name || 'unknown',
            args: typeof tc.function?.arguments === 'string' 
                ? JSON.parse(tc.function.arguments)
                : tc.function?.arguments || {},
            status: 'pending' as const,
            timestamp: new Date().toISOString()
        }));
    }

    private estimateTokens(content: string): TokensSummary {
        // Simple token estimation
        const charCount = content.length;
        const estimated = Math.ceil(charCount / 4);
        
        return {
            input: estimated,
            output: 0,
            cached: 0,
            total: estimated
        };
    }

    private updateSessionTotals(messageRecord: MessageRecord): void {
        if (!this.currentSession || !messageRecord.tokens) return;

        this.currentSession.totalTokens.input += messageRecord.tokens.input;
        this.currentSession.totalTokens.output += messageRecord.tokens.output;
        this.currentSession.totalTokens.cached += messageRecord.tokens.cached;
        this.currentSession.totalTokens.total += messageRecord.tokens.total;

        if (messageRecord.toolCalls) {
            this.currentSession.toolCallCount += messageRecord.toolCalls.length;
        }
    }

    private generateSessionId(): string {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateMessageId(): string {
        return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateToolCallId(): string {
        return `tool-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    }

    async exportSession(session: ConversationSession): Promise<string> {
        // Ensure output directory exists
        await this.ensureDirectoryExists();

        const filename = `chat-session-${session.sessionId}-${Date.now()}.${this.exportFormat}`;
        const filepath = path.join(this.outputDirectory, filename);

        // Update end time
        session.endTime = new Date().toISOString();

        let content: string;
        switch (this.exportFormat) {
            case 'json':
                content = JSON.stringify(session, null, 2);
                break;
            case 'txt':
                content = this.formatAsText(session);
                break;
            case 'csv':
                content = this.formatAsCSV(session);
                break;
            default:
                content = JSON.stringify(session, null, 2);
        }

        await fs.writeFile(filepath, content, 'utf-8');
        return filepath;
    }

    private async ensureDirectoryExists(): Promise<void> {
        try {
            await fs.access(this.outputDirectory);
        } catch {
            await fs.mkdir(this.outputDirectory, { recursive: true });
        }
    }

    private formatAsText(session: ConversationSession): string {
        const lines = [];
        lines.push(`Chat Session: ${session.sessionId}`);
        lines.push(`Start Time: ${session.startTime}`);
        lines.push(`End Time: ${session.endTime || 'Ongoing'}`);
        lines.push(`Total Messages: ${session.messages.length}`);
        lines.push(`Total Tokens: ${session.totalTokens.total}`);
        lines.push(`Tool Calls: ${session.toolCallCount}`);
        lines.push('---');
        
        for (const message of session.messages) {
            lines.push(`[${message.timestamp}] ${message.role.toUpperCase()}: ${message.content}`);
            if (message.toolCalls) {
                for (const tool of message.toolCalls) {
                    lines.push(`  🔧 ${tool.name}(${JSON.stringify(tool.args)})`);
                }
            }
            lines.push('');
        }
        
        return lines.join('\n');
    }

    private formatAsCSV(session: ConversationSession): string {
        const headers = ['timestamp', 'role', 'content', 'tokens', 'tool_calls'];
        const rows = [headers.join(',')];
        
        for (const message of session.messages) {
            const row = [
                message.timestamp,
                message.role,
                `"${message.content.replace(/"/g, '""')}"`, // Escape quotes
                message.tokens?.total || 0,
                message.toolCalls?.length || 0
            ];
            rows.push(row.join(','));
        }
        
        return rows.join('\n');
    }

    // Public methods for session management
    async finalizeSession(): Promise<string | null> {
        if (!this.currentSession) return null;

        try {
            const exportPath = await this.exportSession(this.currentSession);
            this.sessions.push(this.currentSession);
            this.currentSession = null;
            this.messageCount = 0;
            return exportPath;
        } catch (error) {
            console.error('[ChatRecording] Error finalizing session:', error);
            return null;
        }
    }

    getCurrentSession(): ConversationSession | null {
        return this.currentSession;
    }

    getSessionStats(): {
        currentSessionMessages: number;
        totalSessions: number;
        totalMessages: number;
    } {
        const totalMessages = this.sessions.reduce((sum, session) => sum + session.messages.length, 0) + 
                            (this.currentSession?.messages.length || 0);
        
        return {
            currentSessionMessages: this.currentSession?.messages.length || 0,
            totalSessions: this.sessions.length + (this.currentSession ? 1 : 0),
            totalMessages
        };
    }
}
