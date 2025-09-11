import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, MessageObject } from "@codebolt/types/sdk";
import codebolt from '@codebolt/codeboltjs';
import * as path from 'path';
import * as fs from 'fs/promises';

export interface WorkingDirectoryMessageModifierOptions {
    showFolderStructureSummary?: boolean;
    listFiles?: boolean;
    listFilesDepth?: number;
    listFilesLimit?: number;
    listFilesIgnoreFromGitignore?: boolean;
    listFilesIgnore?: string[];
    maxItems?: number;
    showFullDirectoryContext?: boolean;
    [key: string]: unknown;
}

interface FullFolderInfo {
    name: string;
    path: string;
    files: string[];
    subFolders: FullFolderInfo[];
    totalChildren: number;
    totalFiles: number;
    isIgnored?: boolean;
    hasMoreFiles?: boolean;
    hasMoreSubfolders?: boolean;
}

export class WorkingDirectoryMessageModifier extends BaseMessageModifier {
    private readonly showFolderStructureSummary: boolean;
    private readonly listFiles: boolean;
    private readonly listFilesDepth: number;
    private readonly listFilesLimit: number;
    private readonly listFilesIgnoreFromGitignore: boolean;
    private readonly listFilesIgnore: string[];
    private readonly maxItems: number;
    private readonly showFullDirectoryContext: boolean;
    private readonly defaultIgnoredFolders = new Set(['node_modules', '.git', 'dist']);
    private readonly truncationIndicator = '...';

    constructor(options: WorkingDirectoryMessageModifierOptions = {}) {
        super({ context: options as Record<string, unknown> });
        this.showFolderStructureSummary = options.showFolderStructureSummary || false;
        this.listFiles = options.listFiles || false;
        this.listFilesDepth = options.listFilesDepth || 2;
        this.listFilesLimit = options.listFilesLimit || 100;
        this.listFilesIgnoreFromGitignore = options.listFilesIgnoreFromGitignore || true;
        this.listFilesIgnore = options.listFilesIgnore || ['node_modules', '.git', 'dist', 'build'];
        this.maxItems = options.maxItems || 200;
        this.showFullDirectoryContext = options.showFullDirectoryContext || true;
    }

