import { z } from 'zod';

/**
 * Filesystem Event Schemas for Agent-to-App Communication
 * Based on codeboltjs/src/modules/fs.ts module operations
 */

// Base filesystem message schema
export const fsEventBaseSchema = z.object({
  type: z.literal('fsEvent'),
  action: z.string(),
  requestId: z.string(),
  message: z.object({}).passthrough(),
});

// Create File Event Schema
export const createFileEventSchema = fsEventBaseSchema.extend({
  action: z.literal('createFile'),
  message: z.object({
    fileName: z.string(),
    source: z.string(),
    filePath: z.string(),
  }),
});

// Create Folder Event Schema
export const createFolderEventSchema = fsEventBaseSchema.extend({
  action: z.literal('createFolder'),
  message: z.object({
    folderName: z.string(),
    folderPath: z.string(),
  }),
});

// Read File Event Schema
export const readFileEventSchema = fsEventBaseSchema.extend({
  action: z.literal('readFile'),
  message: z.object({
    filePath: z.string(),
  }),
});

// Update File Event Schema
export const updateFileEventSchema = fsEventBaseSchema.extend({
  action: z.literal('updateFile'),
  message: z.object({
    filename: z.string(),
    filePath: z.string(),
    newContent: z.string(),
  }),
});

// Delete File Event Schema
export const deleteFileEventSchema = fsEventBaseSchema.extend({
  action: z.literal('deleteFile'),
  message: z.object({
    filename: z.string(),
    filePath: z.string(),
  }),
});

// Delete Folder Event Schema
export const deleteFolderEventSchema = fsEventBaseSchema.extend({
  action: z.literal('deleteFolder'),
  message: z.object({
    foldername: z.string(),
    folderpath: z.string(),
  }),
});

// File List Event Schema
export const fileListEventSchema = fsEventBaseSchema.extend({
  action: z.literal('fileList'),
  message: z.object({
    folderPath: z.string(),
    isRecursive: z.boolean().optional(),
  }),
});

// List Code Definition Names Event Schema
export const listCodeDefinitionNamesEventSchema = fsEventBaseSchema.extend({
  action: z.literal('listCodeDefinitionNames'),
  message: z.object({
    path: z.string(),
  }),
});

// Search Files Event Schema
export const searchFilesEventSchema = fsEventBaseSchema.extend({
  action: z.literal('searchFiles'),
  message: z.object({
    path: z.string(),
    regex: z.string(),
    filePattern: z.string(),
  }),
});

// Write To File Event Schema
export const writeToFileEventSchema = fsEventBaseSchema.extend({
  action: z.literal('writeToFile'),
  message: z.object({
    relPath: z.string(),
    newContent: z.string(),
  }),
});

// Grep Search Event Schema
export const grepSearchEventSchema = fsEventBaseSchema.extend({
  action: z.literal('grep_search'),
  message: z.object({
    path: z.string(),
    query: z.string(),
    includePattern: z.string().optional(),
    excludePattern: z.string().optional(),
    caseSensitive: z.boolean().optional(),
  }),
});

// File Search Event Schema
export const fileSearchEventSchema = fsEventBaseSchema.extend({
  action: z.literal('file_search'),
  message: z.object({
    query: z.string(),
  }),
});

// Edit File With Diff Event Schema
export const editFileWithDiffEventSchema = fsEventBaseSchema.extend({
  action: z.literal('edit_file_with_diff'),
  message: z.object({
    target_file: z.string(),
    code_edit: z.string(),
    diffIdentifier: z.string(),
    prompt: z.string(),
    applyModel: z.string().optional(),
  }),
});

// Union of all filesystem event schemas
export const fsEventSchema = z.union([
  createFileEventSchema,
  createFolderEventSchema,
  readFileEventSchema,
  updateFileEventSchema,
  deleteFileEventSchema,
  deleteFolderEventSchema,
  fileListEventSchema,
  listCodeDefinitionNamesEventSchema,
  searchFilesEventSchema,
  writeToFileEventSchema,
  grepSearchEventSchema,
  fileSearchEventSchema,
  editFileWithDiffEventSchema,
]);

// Inferred TypeScript types
export type FsEventBase = z.infer<typeof fsEventBaseSchema>;
export type CreateFileEvent = z.infer<typeof createFileEventSchema>;
export type CreateFolderEvent = z.infer<typeof createFolderEventSchema>;
export type ReadFileEvent = z.infer<typeof readFileEventSchema>;
export type UpdateFileEvent = z.infer<typeof updateFileEventSchema>;
export type DeleteFileEvent = z.infer<typeof deleteFileEventSchema>;
export type DeleteFolderEvent = z.infer<typeof deleteFolderEventSchema>;
export type FileListEvent = z.infer<typeof fileListEventSchema>;
export type ListCodeDefinitionNamesEvent = z.infer<typeof listCodeDefinitionNamesEventSchema>;
export type SearchFilesEvent = z.infer<typeof searchFilesEventSchema>;
export type WriteToFileEvent = z.infer<typeof writeToFileEventSchema>;
export type GrepSearchEvent = z.infer<typeof grepSearchEventSchema>;
export type FileSearchEvent = z.infer<typeof fileSearchEventSchema>;
export type EditFileWithDiffEvent = z.infer<typeof editFileWithDiffEventSchema>;
export type FsEvent = z.infer<typeof fsEventSchema>;