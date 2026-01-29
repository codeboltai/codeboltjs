import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, MessageObject } from "@codebolt/types/sdk";
import * as path from 'path';
import * as fs from 'fs';
import codebolt from "@codebolt/codeboltjs";

export interface EnvironmentContextOptions {
    enableFullContext?: boolean;
    maxFiles?: number;
    maxFileSize?: number;
    includePatterns?: string[];
    excludePatterns?: string[];
}

export class EnvironmentContextModifier extends BaseMessageModifier {
    private readonly options: EnvironmentContextOptions;
    private readonly defaultExcludePatterns = [
        'node_modules/**',
        '.git/**',
        'dist/**',
        'build/**',
        '*.log',
        '*.tmp',
        '.DS_Store',
        'coverage/**',
        '.next/**',
        '.nuxt/**',
        '.codebolt',
        '.codebolt/**',
    ];

    constructor(options: EnvironmentContextOptions = {}){
        super()
        this.options = {
            enableFullContext: options.enableFullContext || false,
            maxFiles: options.maxFiles || 100,
            maxFileSize: options.maxFileSize || 100 * 1024, // 100KB per file
            includePatterns: options.includePatterns || ['**/*.ts', '**/*.js', '**/*.json', '**/*.md', '**/*.txt', '**/*.yml', '**/*.yaml'],
            excludePatterns: [...this.defaultExcludePatterns, ...(options.excludePatterns || [])]
        };
    }

    async modify(_originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        try {
            // Get current date formatted to user's locale
            const today = new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            
            const platform = process.platform;
            const { projectPath } = await codebolt.project.getProjectPath();
            
            if (!projectPath) {
                return createdMessage;
            }
            
            const currentDir = projectPath;
            
            // Get basic directory listing
            let directoryListing = '';
            try {
                const files = await fs.promises.readdir(currentDir);
                const fileList = files.slice(0, 20).join(', '); // Limit to first 20 files
                const moreFiles = files.length > 20 ? ` ... and ${files.length - 20} more files` : '';
                directoryListing = `Files in current directory: ${fileList}${moreFiles}`;
            } catch (error) {
                directoryListing = 'Unable to read current directory';
            }

            const environmentContext = `
This is the CodeBolt AI Agent. Setting up context for our chat.
Today's date is ${today} (formatted according to the user's locale).
Operating system: ${platform}
Current working directory: ${currentDir}
${directoryListing}
            `.trim();

            // Prepare context parts (same as gemini-cli)
            const contextParts: string[] = [environmentContext];

            // Add full file context if enabled (just like gemini-cli does)
            if (this.options.enableFullContext) {
                try {
                    const fullContextContent = await this.generateFullContext(currentDir);
                    if (fullContextContent) {
                        contextParts.push(`\n--- Full File Context ---\n${fullContextContent}`);
                    }
                } catch (error) {
                    console.error('Error reading full file context:', error);
                    contextParts.push('\n--- Error reading full file context ---');
                }
            }

            const finalContent = contextParts.join('\n\n');
            const contextMessage: MessageObject = {
                role: 'user',
                content: finalContent
            };

            // Push the context message to the messages array
            const messages = [...createdMessage.message.messages];
            messages.push(contextMessage);

            return Promise.resolve({
                message: {
                    ...createdMessage.message,
                    messages
                },
                metadata: {
                    ...createdMessage.metadata,
                    environmentContextAdded: true,
                    fullContextAdded: this.options.enableFullContext,
                    contextFilesCount: this.options.enableFullContext ? await this.countContextFiles(currentDir) : 0,
                    environmentInfo: {
                        date: today,
                        platform,
                        currentDir
                    }
                }
            });
        } catch (error) {
            console.error('Error in EnvironmentContextModifier:', error);
            return createdMessage;
        }
    }

    // Full context methods (integrated like gemini-cli)
    private async generateFullContext(basePath: string): Promise<string> {
        try {
            const files = await this.findRelevantFiles(basePath);
            const contextParts: string[] = [];

            let processedFiles = 0;
            for (const filePath of files) {
                if (processedFiles >= this.options.maxFiles!) {
                    contextParts.push(`\n... (${files.length - processedFiles} more files not shown due to limit)\n`);
                    break;
                }

                try {
                    const relativePath = path.relative(basePath, filePath);
                    const stats = await fs.promises.stat(filePath);
                    
                    // Skip files that are too large
                    if (stats.size > this.options.maxFileSize!) {
                        contextParts.push(`--- ${relativePath} ---\n[File too large: ${stats.size} bytes]\n`);
                        processedFiles++;
                        continue;
                    }

                    const content = await fs.promises.readFile(filePath, 'utf-8');
                    contextParts.push(`--- ${relativePath} ---\n${content}\n`);
                    processedFiles++;
                } catch (error) {
                    const relativePath = path.relative(basePath, filePath);
                    contextParts.push(`--- ${relativePath} ---\n[Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}]\n`);
                    processedFiles++;
                }
            }

            return contextParts.join('\n');
        } catch (error) {
            console.error('Error generating full context:', error);
            return '';
        }
    }

    private async findRelevantFiles(basePath: string): Promise<string[]> {
        const files: string[] = [];
        
        try {
            await this.walkDirectory(basePath, files, basePath);
            return files.sort();
        } catch (error) {
            console.error('Error finding relevant files:', error);
            return [];
        }
    }

    private async walkDirectory(dir: string, files: string[], basePath: string): Promise<void> {
        try {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.relative(basePath, fullPath);
                
                // Check exclusion patterns
                if (this.isExcluded(relativePath)) {
                    continue;
                }

                if (entry.isDirectory()) {
                    await this.walkDirectory(fullPath, files, basePath);
                } else if (entry.isFile()) {
                    // Check inclusion patterns
                    if (this.isIncluded(relativePath)) {
                        files.push(fullPath);
                    }
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
    }

    private isExcluded(relativePath: string): boolean {
        return this.options.excludePatterns!.some(pattern => {
            return this.matchesPattern(relativePath, pattern);
        });
    }

    private isIncluded(relativePath: string): boolean {
        return this.options.includePatterns!.some(pattern => {
            return this.matchesPattern(relativePath, pattern);
        });
    }

    private matchesPattern(filePath: string, pattern: string): boolean {
        // Simple glob pattern matching - in production, use a proper glob library
        const regexPattern = pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*')
            .replace(/\?/g, '.');
        
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(filePath);
    }

    private async countContextFiles(basePath: string): Promise<number> {
        try {
            const files = await this.findRelevantFiles(basePath);
            return Math.min(files.length, this.options.maxFiles!);
        } catch (error) {
            return 0;
        }
    }

    // Public methods to control full context
    public enableFullContext(): void {
        this.options.enableFullContext = true;
    }

    public disableFullContext(): void {
        this.options.enableFullContext = false;
    }

    public isFullContextEnabled(): boolean {
        return this.options.enableFullContext || false;
    }
}
