import { BaseTool } from '../../processor';
import * as fs from 'fs/promises';
import * as path from 'path';

export class FileReadTool extends BaseTool {
    constructor() {
        super('FileRead', 'Read content from a file', {
            filePath: { type: 'string', required: true, description: 'Path to the file to read' }
        });
    }

    async execute(params: any, abortSignal?: AbortSignal): Promise<string> {
        await this.checkAbortSignal(abortSignal);
        
        if (!this.validateParameters(params)) {
            throw new Error('Invalid parameters: filePath is required');
        }

        const { filePath } = params;
        const content = await fs.readFile(filePath, 'utf-8');
        
        return content;
    }

    protected validateParameters(params: any): boolean {
        return params && typeof params.filePath === 'string' && params.filePath.trim() !== '';
    }
}

export class FileWriteTool extends BaseTool {
    constructor() {
        super('FileWrite', 'Write content to a file', {
            filePath: { type: 'string', required: true, description: 'Path to the file to write' },
            content: { type: 'string', required: true, description: 'Content to write to the file' }
        });
    }

    async execute(params: any, abortSignal?: AbortSignal): Promise<string> {
        await this.checkAbortSignal(abortSignal);
        
        if (!this.validateParameters(params)) {
            throw new Error('Invalid parameters: filePath and content are required');
        }

        const { filePath, content } = params;
        
        // Ensure directory exists
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        
        await fs.writeFile(filePath, content, 'utf-8');
        
        return `Successfully wrote ${content.length} characters to ${filePath}`;
    }

    protected validateParameters(params: any): boolean {
        return params && 
               typeof params.filePath === 'string' && 
               params.filePath.trim() !== '' &&
               typeof params.content === 'string';
    }
}

export class FileDeleteTool extends BaseTool {
    constructor() {
        super('FileDelete', 'Delete a file', {
            filePath: { type: 'string', required: true, description: 'Path to the file to delete' }
        });
    }

    async execute(params: any, abortSignal?: AbortSignal): Promise<string> {
        await this.checkAbortSignal(abortSignal);
        
        if (!this.validateParameters(params)) {
            throw new Error('Invalid parameters: filePath is required');
        }

        const { filePath } = params;
        await fs.unlink(filePath);
        
        return `Successfully deleted ${filePath}`;
    }

    protected validateParameters(params: any): boolean {
        return params && typeof params.filePath === 'string' && params.filePath.trim() !== '';
    }
}

export class FileMoveTool extends BaseTool {
    constructor() {
        super('FileMove', 'Move a file from one location to another', {
            sourcePath: { type: 'string', required: true, description: 'Source file path' },
            destinationPath: { type: 'string', required: true, description: 'Destination file path' }
        });
    }

    async execute(params: any, abortSignal?: AbortSignal): Promise<string> {
        await this.checkAbortSignal(abortSignal);
        
        if (!this.validateParameters(params)) {
            throw new Error('Invalid parameters: sourcePath and destinationPath are required');
        }

        const { sourcePath, destinationPath } = params;
        
        // Ensure destination directory exists
        const dir = path.dirname(destinationPath);
        await fs.mkdir(dir, { recursive: true });
        
        await fs.rename(sourcePath, destinationPath);
        
        return `Successfully moved ${sourcePath} to ${destinationPath}`;
    }

    protected validateParameters(params: any): boolean {
        return params && 
               typeof params.sourcePath === 'string' && 
               params.sourcePath.trim() !== '' &&
               typeof params.destinationPath === 'string' && 
               params.destinationPath.trim() !== '';
    }
}

export class FileCopyTool extends BaseTool {
    constructor() {
        super('FileCopy', 'Copy a file from one location to another', {
            sourcePath: { type: 'string', required: true, description: 'Source file path' },
            destinationPath: { type: 'string', required: true, description: 'Destination file path' }
        });
    }

    async execute(params: any, abortSignal?: AbortSignal): Promise<string> {
        await this.checkAbortSignal(abortSignal);
        
        if (!this.validateParameters(params)) {
            throw new Error('Invalid parameters: sourcePath and destinationPath are required');
        }

        const { sourcePath, destinationPath } = params;
        
        // Ensure destination directory exists
        const dir = path.dirname(destinationPath);
        await fs.mkdir(dir, { recursive: true });
        
        await fs.copyFile(sourcePath, destinationPath);
        
        return `Successfully copied ${sourcePath} to ${destinationPath}`;
    }

    protected validateParameters(params: any): boolean {
        return params && 
               typeof params.sourcePath === 'string' && 
               params.sourcePath.trim() !== '' &&
               typeof params.destinationPath === 'string' && 
               params.destinationPath.trim() !== '';
    }
}
