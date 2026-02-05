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

    constructor(options: IdeContextOptions = {}) {
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

        // Calculate and send delta as JSON
        const delta: Record<string, unknown> = {};
        const changes: Record<string, unknown> = {};

        const lastFiles = new Map(
            (this.lastSentIdeContext!.workspaceState?.openFiles || []).map(
                (f: FileInfo) => [f.path, f],
            ),
        );
        const currentFiles = new Map(
            (currentIdeContext.workspaceState?.openFiles || []).map((f: FileInfo) => [
                f.path,
                f,
            ]),
        );

        const openedFiles: string[] = [];
        for (const [path] of currentFiles.entries()) {
            if (!lastFiles.has(path)) {
                openedFiles.push(path);
            }
        }
        if (openedFiles.length > 0) {
            changes['filesOpened'] = openedFiles;
        }

        const closedFiles: string[] = [];
        for (const [path] of lastFiles.entries()) {
            if (!currentFiles.has(path)) {
                closedFiles.push(path);
            }
        }
        if (closedFiles.length > 0) {
            changes['filesClosed'] = closedFiles;
        }

        const lastActiveFile = (
            this.lastSentIdeContext!.workspaceState?.openFiles || []
        ).find((f: FileInfo) => f.isActive);
        const currentActiveFile = (
            currentIdeContext.workspaceState?.openFiles || []
        ).find((f: FileInfo) => f.isActive);

        if (currentActiveFile) {
            if (!lastActiveFile || lastActiveFile.path !== currentActiveFile.path) {
                const activeFileChange: Record<string, unknown> = {
                    path: currentActiveFile.path
                };
                if (this.options.includeCursorPosition && currentActiveFile.cursor) {
                    activeFileChange['cursor'] = {
                        line: currentActiveFile.cursor.line,
                        character: currentActiveFile.cursor.character,
                    };
                }
                if (this.options.includeSelectedText && currentActiveFile.selectedText) {
                    activeFileChange['selectedText'] = currentActiveFile.selectedText;
                }
                changes['activeFileChanged'] = activeFileChange;

            } else {
                const lastCursor = lastActiveFile.cursor;
                const currentCursor = currentActiveFile.cursor;
                if (
                    this.options.includeCursorPosition &&
                    currentCursor &&
                    (!lastCursor ||
                        lastCursor.line !== currentCursor.line ||
                        lastCursor.character !== currentCursor.character)
                ) {
                    changes['cursorMoved'] = {
                        path: currentActiveFile.path,
                        cursor: {
                            line: currentCursor.line,
                            character: currentCursor.character,
                        },
                    };
                }

                const lastSelectedText = lastActiveFile.selectedText || '';
                const currentSelectedText = currentActiveFile.selectedText || '';
                if (
                    this.options.includeSelectedText &&
                    lastSelectedText !== currentSelectedText
                ) {
                    changes['selectionChanged'] = {
                        path: currentActiveFile.path,
                        selectedText: currentSelectedText,
                    };
                }
            }
        } else if (lastActiveFile) {
            changes['activeFileChanged'] = {
                path: null,
                previousPath: lastActiveFile.path,
            };
        }

        if (Object.keys(changes).length === 0) {
            return { contextParts: [], newIdeContext: currentIdeContext };
        }

        delta['changes'] = changes;
        const jsonString = JSON.stringify(delta, null, 2);
        const contextParts = [
            "Here is a summary of changes in the user's editor context, in JSON format. This is for your information only.",
            '```json',
            jsonString,
            '```',
            "Don't acknowledge this context in your response unless specifically asked about it."
        ];

        return {
            contextParts,
            newIdeContext: currentIdeContext,
        };
    }

    public setForceFullContext(force: boolean): void {
        this.forceFullContext = force;
    }
}
