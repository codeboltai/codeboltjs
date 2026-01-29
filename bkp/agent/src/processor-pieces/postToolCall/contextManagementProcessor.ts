import { BaseProcessor, ProcessorInput, ProcessorOutput, ProcessedMessage, Message } from '../../processor';
import codebolt from '@codebolt/codeboltjs';

export interface ContextInfo {
    projectContext?: string;
    ideContext?: any;
    directoryContext?: string;
    contextAdded: boolean;
}

export interface ContextManagementProcessorOptions {
    enableProjectContext?: boolean;
    enableIdeContext?: boolean;
    enableDirectoryContext?: boolean;
    forceFullContext?: boolean;
    contextThreshold?: number;
}

export class ContextManagementProcessor extends BaseProcessor {
    private readonly enableProjectContext: boolean;
    private readonly enableIdeContext: boolean;
    private readonly enableDirectoryContext: boolean;
    private readonly forceFullContext: boolean;
    private readonly contextThreshold: number;
    private lastSentIdeContext: any = undefined;
    private contextAddedToHistory = false;

    constructor(options: ContextManagementProcessorOptions = {}) {
        super(options);
        this.enableProjectContext = options.enableProjectContext !== false;
        this.enableIdeContext = options.enableIdeContext !== false;
        this.enableDirectoryContext = options.enableDirectoryContext !== false;
        this.forceFullContext = options.forceFullContext || false;
        this.contextThreshold = options.contextThreshold || 100;
    }

    async processInput(input: ProcessorInput): Promise<ProcessorOutput[]> {
        try {
            const { message, context } = input;
            
            // Check if context should be added
            if (this.contextAddedToHistory && !this.forceFullContext) {
                return [this.createEvent('ContextAlreadyAdded', {
                    reason: 'Context has already been added to this session'
                })];
            }

            // Collect context information using CodeBolt
            const contextInfo = await this.collectContext();
            
            if (!contextInfo.contextAdded) {
                return [this.createEvent('NoContextAvailable', {
                    reason: 'No relevant context found for this session'
                })];
            }

            // Add context to the message
            const messageWithContext = await this.addContextToMessage(message, contextInfo);
            
            // Mark context as added
            this.contextAddedToHistory = true;

            return [
                this.createEvent('ContextAdded', contextInfo),
                this.createEvent('MessageWithContext', messageWithContext)
            ];

        } catch (error) {
            console.error('Error in ContextManagementProcessor:', error);
            return [this.createEvent('ContextError', {
                error: error instanceof Error ? error.message : String(error)
            })];
        }
    }

    private async collectContext(): Promise<ContextInfo> {
        const contextInfo: ContextInfo = {
            contextAdded: false
        };

        try {
            // Collect project context if enabled
            if (this.enableProjectContext) {
                contextInfo.projectContext = await this.getProjectContext();
            }

            // Collect IDE context if enabled
            if (this.enableIdeContext) {
                contextInfo.ideContext = await this.getIdeContext();
            }

            // Collect directory context if enabled
            if (this.enableDirectoryContext) {
                contextInfo.directoryContext = await this.getDirectoryContext();
            }

            // Check if we have any meaningful context
            contextInfo.contextAdded = !!(contextInfo.projectContext || contextInfo.ideContext || contextInfo.directoryContext);

        } catch (error) {
            console.warn('Failed to collect context:', error);
        }

        return contextInfo;
    }

    private async getProjectContext(): Promise<string | undefined> {
        try {
            // Get current working directory and project info
            const cwd = process.cwd();
            const projectName = cwd.split(/[\\/]/).pop() || 'unknown-project';
            
            // Try to get additional project info from CodeBolt if available
            let additionalInfo = '';
            try {
                const projectPath = await codebolt.project.getProjectPath();
                if (projectPath.success && projectPath.data) {
                    additionalInfo = `\nProject Path: ${projectPath.data}`;
                }
            } catch (error) {
                // Project info is optional
            }
            
            return `Project: ${projectName}\nWorking Directory: ${cwd}${additionalInfo}`;
        } catch (error) {
            console.warn('Failed to get project context:', error);
            return undefined;
        }
    }

    private async getIdeContext(): Promise<any | undefined> {
        try {
            // This would normally integrate with CodeBolt's IDE context detection
            // For now, simulate basic IDE context
            const ideContext = {
                ideType: this.detectIdeType(),
                openFiles: await this.getOpenFiles(),
                activeFile: await this.getActiveFile()
            };

            // Update last sent IDE context
            this.lastSentIdeContext = ideContext;
            
            return ideContext;
        } catch (error) {
            console.warn('Failed to get IDE context:', error);
            return undefined;
        }
    }

