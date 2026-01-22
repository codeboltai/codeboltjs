/**
 * File operations tools
 */

export { ReadFileTool, type ReadFileToolParams } from './read-file';
export { WriteFileTool, type WriteFileToolParams } from './write-file';
export { EditTool, type EditToolParams } from './edit';
export { ListDirectoryTool, type ListDirectoryToolParams } from './list-directory';
export { ReadManyFilesTool, type ReadManyFilesToolParams } from './read-many-files';

// Create instances for convenience
import { ReadFileTool } from './read-file';
import { WriteFileTool } from './write-file';
import { EditTool } from './edit';
import { ListDirectoryTool } from './list-directory';
import { ReadManyFilesTool } from './read-many-files';

/**
 * All file operation tools
 */
export const fileTools = [
    new ReadFileTool(),
    new WriteFileTool(),
    new EditTool(),
    new ListDirectoryTool(),
    new ReadManyFilesTool(),
];
