import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, MessageObject } from "@codebolt/types/sdk";
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import codebolt from '@codebolt/codeboltjs';

interface FileReadResult {
  path: string;
  content: string;
  error?: string;
}

/**
 * Message modifier that reads files and folders mentioned in the user message
 * Uses mentionedFiles and mentionedFolders from FlatUserMessage
 */
export class MentionedFilesModifier extends BaseMessageModifier {
    constructor() {
        super();
    }

    async modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        try {
            const mentionedFiles = originalRequest.mentionedFiles || [];
            const mentionedFolders = originalRequest.mentionedFolders || [];
            const allMentionedPaths = [...mentionedFiles, ...mentionedFolders];

            if (allMentionedPaths.length === 0) {
                return createdMessage;
            }

            // Read all mentioned files and folders
            const fileResults: FileReadResult[] = [];

            for (const mentionedPath of allMentionedPaths) {
                try {
                    const result = await this.resolveAndReadFile(mentionedPath);
                    if (result) {
                        fileResults.push(result);
                    }
                } catch (error) {
                    fileResults.push({
                        path: mentionedPath,
                        content: '',
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }

            if (fileResults.length === 0) {
                return createdMessage;
            }

            // Add file content to the user message
            const fileContentText = this.formatFileContent(fileResults);
            const updatedMessages = this.updateUserMessage(
                createdMessage.message.messages || [],
                fileContentText
            );

            return {
                message: {
                    ...createdMessage.message,
                    messages: updatedMessages
                },
                metadata: {
                    ...createdMessage.metadata,
                    mentionedFilesAdded: true,
                    resolvedFiles: fileResults.map(f => f.path)
                }
            };

        } catch (error) {
            console.error('Error in MentionedFilesModifier:', error);
            return createdMessage;
        }
    }

    /**
     * Resolves and reads a file, handling both files and directories
     */
    private async resolveAndReadFile(pathName: string): Promise<FileReadResult | null> {
        try {
            // pathName is already a full absolute path
            const absolutePath = pathName;
            
            // Get project path for security check and relative path display
            let projectPath: string;
            try {
                const { projectPath: path } = await codebolt.project.getProjectPath();
                projectPath = path || process.cwd();
            } catch (error) {
                projectPath = process.cwd();
            }
            
            // Check if path is within project (basic security check)
            const relativePath = path.relative(projectPath, absolutePath);
            if (relativePath.startsWith('..')) {
                throw new Error(`Path ${pathName} is outside project directory`);
            }

            const stats = await fs.stat(absolutePath);
            
            if (stats.isDirectory()) {
                // For directories, list contents
                const files = await fs.readdir(absolutePath);
                const fileList = files.join('\n');
                return {
                    path: relativePath || path.basename(pathName),
                    content: `Directory contents:\n${fileList}`
                };
            } else if (stats.isFile()) {
                // Check file size (limit to reasonable size)
                const maxFileSize = 1024 * 1024; // 1MB
                if (stats.size > maxFileSize) {
                    return {
                        path: relativePath || path.basename(pathName),
                        content: `File too large (${stats.size} bytes). Maximum allowed: ${maxFileSize} bytes.`
                    };
                }

                // Read file content
                const content = await fs.readFile(absolutePath, 'utf-8');
                return {
                    path: relativePath || path.basename(pathName),
                    content
                };
            }
        } catch (error) {
            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
                // File not found
                return {
                    path: pathName,
                    content: '',
                    error: `File not found: ${pathName}`
                };
            }
            throw error;
        }

        return null;
    }

    /**
     * Formats file content for inclusion in the message
     */
    private formatFileContent(fileResults: FileReadResult[]): string {
        const contentParts: string[] = [];
        contentParts.push('\n--- Content from mentioned files ---');
        for (const result of fileResults) {
            if (result.error) {
                contentParts.push(`\nError reading ${result.path}: ${result.error}`);
            } else {
                contentParts.push(`\nContent from ${result.path}:`);
                contentParts.push(result.content);
            }
        }
        return contentParts.join('\n');
    }

    /**
     * Updates the user message with file content
     */
    private updateUserMessage(messages: MessageObject[], fileContent: string): MessageObject[] {
        const updatedMessages = [...messages];
        
        // Find the last user message and append file content
        for (let i = updatedMessages.length - 1; i >= 0; i--) {
            if (updatedMessages[i].role === 'user') {
                const currentContent = updatedMessages[i].content;
                
                if (Array.isArray(currentContent)) {
                    // If content is array, add file content as new text element
                    updatedMessages[i] = {
                        ...updatedMessages[i],
                        content: [...currentContent, { type: 'text', text: fileContent }]
                    };
                } else {
                    // If content is string, append file content
                    updatedMessages[i] = {
                        ...updatedMessages[i],
                        content: (currentContent || '') + fileContent
                    };
                }
                break;
            }
        }
        
        return updatedMessages;
    }
}