    private async getDirectoryContext(): Promise<string | undefined> {
        try {
            // Get directory structure using CodeBolt's file system capabilities
            const cwd = process.cwd();
            
            // Try to get directory listing from CodeBolt
            let directoryContents = '';
            try {
                const listResult = await codebolt.fs.listFile(cwd);
                if (listResult.success && listResult.data) {
                    const items = listResult.data.filter((item: any) => !item.name.startsWith('.'));
                    directoryContents = items.slice(0, 10).map((item: any) => item.name).join(', ');
                    if (items.length > 10) {
                        directoryContents += '...';
                    }
                }
            } catch (error) {
                // Fallback to basic directory listing
                const fs = await import('fs/promises');
                const items = await fs.readdir(cwd);
                const files = items.filter(item => !item.startsWith('.'));
                directoryContents = files.slice(0, 10).join(', ') + (files.length > 10 ? '...' : '');
            }
            
            return `Directory: ${cwd}\nContents: ${directoryContents}`;
        } catch (error) {
            console.warn('Failed to get directory context:', error);
            return undefined;
        }
    }

    private detectIdeType(): string {
        // Detect IDE type from environment variables
        if (process.env.VSCODE_PID || process.env.VSCODE_IPC_HOOK) {
            return 'vscode';
        }
        if (process.env.CURSOR_PID || process.env.CURSOR_SESSION_ID) {
            return 'cursor';
        }
        return 'unknown';
    }

    private async getOpenFiles(): Promise<any[]> {
        try {
            // This would normally get actual open files from IDE
            // For now, simulate with recent files in current directory
            const cwd = process.cwd();
            
            // Try to get recent files from CodeBolt
            let files: any[] = [];
            try {
                // CodeBolt doesn't have findRecentFiles, so we'll use listFile as fallback
                const listResult = await codebolt.fs.listFile(cwd);
                if (listResult.success && listResult.data) {
                    const fileItems = listResult.data.filter((item: any) => !item.name.startsWith('.') && item.includes('.'));
                    files = fileItems.slice(0, 5).map((file: any, index: number) => ({
                        path: file.name,
                        isActive: index === 0,
                        timestamp: Date.now()
                    }));
                }
            } catch (error) {
                // Fallback to basic file listing
                const fs = await import('fs/promises');
                const items = await fs.readdir(cwd);
                const fileItems = items.filter(item => !item.startsWith('.') && item.includes('.'));
                files = fileItems.slice(0, 5).map((file, index) => ({
                    path: file,
                    isActive: index === 0,
                    timestamp: Date.now()
                }));
            }
            
            return files;
        } catch (error) {
            return [];
        }
    }

    private async getActiveFile(): Promise<any | undefined> {
        try {
            const openFiles = await this.getOpenFiles();
            return openFiles.find(f => f.isActive);
        } catch (error) {
            return undefined;
        }
    }

    private async addContextToMessage(message: ProcessedMessage, contextInfo: ContextInfo): Promise<ProcessedMessage> {
        const contextMessages: Message[] = [];
        
        // Add project context
        if (contextInfo.projectContext) {
            contextMessages.push({
                role: 'system',
                content: `Project Context:\n${contextInfo.projectContext}`,
                name: 'project-context'
            });
        }

        // Add IDE context
        if (contextInfo.ideContext) {
            contextMessages.push({
                role: 'system',
                content: `IDE Context:\n\`\`\`json\n${JSON.stringify(contextInfo.ideContext, null, 2)}\n\`\`\``,
                name: 'ide-context'
            });
        }

        // Add directory context
        if (contextInfo.directoryContext) {
            contextMessages.push({
                role: 'system',
                content: `Directory Context:\n${contextInfo.directoryContext}`,
                name: 'directory-context'
            });
        }

        // Add acknowledgment message
        if (contextMessages.length > 0) {
            contextMessages.push({
                role: 'assistant',
                content: 'Got it. Thanks for the context!',
                name: 'context-acknowledgment'
            });
        }

        return {
            messages: [...contextMessages, ...message.messages],
            metadata: {
                ...message.metadata,
                contextAdded: true,
                contextInfo
            }
        };
    }

    // Public methods for external control
    resetContext(): void {
        this.contextAddedToHistory = false;
        this.lastSentIdeContext = undefined;
        this.clearContext();
    }

    forceContextRefresh(): void {
        (this as any).forceFullContext = true;
        this.contextAddedToHistory = false;
    }

    setContextThreshold(threshold: number): void {
        (this as any).contextThreshold = Math.max(1, threshold);
    }

    enableProjectContextForSession(): void {
        (this as any).enableProjectContext = true;
    }

    disableProjectContextForSession(): void {
        (this as any).enableProjectContext = false;
    }

    enableIdeContextForSession(): void {
        (this as any).enableIdeContext = true;
    }

    disableIdeContextForSession(): void {
        (this as any).enableIdeContext = false;
    }
}