    async modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        try {
            const contextParts: string[] = [];
            
            // Get project information
            try {
                const {projectPath} = await codebolt.project.getProjectPath();
                
                if (!projectPath) {
                    throw new Error('Project path not available');
                }
                
                // Generate comprehensive directory context similar to gemini-cli
                if (this.showFullDirectoryContext) {
                    const directoryContext = await this.getDirectoryContextString(projectPath);
                    contextParts.push(directoryContext);
                } else {
                    // Fallback to original behavior
                    contextParts.push(`Project Directory: ${projectPath}`);
                    
                    if (this.showFolderStructureSummary) {
                        const summary = await this.generateFolderStructureSummary(projectPath);
                        contextParts.push(`Folder Structure Summary:\n${summary}`);
                    }
                    
                    if (this.listFiles) {
                        const filesList = await this.generateFilesList(projectPath);
                        contextParts.push(`Files List:\n${filesList}`);
                    }
                }
                
            } catch (error) {
                console.error('Error getting project information:', error);
                contextParts.push('Working Directory: Unable to access project information');
            }
            
            // Create context message if we have any context parts
            if (contextParts.length > 0) {
                const contextContent = contextParts.join('\n\n');
                const messages = [...createdMessage.message.messages];
                
                // Find existing system message
                const systemMessageIndex = messages.findIndex(msg => msg.role === 'system');
                
                if (systemMessageIndex !== -1) {
                    // Update existing system message
                    messages[systemMessageIndex] = {
                        ...messages[systemMessageIndex],
                        content: `${messages[systemMessageIndex].content}\n\n${contextContent}`
                    };
                } else {
                    // Add new system message at the top
                    messages.unshift({
                        role: 'system',
                        content: contextContent
                    });
                }

                return {
                    ...createdMessage,
                    message: {
                        ...createdMessage.message,
                        messages
                    },
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
            const directories = new Set<string>();
            await this.collectDirectories(projectPath, directories, 0, 3); // Max depth of 3
            
            const sortedDirs = Array.from(directories)
                .filter(dir => dir !== projectPath && !this.shouldIgnore(dir))
                .sort()
                .slice(0, 20);
            
            return sortedDirs.length > 0 
                ? sortedDirs.join('\n')
                : 'No accessible directories found';
                
        } catch (error) {
            return 'Unable to generate folder structure summary';
        }
    }

    private async generateFilesList(projectPath: string): Promise<string> {
        try {
            const files: string[] = [];
            await this.collectFiles(projectPath, files, 0, 2); // Max depth of 2
            
            const filteredFiles = files
                .filter(filePath => !this.shouldIgnore(filePath))
                .slice(0, this.listFilesLimit)
                .map(filePath => path.basename(filePath));
            
            return filteredFiles.length > 0 
                ? filteredFiles.join('\n')
                : 'No accessible files found';
                
        } catch (error) {
            return 'Unable to generate files list';
        }
    }

    private async collectDirectories(dirPath: string, directories: Set<string>, currentDepth: number, maxDepth: number): Promise<void> {
        if (currentDepth >= maxDepth) return;
        
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const fullPath = path.join(dirPath, entry.name);
                    if (!this.shouldIgnore(fullPath)) {
                        directories.add(fullPath);
                        await this.collectDirectories(fullPath, directories, currentDepth + 1, maxDepth);
                    }
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
    }

    private async collectFiles(dirPath: string, files: string[], currentDepth: number, maxDepth: number): Promise<void> {
        if (currentDepth >= maxDepth || files.length >= this.listFilesLimit) return;
        
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.isFile()) {
                    const fullPath = path.join(dirPath, entry.name);
                    if (!this.shouldIgnore(fullPath)) {
                        files.push(fullPath);
                        if (files.length >= this.listFilesLimit) break;
                    }
                } else if (entry.isDirectory() && currentDepth < maxDepth - 1) {
                    const fullPath = path.join(dirPath, entry.name);
                    if (!this.shouldIgnore(fullPath)) {
                        await this.collectFiles(fullPath, files, currentDepth + 1, maxDepth);
                    }
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
    }

    private shouldIgnore(filePath: string): boolean {
        return this.listFilesIgnore.some(ignore => 
            filePath.includes(ignore) || path.basename(filePath) === ignore
        );
    }

    // Comprehensive directory context methods exactly like gemini-cli
    private async getDirectoryContextString(projectPath: string): Promise<string> {
        const folderStructure = await this.getFolderStructure(projectPath);
        
        const workingDirPreamble = `I'm currently working in the directory: ${projectPath}`;
        
        return `${workingDirPreamble}
Here is the folder structure of the current working directories:

${folderStructure}`;
    }

    private async getFolderStructure(directory: string): Promise<string> {
        const resolvedPath = path.resolve(directory);
        
        try {
            const structureRoot = await this.readFullStructure(resolvedPath);
            
            if (!structureRoot) {
                return `Error: Could not read directory "${resolvedPath}". Check path and permissions.`;
            }

            const structureLines: string[] = [];
            this.formatStructure(structureRoot, '', true, true, structureLines);

            const isTruncated = this.isTruncated(structureRoot);
            let summary = `Showing up to ${this.maxItems} items (files + folders).`;
            
            if (isTruncated) {
                summary += ` Folders or files indicated with ${this.truncationIndicator} contain more items not shown, were ignored, or the display limit (${this.maxItems} items) was reached.`;
            }

            return `${summary}\n\n${resolvedPath}${path.sep}\n${structureLines.join('\n')}`;
        } catch (error) {
            console.error(`Error getting folder structure for ${resolvedPath}:`, error);
            return `Error processing directory "${resolvedPath}": ${error instanceof Error ? error.message : String(error)}`;
        }
    }

    private async readFullStructure(rootPath: string): Promise<FullFolderInfo | null> {
        const rootName = path.basename(rootPath);
        const rootNode: FullFolderInfo = {
            name: rootName,
            path: rootPath,
            files: [],
            subFolders: [],
            totalChildren: 0,
            totalFiles: 0,
        };

        const queue: Array<{ folderInfo: FullFolderInfo; currentPath: string }> = [
            { folderInfo: rootNode, currentPath: rootPath },
        ];
        let currentItemCount = 0;
        const processedPaths = new Set<string>();

        while (queue.length > 0) {
            const { folderInfo, currentPath } = queue.shift()!;

            if (processedPaths.has(currentPath)) {
                continue;
            }
            processedPaths.add(currentPath);

            if (currentItemCount >= this.maxItems) {
                continue;
            }

            let entries: any[];
            try {
                const rawEntries = await fs.readdir(currentPath, { withFileTypes: true });
                entries = rawEntries.sort((a, b) => a.name.localeCompare(b.name));
            } catch (error: any) {
                if (error.code === 'EACCES' || error.code === 'ENOENT') {
                    console.warn(`Warning: Could not read directory ${currentPath}: ${error.message}`);
                    if (currentPath === rootPath && error.code === 'ENOENT') {
                        return null;
                    }
                    continue;
                }
                throw error;
            }

            const filesInCurrentDir: string[] = [];
            const subFoldersInCurrentDir: FullFolderInfo[] = [];

            // Process files first
            for (const entry of entries) {
                if (entry.isFile()) {
                    if (currentItemCount >= this.maxItems) {
                        folderInfo.hasMoreFiles = true;
                        break;
                    }
                    const fileName = entry.name;
                    const filePath = path.join(currentPath, fileName);
                    
                    if (!this.shouldIgnore(filePath)) {
                        filesInCurrentDir.push(fileName);
                        currentItemCount++;
                        folderInfo.totalFiles++;
                        folderInfo.totalChildren++;
                    }
                }
            }
            folderInfo.files = filesInCurrentDir;

            // Process directories
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    if (currentItemCount >= this.maxItems) {
                        folderInfo.hasMoreSubfolders = true;
                        break;
                    }

                    const subFolderName = entry.name;
                    const subFolderPath = path.join(currentPath, subFolderName);

                    const isIgnored = this.defaultIgnoredFolders.has(subFolderName) || this.shouldIgnore(subFolderPath);

                    if (isIgnored) {
                        const ignoredSubFolder: FullFolderInfo = {
                            name: subFolderName,
                            path: subFolderPath,
                            files: [],
                            subFolders: [],
                            totalChildren: 0,
                            totalFiles: 0,
                            isIgnored: true,
                        };
                        subFoldersInCurrentDir.push(ignoredSubFolder);
                        currentItemCount++;
                        folderInfo.totalChildren++;
                        continue;
                    }

                    const subFolderNode: FullFolderInfo = {
                        name: subFolderName,
                        path: subFolderPath,
                        files: [],
                        subFolders: [],
                        totalChildren: 0,
                        totalFiles: 0,
                    };
                    subFoldersInCurrentDir.push(subFolderNode);
                    currentItemCount++;
                    folderInfo.totalChildren++;

                    queue.push({ folderInfo: subFolderNode, currentPath: subFolderPath });
                }
            }
            folderInfo.subFolders = subFoldersInCurrentDir;
        }

