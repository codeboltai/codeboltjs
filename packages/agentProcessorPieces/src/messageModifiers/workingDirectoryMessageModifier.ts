import { BaseMessageModifier, MessageModifierInput, ProcessedMessage, Message } from '@codebolt/agentprocessorframework';
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
        this.listFilesLimit = options.listFilesLimit || 100;
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
            // Use CodeBolt's file listing if available (simplified call)
            const files = await codebolt.fs.listFile(projectPath, true);
            
            const directories = new Set<string>();
            files.forEach((file: any) => {
                const dir = path.dirname(file.path || file);
                if (dir !== '.' && !this.shouldIgnore(dir)) {
                    directories.add(dir);
                }
            });
            
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
            // Use CodeBolt's file listing (simplified call)
            const files = await codebolt.fs.listFile(projectPath, false);

          
            
            const filteredFiles = files
                .filter((file: any) => !this.shouldIgnore(file.path || file))
                .slice(0, this.listFilesLimit)
                .map((file: any) => file.path || file);
            
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
