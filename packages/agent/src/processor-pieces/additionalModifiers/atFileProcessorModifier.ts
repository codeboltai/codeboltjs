import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, MessageObject } from "@codebolt/types/sdk";
import * as fs from 'fs';
import * as path from 'path';

export interface AtFileProcessorOptions {
    maxFileSize?: number;
    allowedExtensions?: string[];
    basePath?: string;
}

export class AtFileProcessorModifier extends BaseMessageModifier {
    private readonly options: AtFileProcessorOptions;

    constructor(options: AtFileProcessorOptions = {}){
        super()
        this.options = {
            maxFileSize: options.maxFileSize || 1024 * 1024, // 1MB default
            allowedExtensions: options.allowedExtensions || ['.ts', '.js', '.json', '.md', '.txt', '.yml', '.yaml', '.xml', '.html', '.css', '.py', '.java', '.cpp', '.c', '.h'],
            basePath: options.basePath || process.cwd()
        };
    }

    async modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        try {
            const mentionedFiles = originalRequest.mentionedFiles || [];
            const mentionedFolders = originalRequest.mentionedFolders || [];
            
            if (mentionedFiles.length === 0 && mentionedFolders.length === 0) {
                return createdMessage;
            }

            const contextParts: string[] = [];

            // Process mentioned files
            if (mentionedFiles.length > 0) {
                const fileContents = await Promise.all(
                    mentionedFiles.map(async (filePath) => {
                        try {
                            const content = await this.readFileContent(filePath);
                            return `--- Content from ${filePath} ---\n${content}\n--- End of ${filePath} ---`;
                        } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                            return `[Error loading ${filePath}: ${errorMessage}]`;
                        }
                    })
                );
                contextParts.push(`File Contents:\n${fileContents.join('\n\n')}`);
            }

            // Process mentioned folders
            if (mentionedFolders.length > 0) {
                const folderContents = await Promise.all(
                    mentionedFolders.map(async (folderPath) => {
                        try {
                            const structure = await this.getFolderStructure(folderPath);
                            return `--- Structure of ${folderPath} ---\n${structure}\n--- End of ${folderPath} ---`;
                        } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                            return `[Error reading folder ${folderPath}: ${errorMessage}]`;
                        }
                    })
                );
                contextParts.push(`Folder Structures:\n${folderContents.join('\n\n')}`);
            }

            // Find the last user message and append context to it
            const messages = [...createdMessage.message.messages];
            let lastUserMessageIndex = -1;
            for (let i = messages.length - 1; i >= 0; i--) {
                if (messages[i].role === 'user') {
                    lastUserMessageIndex = i;
                    break;
                }
            }
            
            if (lastUserMessageIndex !== -1) {
                const lastUserMessage = messages[lastUserMessageIndex];
                const currentContent = Array.isArray(lastUserMessage.content) 
                    ? lastUserMessage.content 
                    : [{ type: 'text', text: lastUserMessage.content as string }];
                
                // Add context as additional content parts
                const contextContent = {
                    type: 'text' as const,
                    text: contextParts.join('\n\n')
                };
                
                messages[lastUserMessageIndex] = {
                    ...lastUserMessage,
                    content: [...currentContent, contextContent]
                };
            }

            return Promise.resolve({
                message: {
                    ...createdMessage.message,
                    messages
                },
                metadata: {
                    ...createdMessage.metadata,
                    atFileProcessed: true,
                    processedFiles: mentionedFiles,
                    processedFolders: mentionedFolders
                }
            });
        } catch (error) {
            console.error('Error in AtFileProcessorModifier:', error);
            return createdMessage;
        }
    }


    private async readFileContent(filePath: string): Promise<string> {
        // Resolve path relative to base path
        const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(this.options.basePath!, filePath);
        
        // Security check: ensure the file is within allowed directory
        const relativePath = path.relative(this.options.basePath!, resolvedPath);
        if (relativePath.startsWith('..')) {
            throw new Error(`Access denied: ${filePath} is outside the allowed directory`);
        }

        // Check if file exists
        try {
            await fs.promises.access(resolvedPath, fs.constants.R_OK);
        } catch (error) {
            throw new Error(`File not found or not readable: ${filePath}`);
        }

        // Check file size
        const stats = await fs.promises.stat(resolvedPath);
        if (stats.size > this.options.maxFileSize!) {
            throw new Error(`File too large: ${filePath} (${stats.size} bytes, max ${this.options.maxFileSize} bytes)`);
        }

        // Check file extension if allowedExtensions is specified
        if (this.options.allowedExtensions!.length > 0) {
            const ext = path.extname(resolvedPath).toLowerCase();
            if (!this.options.allowedExtensions!.includes(ext)) {
                throw new Error(`File type not allowed: ${ext}`);
            }
        }

        // Read and return file content
        const content = await fs.promises.readFile(resolvedPath, 'utf-8');
        return content;
    }

    private async getFolderStructure(folderPath: string): Promise<string> {
        // Resolve path relative to base path
        const resolvedPath = path.isAbsolute(folderPath) ? folderPath : path.resolve(this.options.basePath!, folderPath);
        
        // Security check: ensure the folder is within allowed directory
        const relativePath = path.relative(this.options.basePath!, resolvedPath);
        if (relativePath.startsWith('..')) {
            throw new Error(`Access denied: ${folderPath} is outside the allowed directory`);
        }

        // Check if folder exists and is readable
        try {
            await fs.promises.access(resolvedPath, fs.constants.R_OK);
            const stats = await fs.promises.stat(resolvedPath);
            if (!stats.isDirectory()) {
                throw new Error(`${folderPath} is not a directory`);
            }
        } catch (error) {
            throw new Error(`Folder not found or not readable: ${folderPath}`);
        }

        // Read directory structure
        try {
            const entries = await fs.promises.readdir(resolvedPath, { withFileTypes: true });
            const lines: string[] = [];
            
            // Sort entries: directories first, then files
            const sortedEntries = entries.sort((a, b) => {
                if (a.isDirectory() && !b.isDirectory()) return -1;
                if (!a.isDirectory() && b.isDirectory()) return 1;
                return a.name.localeCompare(b.name);
            });

            for (const entry of sortedEntries.slice(0, 50)) { // Limit to 50 entries
                if (entry.name.startsWith('.')) continue; // Skip hidden files
                
                if (entry.isDirectory()) {
                    lines.push(`${folderPath}/${entry.name}/`);
                } else {
                    const filePath = path.join(resolvedPath, entry.name);
                    const stats = await fs.promises.stat(filePath);
                    const size = stats.size < 1024 ? `${stats.size}B` : `${Math.round(stats.size / 1024)}KB`;
                    lines.push(`${folderPath}/${entry.name} (${size})`);
                }
            }
            
            if (entries.length > 50) {
                lines.push(`... and ${entries.length - 50} more items`);
            }
            
            return lines.join('\n');
        } catch (error) {
            throw new Error(`Error reading folder structure: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    }
}
