import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, MessageObject } from "@codebolt/types/sdk";
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import codebolt from "@codebolt/codeboltjs";

export interface AtFileProcessorOptions {
    maxFileSize?: number;
    allowedExtensions?: string[];
    enableRecursiveSearch?: boolean;
}



interface FileFilteringOptions {
    respectGitIgnore: boolean;
    respectGeminiIgnore: boolean;
}

const DEFAULT_FILE_FILTERING_OPTIONS: FileFilteringOptions = {
    respectGitIgnore: true,
    respectGeminiIgnore: true,
};

export class AtFileProcessorModifier extends BaseMessageModifier {
    private readonly options: AtFileProcessorOptions;

    constructor(options: AtFileProcessorOptions = {}) {
        super()
        this.options = {
            maxFileSize: options.maxFileSize || 1024 * 1024, // 1MB default
            allowedExtensions: options.allowedExtensions || ['.ts', '.js', '.d.ts', '.json', '.md', '.txt', '.yml', '.yaml', '.xml', '.html', '.css', '.py', '.java', '.cpp', '.c', '.h'],
            enableRecursiveSearch: options.enableRecursiveSearch !== false
        };
    }

    async modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        try {
            const mentionedFiles = originalRequest.mentionedFiles || [];
            const mentionedFolders = originalRequest.mentionedFolders || [];
            
            if (mentionedFiles.length === 0 && mentionedFolders.length === 0) {
                return createdMessage;
            }

            // Process mentioned files and folders
            const result = await this.processMentionedPaths(mentionedFiles, mentionedFolders);
            
            if (!result.success) {
                return createdMessage;
            }

            // Update the user message with processed content
            const messages = [...createdMessage.message.messages];
            const lastUserMessageIndex = this.findLastUserMessage(messages);
            
            if (lastUserMessageIndex !== -1 && result.processedContent) {
                const lastUserMessage = messages[lastUserMessageIndex];
                
                // Convert string content to array format if needed
                let currentContent: any[];
                if (Array.isArray(lastUserMessage.content)) {
                    currentContent = lastUserMessage.content;
                } else {
                    // Convert string content to array format
                    currentContent = [{ type: 'text', text: lastUserMessage.content as string }];
                }
                
                // Ensure processedContent is in array format
                const newContent = Array.isArray(result.processedContent) 
                    ? result.processedContent 
                    : [{ type: 'text', text: result.processedContent }];
                
                // Merge existing content with processed content
                messages[lastUserMessageIndex] = {
                    ...lastUserMessage,
                    content: [...currentContent, ...newContent]
                };
            }

            return {
                message: {
                    ...createdMessage.message,
                    messages
                },
                metadata: {
                    ...createdMessage.metadata,
                    atFileProcessed: true,
                    processedFiles: mentionedFiles,
                    processedFolders: mentionedFolders,
                    filesRead: result.filesRead || []
                }
            };
        } catch (error) {
            console.error('Error in AtFileProcessorModifier:', error);
            return createdMessage;
        }
    }

    private async processMentionedPaths(mentionedFiles: string[], mentionedFolders: string[]): Promise<{
        success: boolean;
        processedContent?: any;
        filesRead?: string[];
    }> {
        const filesRead: string[] = [];
        const contextParts: string[] = [];

        // Get workspace directories
        let workspaceDirectories: string[] = [];
        try {
            const { projectPath } = await codebolt.project.getProjectPath();
            workspaceDirectories = projectPath ? [projectPath] : [await this.getProjectPath()];
        } catch (error) {
            workspaceDirectories = [await this.getProjectPath()];
        }

        // Process mentioned files using readManyFiles
        if (mentionedFiles.length > 0) {
            try {
                const resolvedPaths = await Promise.all(
                    mentionedFiles.map(async (filePath) => {
                        try {
                            await this.resolvePath(filePath, workspaceDirectories);
                            return filePath; // Keep original path for readManyFiles
                        } catch (error) {
                            console.warn(`Could not resolve path: ${filePath}`);
                            return filePath; // Still try to read it
                        }
                    })
                );

                const fileContents = await this.readManyFiles(resolvedPaths);
                filesRead.push(...mentionedFiles);
                
                if (fileContents.length > 0) {
                    contextParts.push(`\n--- Content from referenced files ---`);
                    for (const { path: filePath, content } of fileContents) {
                        contextParts.push(`\nContent from @${filePath}:\n`);
                        contextParts.push(content);
                    }
                }
            } catch (error) {
                console.error('Error reading mentioned files:', error);
                // Fallback to individual file reading
                contextParts.push(`\n--- Content from referenced files ---`);
                
                for (const filePath of mentionedFiles) {
                    try {
                        const resolvedPath = await this.resolvePath(filePath, workspaceDirectories);
                        const content = await this.readFileContent(resolvedPath);
                        filesRead.push(filePath);
                        
                        contextParts.push(`\nContent from @${filePath}:\n`);
                        contextParts.push(content);
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        contextParts.push(`\nContent from @${filePath}:\n`);
                        contextParts.push(`[Error loading ${filePath}: ${errorMessage}]`);
                    }
                }
            }
        }

        // Process mentioned folders
        if (mentionedFolders.length > 0) {
            contextParts.push(`\n--- Folder Structures ---`);
            
            for (const folderPath of mentionedFolders) {
                try {
                    const resolvedPath = await this.resolvePath(folderPath, workspaceDirectories);
                    const structure = await this.getFolderStructure(resolvedPath);
                    filesRead.push(folderPath);
                    
                    contextParts.push(`\nStructure of @${folderPath}:\n`);
                    contextParts.push(structure);
                    
                    // Also read files within the folder
                    const filesInFolder = await this.getFilesInFolder(resolvedPath);
                    // console.log(`Found ${filesInFolder.length} files in ${folderPath}:`, filesInFolder.map(f => path.basename(f)));
                    
                    if (filesInFolder.length > 0) {
                        contextParts.push(`\n--- Files in ${folderPath} ---`);
                        
                        for (const filePath of filesInFolder) {
                            try {
                                // console.log(`Attempting to read file: ${filePath}`);
                                const content = await this.readFileContent(filePath);
                                const relativePath = path.relative(resolvedPath, filePath);
                                const displayPath = `${folderPath}/${relativePath}`;
                                
                                contextParts.push(`\nContent from @${displayPath}:\n`);
                                contextParts.push(content);
                                // console.log(`Successfully read file: ${displayPath} (${content.length} chars)`);
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                                const relativePath = path.relative(resolvedPath, filePath);
                                const displayPath = `${folderPath}/${relativePath}`;
                                
                                console.error(`Error reading file ${displayPath}:`, errorMessage);
                                contextParts.push(`\nContent from @${displayPath}:\n`);
                                contextParts.push(`[Error reading file: ${errorMessage}]`);
                            }
                        }
                    } else {
                        console.log(`No files found in ${folderPath} (resolved to ${resolvedPath})`);
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    contextParts.push(`\nStructure of @${folderPath}:\n`);
                    contextParts.push(`[Error reading folder ${folderPath}: ${errorMessage}]`);
                }
            }
        }

        return {
            success: true,
            processedContent: this.buildContentParts(contextParts),
            filesRead
        };
    }

    private buildContentParts(contextParts: string[]): Array<{ type: string; text: string }> {
        const contentParts: Array<{ type: string; text: string }> = [];
        
        for (const part of contextParts) {
            contentParts.push({
                type: 'text',
                text: part
            });
        }
        
        return contentParts;
    }

    private async resolvePath(pathName: string, workspaceDirectories: string[]): Promise<string> {
        // Try to resolve the path in workspace directories
        for (const dir of workspaceDirectories) {
            try {
                const absolutePath = path.resolve(dir, pathName);
                await fs.stat(absolutePath); // Check if path exists
                return absolutePath;
            } catch (error) {
                if (this.isNodeError(error) && error.code === 'ENOENT') {
                    if (this.options.enableRecursiveSearch) {
                        // Try glob search
                        const globResult = await this.globSearch(pathName, dir);
                        if (globResult) {
                            return path.resolve(dir, globResult);
                        }
                    }
                }
            }
        }
        
        // Fallback to original path
        const projectPath = await this.getProjectPath();
        return path.isAbsolute(pathName) ? pathName : path.resolve(projectPath, pathName);
    }

    private async globSearch(pathName: string, dir: string): Promise<string | null> {
        // Simple glob search implementation
        try {
            const pattern = `**/*${pathName}*`;
            const matches = await this.findFiles(dir, pattern);
            if (matches.length > 0) {
                return path.relative(dir, matches[0]);
            }
        } catch (error) {
            console.error('Glob search error:', error);
        }
        return null;
    }

    private async findFiles(dir: string, pattern: string): Promise<string[]> {
        // Simplified file finding - in real implementation would use proper glob
        const matches: string[] = [];
        const searchTerm = pattern.replace(/\*\*/g, '').replace(/\*/g, '');
        
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.name.includes(searchTerm)) {
                    matches.push(path.join(dir, entry.name));
                }
                if (entry.isDirectory() && !entry.name.startsWith('.')) {
                    const subMatches = await this.findFiles(path.join(dir, entry.name), pattern);
                    matches.push(...subMatches);
                }
            }
        } catch (error) {
            // Ignore errors in subdirectories
        }
        
        return matches.slice(0, 10); // Limit results
    }

    private async readManyFiles(pathSpecs: string[]): Promise<Array<{ path: string; content: string }>> {
        const results: Array<{ path: string; content: string }> = [];
        
        // Try to use read_many_files tool if available (like gemini-cli)
        try {
            // In a real implementation, this would use the actual tool registry
            // For now, we'll simulate the tool behavior
            const toolArgs = {
                paths: pathSpecs,
                useDefaultExcludes: true,
                file_filtering_options: {
                    respect_git_ignore: DEFAULT_FILE_FILTERING_OPTIONS.respectGitIgnore,
                    respect_gemini_ignore: DEFAULT_FILE_FILTERING_OPTIONS.respectGeminiIgnore,
                }
            };

            // Simulate read_many_files tool execution
            for (const pathSpec of pathSpecs) {
                try {
                    if (pathSpec.includes('**') || pathSpec.includes('*')) {
                        // Handle directory patterns
                        const basePath = pathSpec.replace('/**', '').replace('**', '');
                        const files = await this.findFiles(basePath, '**/*');
                        
                        for (const filePath of files.slice(0, 20)) { // Limit files
                            try {
                                const content = await this.readFileContent(filePath);
                                const projectPath = await this.getProjectPath();
                                results.push({ path: path.relative(projectPath, filePath), content });
                            } catch (error) {
                                results.push({ path: filePath, content: `[Error reading file: ${error}]` });
                            }
                        }
                    } else {
                        // Handle single file
                        const projectPath = await this.getProjectPath();
                        const resolvedPath = path.isAbsolute(pathSpec) ? pathSpec : path.resolve(projectPath, pathSpec);
                        const content = await this.readFileContent(resolvedPath);
                        results.push({ path: pathSpec, content });
                    }
                } catch (error) {
                    results.push({ path: pathSpec, content: `[Error reading: ${error}]` });
                }
            }
        } catch (error) {
            console.error('Error in readManyFiles:', error);
            // Fallback to individual file reading
            for (const pathSpec of pathSpecs) {
                try {
                    const projectPath = await this.getProjectPath();
                    const resolvedPath = path.isAbsolute(pathSpec) ? pathSpec : path.resolve(projectPath, pathSpec);
                    const content = await this.readFileContent(resolvedPath);
                    results.push({ path: pathSpec, content });
                } catch (error) {
                    results.push({ path: pathSpec, content: `[Error reading: ${error}]` });
                }
            }
        }
        
        return results;
    }

    private async readFileContent(filePath: string): Promise<string> {
        // Check file size
        const stats = await fs.stat(filePath);
        if (stats.size > this.options.maxFileSize!) {
            throw new Error(`File too large: ${stats.size} bytes`);
        }

        // Check file extension
        if (this.options.allowedExtensions!.length > 0) {
            const ext = path.extname(filePath).toLowerCase();
            if (!this.options.allowedExtensions!.includes(ext)) {
                throw new Error(`File type not allowed: ${ext}`);
            }
        }

        const content = await fs.readFile(filePath, 'utf-8');
        return content;
    }

    private async getFilesInFolder(folderPath: string): Promise<string[]> {
        try {
            const entries = await fs.readdir(folderPath, { withFileTypes: true });
            const files: string[] = [];
            
            for (const entry of entries) {
                if (entry.isFile() && !entry.name.startsWith('.')) {
                    // Check file extension if allowed extensions are specified
                    if (this.options.allowedExtensions!.length > 0) {
                        const ext = path.extname(entry.name).toLowerCase();
                        // console.log(`Checking file ${entry.name} with extension ${ext}. Allowed:`, this.options.allowedExtensions);
                        if (this.options.allowedExtensions!.includes(ext)) {
                            files.push(path.join(folderPath, entry.name));
                        } else {
                            // console.log(`File ${entry.name} extension ${ext} not in allowed list`);
                        }
                    } else {
                        files.push(path.join(folderPath, entry.name));
                    }
                }
            }
            
            // Limit number of files to avoid overwhelming output
            return files.slice(0, 10);
        } catch (error) {
            console.error('Error reading files in folder:', error);
            return [];
        }
    }

    private async getFolderStructure(folderPath: string): Promise<string> {
        // Check if folder exists and is readable
        const stats = await fs.stat(folderPath);
        if (!stats.isDirectory()) {
            throw new Error(`${folderPath} is not a directory`);
        }

        // Read directory structure
        const entries = await fs.readdir(folderPath, { withFileTypes: true });
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
                lines.push(`${path.basename(folderPath)}/${entry.name}/`);
            } else {
                const filePath = path.join(folderPath, entry.name);
                const fileStats = await fs.stat(filePath);
                const size = fileStats.size < 1024 ? `${fileStats.size}B` : `${Math.round(fileStats.size / 1024)}KB`;
                lines.push(`${path.basename(folderPath)}/${entry.name} (${size})`);
            }
        }
        
        if (entries.length > 50) {
            lines.push(`... and ${entries.length - 50} more items`);
        }
        
        return lines.join('\n');
    }

    private findLastUserMessage(messages: MessageObject[]): number {
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'user') {
                return i;
            }
        }
        return -1;
    }

    private async getProjectPath(): Promise<string> {
        try {
            const { projectPath } = await codebolt.project.getProjectPath();
            return projectPath || process.cwd();
        } catch (error) {
            console.warn('Failed to get project path from codebolt.project.getProjectPath(), falling back to process.cwd()');
            return process.cwd();
        }
    }

    private isNodeError(error: unknown): error is NodeJS.ErrnoException {
        return error instanceof Error && 'code' in error;
    }
}