import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, MessageObject } from "@codebolt/types/sdk";

export interface IdeContextOptions {
    includeOpenFiles?: boolean;
    includeActiveFile?: boolean;
    includeCursorPosition?: boolean;
    includeSelectedText?: boolean;
    maxOpenFiles?: number;
}

export interface FileInfo {
    path: string;
    isActive?: boolean;
    cursor?: {
        line: number;
        character: number;
    };
    selectedText?: string;
}

export interface IdeContext {
    workspaceState?: {
        openFiles: FileInfo[];
    };
}

export class IdeContextModifier extends BaseMessageModifier {
    private readonly options: IdeContextOptions;
    private lastSentIdeContext?: IdeContext;
    private forceFullContext: boolean = true;

    constructor(options: IdeContextOptions = {}){
        super()
        this.options = {
            includeOpenFiles: options.includeOpenFiles !== false,
            includeActiveFile: options.includeActiveFile !== false,
            includeCursorPosition: options.includeCursorPosition !== false,
            includeSelectedText: options.includeSelectedText !== false,
            maxOpenFiles: options.maxOpenFiles || 10
        };
    }

    modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        try {
            // Get IDE context from the original request (activeFile, openedFiles)
            const ideContext = this.getIdeContext(originalRequest, createdMessage.metadata);
            
            if (!ideContext) {
                return Promise.resolve(createdMessage);
            }

            const { contextParts, newIdeContext } = this.getIdeContextParts(this.forceFullContext, ideContext);
            
            if (contextParts.length === 0) {
                return Promise.resolve(createdMessage);
            }

            const ideContextMessage: MessageObject = {
                role: 'system',
                content: contextParts.join('\n')
            };

            // Find existing system message or add new one
            const messages = [...createdMessage.message.messages];
            const systemMessageIndex = messages.findIndex(msg => msg.role === 'system');
            
            if (systemMessageIndex !== -1) {
                // Append to existing system message
                const existingMessage = messages[systemMessageIndex];
                if (existingMessage) {
                    messages[systemMessageIndex] = {
                        role: existingMessage.role,
                        content: `${existingMessage.content}\n\n${ideContextMessage.content}`
                    };
                }
            } else {
                // Add new system message
                messages.unshift(ideContextMessage);
            }

            if (newIdeContext) {
                this.lastSentIdeContext = newIdeContext;
            }
            this.forceFullContext = false;

            return Promise.resolve({
                message: {
                    ...createdMessage.message,
                    messages
                },
                metadata: {
                    ...createdMessage.metadata,
                    ideContextAdded: true,
                    ideContextType: this.forceFullContext ? 'full' : 'incremental'
                }
            });
        } catch (error) {
            console.error('Error in IdeContextModifier:', error);
            return Promise.resolve(createdMessage);
        }
    }

    private getIdeContext(originalRequest: FlatUserMessage, metadata?: Record<string, unknown>): IdeContext | undefined {
        // Try to get IDE context from the metadata parameter first
        if (metadata?.['ideContext']) {
            return metadata['ideContext'] as IdeContext;
        }

        // Extract IDE context from the original message
        const activeFile = originalRequest.activeFile;
        const openedFiles = originalRequest.openedFiles;

        if (!activeFile && (!openedFiles || openedFiles.length === 0)) {
            return undefined;
        }

        const openFiles: FileInfo[] = [];

        // Add active file if present (activeFile is just a path string)
        if (activeFile) {
            const activeFileInfo: FileInfo = {
                path: activeFile,
                isActive: true
            };

            openFiles.push(activeFileInfo);
        }

        // Add other opened files (openedFiles is array of path strings)
        if (openedFiles && Array.isArray(openedFiles)) {
            const otherFiles = openedFiles
                .filter(filePath => filePath !== activeFile) // Exclude active file from others
                .map(filePath => ({
                    path: filePath,
                    isActive: false
                }));

            openFiles.push(...otherFiles);
        }

        if (openFiles.length === 0) {
            return undefined;
        }

        return {
            workspaceState: {
                openFiles
            }
        };
    }

    private getIdeContextParts(forceFullContext: boolean, currentIdeContext: IdeContext): {
        contextParts: string[];
        newIdeContext: IdeContext | undefined;
    } {
        if (!currentIdeContext?.workspaceState?.openFiles) {
            return { contextParts: [], newIdeContext: undefined };
        }

        if (forceFullContext || !this.lastSentIdeContext) {
            // Send full context as JSON
            const openFiles = currentIdeContext.workspaceState.openFiles;
            const activeFile = openFiles.find((f) => f.isActive);
            const otherOpenFiles = openFiles
                .filter((f) => !f.isActive)
                .map((f) => f.path)
                .slice(0, this.options.maxOpenFiles! - 1); // Reserve space for active file

            const contextData: Record<string, unknown> = {};

            if (activeFile && this.options.includeActiveFile) {
                const activeFileData: Record<string, unknown> = {
                    path: activeFile.path
                };

                const cursor = activeFile['cursor'];
                if (this.options.includeCursorPosition && cursor) {
                    activeFileData['cursor'] = {
                        line: cursor.line,
                        character: cursor.character,
                    };
                }

                const selectedText = activeFile['selectedText'];
                if (this.options.includeSelectedText && selectedText) {
                    activeFileData['selectedText'] = selectedText;
                }

                contextData['activeFile'] = activeFileData;
            }

            if (this.options.includeOpenFiles && otherOpenFiles.length > 0) {
                contextData['otherOpenFiles'] = otherOpenFiles;
            }

            if (Object.keys(contextData).length === 0) {
                return { contextParts: [], newIdeContext: currentIdeContext };
            }

            const jsonString = JSON.stringify(contextData, null, 2);
            const contextParts = [
                "Here is the user's editor context as a JSON object. This is for your information only.",
                '```json',
                jsonString,
                '```',
                "Don't acknowledge this context in your response unless specifically asked about it."
            ];

            return { contextParts, newIdeContext: currentIdeContext };
        }

        // For incremental updates, we would compare with lastSentIdeContext
        // and only send changes. For now, we'll skip incremental updates.
        return { contextParts: [], newIdeContext: currentIdeContext };
    }

    public setForceFullContext(force: boolean): void {
        this.forceFullContext = force;
    }
}