        return rootNode;
    }

    private formatStructure(
        node: FullFolderInfo,
        currentIndent: string,
        isLastChildOfParent: boolean,
        isProcessingRootNode: boolean,
        builder: string[]
    ): void {
        const connector = isLastChildOfParent ? '└───' : '├───';

        if (!isProcessingRootNode || node.isIgnored) {
            builder.push(
                `${currentIndent}${connector}${node.name}${path.sep}${node.isIgnored ? this.truncationIndicator : ''}`
            );
        }

        const indentForChildren = isProcessingRootNode
            ? ''
            : currentIndent + (isLastChildOfParent ? '    ' : '│   ');

        // Render files
        const fileCount = node.files.length;
        for (let i = 0; i < fileCount; i++) {
            const isLastFileAmongSiblings =
                i === fileCount - 1 &&
                node.subFolders.length === 0 &&
                !node.hasMoreSubfolders;
            const fileConnector = isLastFileAmongSiblings ? '└───' : '├───';
            builder.push(`${indentForChildren}${fileConnector}${node.files[i]}`);
        }
        if (node.hasMoreFiles) {
            const isLastIndicatorAmongSiblings =
                node.subFolders.length === 0 && !node.hasMoreSubfolders;
            const fileConnector = isLastIndicatorAmongSiblings ? '└───' : '├───';
            builder.push(`${indentForChildren}${fileConnector}${this.truncationIndicator}`);
        }

        // Render subfolders
        const subFolderCount = node.subFolders.length;
        for (let i = 0; i < subFolderCount; i++) {
            const isLastSubfolderAmongSiblings =
                i === subFolderCount - 1 && !node.hasMoreSubfolders;
            this.formatStructure(
                node.subFolders[i],
                indentForChildren,
                isLastSubfolderAmongSiblings,
                false,
                builder
            );
        }
        if (node.hasMoreSubfolders) {
            builder.push(`${indentForChildren}└───${this.truncationIndicator}`);
        }
    }

    private isTruncated(node: FullFolderInfo): boolean {
        if (node.hasMoreFiles || node.hasMoreSubfolders || node.isIgnored) {
            return true;
        }
        for (const sub of node.subFolders) {
            if (this.isTruncated(sub)) {
                return true;
            }
        }
        return false;
    }
}