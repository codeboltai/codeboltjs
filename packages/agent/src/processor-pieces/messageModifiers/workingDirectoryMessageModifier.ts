import { BaseMessageModifier, MessageModifierInput, ProcessedMessage, Message } from '../../processor';
import codebolt from '@codebolt/codeboltjs';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface WorkingDirectoryMessageModifierOptions {
    showFolderStructureSummary?: boolean;
    listFiles?: boolean;
    listFilesDepth?: number;
    listFilesLimit?: number;
    listFilesIgnoreFromGitignore?: boolean;
    listFilesIgnore?: string[];
}

export class WorkingDirectoryMessageModifier extends BaseMessageModifier {
    private readonly showFolderStructureSummary: boolean;
    private readonly listFiles: boolean;
    private readonly listFilesDepth: number;
    private readonly listFilesLimit: number;
    private readonly listFilesIgnoreFromGitignore: boolean;
    private readonly listFilesIgnore: string[];

    constructor(options: WorkingDirectoryMessageModifierOptions = {}) {
        super({ context: options });
        this.showFolderStructureSummary = options.showFolderStructureSummary || false;
        this.listFiles = options.listFiles || false;
        this.listFilesDepth = options.listFilesDepth || 2;
        this.listFilesLimit = options.listFilesLimit || 200;
        this.listFilesIgnoreFromGitignore = options.listFilesIgnoreFromGitignore || true;
        this.listFilesIgnore = options.listFilesIgnore || ['node_modules', '.git', 'dist', 'build'];
    }

    async modify(input: MessageModifierInput): Promise<ProcessedMessage> {
        try {
            const { originalRequest, createdMessage, context } = input;
            
            const contextParts: string[] = [];
            
            // Get project information
            try {
                const projectPathResponse = await codebolt.project.getProjectPath();
           
                const projectPath = typeof projectPathResponse === 'string' 
                    ? projectPathResponse 
                    : (projectPathResponse as any)?.path || String(projectPathResponse) || '';
                contextParts.push(`Project Directory: ${projectPath}`);
                
                if (this.showFolderStructureSummary) {
                    const summary = await this.generateFolderStructureSummary(projectPath);
                    contextParts.push(`Folder Structure Summary:\n${summary}`);
                }
                
                if (this.listFiles) {
                    const filesList = await this.generateFilesList(projectPath);
                    contextParts.push(`Files List:\n${filesList}`);
                }
                
            } catch (error) {
                console.error('Error getting project information:', error);
                contextParts.push('Working Directory: Unable to access project information');
            }
            
            // Create context message if we have any context parts
            if (contextParts.length > 0) {
                const contextMessage: Message = {
                    role: 'system',
                    content: contextParts.join('\n\n'),
                    name: 'working-directory-context'
                };

                return {
                    messages: [contextMessage, ...createdMessage.messages],
                    metadata: {
                        ...createdMessage.metadata,
                        workingDirectoryContextAdded: true,
                        contextParts: contextParts.length
                    }
                };
            }

            return createdMessage;
        } catch (error) {
            console.error('Error in WorkingDirectoryMessageModifier:', error);
            throw error;
        }
    }

    private async generateFolderStructureSummary(projectPath: string): Promise<string> {
        try {
            // Use CodeBolt's directory listing with recursive option
            const response = await codebolt.fs.listDirectory({
                path: projectPath,
                show_hidden: false,
                detailed: false,
                limit: 200,
                notifyUser: false
            });
            
            const directories = new Set<string>();
            
            // Extract directories from the response
            if (response && response.success) {
                let entries;
                if (typeof response.result === 'string') {
                    // If result is a string, we'll need to parse it or work with what we have
                    return response.result.split('\n').slice(0, 20).join('\n');
                } else if (response.result && response.result.entries) {
                    entries = response.result.entries;
                } else if (response.entries) {
                    entries = response.entries;
                }
                
                if (entries) {
                    entries.forEach((entry: any) => {
                        if (entry.type === 'directory' && !this.shouldIgnore(entry.path || entry.name)) {
                            directories.add(entry.path || entry.name);
                        }
                        // Also get parent directories of files
                        const dir = path.dirname(entry.path || entry.name);
                        if (dir !== '.' && !this.shouldIgnore(dir)) {
                            directories.add(dir);
                        }
                    });
                }
            }
            
            const sortedDirs = Array.from(directories).sort();
            return sortedDirs.length > 0 
                ? sortedDirs.slice(0, 20).join('\n')
                : 'No accessible directories found';
                
        } catch (error) {
            return 'Unable to generate folder structure summary';
        }
    }

    private async generateFilesList(projectPath: string): Promise<string> {
        try {
            // Use CodeBolt's directory listing to get files
            const response = await codebolt.fs.listDirectory({
                path: projectPath,
                show_hidden: false,
                detailed: false,
                limit: this.listFilesLimit,
                notifyUser: false
            });
            
            const files: string[] = [];
            
            // Extract files from the response
            if (response && response.success) {
                let entries;
                if (typeof response.result === 'string') {
                    // If result is a string, split and filter for files
                    return response.result.split('\n')
                        .filter((line: string) => !this.shouldIgnore(line))
                        .slice(0, this.listFilesLimit)
                        .join('\n');
                } else if (response.result && response.result.entries) {
                    entries = response.result.entries;
                } else if (response.entries) {
                    entries = response.entries;
                }
                
                if (entries) {
                    entries.forEach((entry: any) => {
                        if (entry.type === 'file' && !this.shouldIgnore(entry.path || entry.name)) {
                            files.push(entry.path || entry.name);
                        }
                    });
                }
            }
            
            const filteredFiles = files.slice(0, this.listFilesLimit);
            
            return filteredFiles.length > 0 
                ? filteredFiles.join('\n')
                : 'No accessible files found';
                
        } catch (error) {
            return 'Unable to generate files list';
        }
    }

    private shouldIgnore(filePath: string): boolean {
        return this.listFilesIgnore.some(ignore => 
            filePath.includes(ignore) || path.basename(filePath) === ignore
        );
    }
}
