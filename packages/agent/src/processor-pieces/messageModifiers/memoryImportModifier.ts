import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, MessageObject } from "@codebolt/types/sdk";
import * as fs from 'fs';
import * as path from 'path';

export interface MemoryImportOptions {
    enableMemoryImport?: boolean;
    maxFileSize?: number;
    allowedExtensions?: string[];
    basePath?: string;
    maxImports?: number;
}

export class MemoryImportModifier extends BaseMessageModifier {
    private readonly options: MemoryImportOptions;

    constructor(options: MemoryImportOptions = {}){
        super()
        this.options = {
            enableMemoryImport: options.enableMemoryImport !== false,
            maxFileSize: options.maxFileSize || 1024 * 1024, // 1MB
            allowedExtensions: options.allowedExtensions || ['.md', '.txt', '.json', '.yml', '.yaml', '.xml'],
            basePath: options.basePath || process.cwd(),
            maxImports: options.maxImports || 10
        };
    }

    async modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        try {
            if (!this.options.enableMemoryImport) {
                return createdMessage;
            }

            // Get the user message content to process
            const userMessage = createdMessage.message.messages.find(msg => msg.role === 'user');
            if (!userMessage || typeof userMessage.content !== 'string') {
                return createdMessage;
            }

            // Look for @path/to/file patterns (memory import syntax)
            const memoryImportPattern = /@([^\s@]+(?:\.[a-zA-Z0-9]+)?)/g;
            let content = userMessage.content;
            const processedImports: string[] = [];
            let match;
            let importCount = 0;

            while ((match = memoryImportPattern.exec(userMessage.content)) !== null && importCount < this.options.maxImports!) {
                const filePath = match[1];
                const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.options.basePath!, filePath);

                try {
                    // Check if file exists and is allowed
                    const stats = await fs.promises.stat(fullPath);
                    if (!stats.isFile()) {
                        continue;
                    }

                    if (stats.size > this.options.maxFileSize!) {
                        content = content.replace(match[0], `[File too large: ${filePath}]`);
                        continue;
                    }

                    const ext = path.extname(filePath);
                    if (!this.options.allowedExtensions!.includes(ext)) {
                        content = content.replace(match[0], `[Unsupported file type: ${filePath}]`);
                        continue;
                    }

                    // Read and import the file content
                    const fileContent = await fs.promises.readFile(fullPath, 'utf-8');
                    const importedContent = `--- Content from ${filePath} ---\n${fileContent}\n--- End of ${filePath} ---`;
                    
                    content = content.replace(match[0], importedContent);
                    processedImports.push(filePath);
                    importCount++;

                } catch (error) {
                    // Replace with error message if file can't be read
                    content = content.replace(match[0], `[Error reading ${filePath}: ${error instanceof Error ? error.message : 'unknown error'}]`);
                }
            }

            if (processedImports.length === 0) {
                return createdMessage;
            }

            // Update the user message with processed content
            const messages = createdMessage.message.messages.map(msg => {
                if (msg.role === 'user' && msg === userMessage) {
                    return {
                        ...msg,
                        content
                    };
                }
                return msg;
            });

            return Promise.resolve({
                message: {
                    ...createdMessage.message,
                    messages
                },
                metadata: {
                    ...createdMessage.metadata,
                    memoryImportsProcessed: true,
                    importedFiles: processedImports,
                    totalImports: processedImports.length
                }
            });
        } catch (error) {
            console.error('Error in MemoryImportModifier:', error);
            return createdMessage;
        }
    }
}