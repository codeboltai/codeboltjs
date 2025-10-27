import { z } from 'zod';
import { AgentMessageBaseSchema } from './baseSchemas';

/**
 * File System Notification Schemas for Agent-to-App Communication
 * Based on notification types in src/types/notification/fs.ts
 */

// Base file system notification schema
export const fsNotificationBaseSchema = AgentMessageBaseSchema.extend({
  toolUseId: z.string(),
  type: z.literal('fsnotify'),
  action: z.string(),
});

// Request Notification Schemas

// File Create Request
export const fileCreateRequestNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('createFileRequest'),
  data: z.object({
    fileName: z.string(),
    source: z.string(),
    filePath: z.string(),
  }),
});

// File Create Response
export const fileCreateResponseNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('createFileResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Folder Create Request
export const folderCreateRequestNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('createFolderRequest'),
  data: z.object({
    folderName: z.string(),
    folderPath: z.string(),
  }),
});

// Folder Create Response
export const folderCreateResponseNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('createFolderResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// File Read Request
export const fileReadRequestNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('readFileRequest'),
  data: z.object({
    filePath: z.string(),
    startLine: z.string().optional(),
    endLine: z.string().optional(),
  }),
});

// File Read Response
export const fileReadResponseNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('readFileResult'),
  data: z.object({
    filePath: z.string(),
    content: z.union([z.string(), z.any()])
  }),
  isError: z.boolean().optional(),
});

// File Read Error
export const fileReadErrorNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('readFileError'),
  data: z.object({
    filePath: z.string(),
    error: z.string(),
    errorCode: z.string().optional(),
  }),
  isError: z.literal(true),
});

// File Edit Request
export const fileEditRequestNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('updateFileRequest'),
  data: z.object({
    fileName: z.string(),
    filePath: z.string(),
    newContent: z.string(),
  }),
});

// File Edit Response
export const fileEditResponseNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('updateFileResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// File Delete Request
export const fileDeleteRequestNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('deleteFileRequest'),
  data: z.object({
    fileName: z.string(),
    filePath: z.string(),
  }),
});

// File Delete Response
export const fileDeleteResponseNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('deleteFileResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Folder Delete Request
export const folderDeleteRequestNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('deleteFolderRequest'),
  data: z.object({
    folderName: z.string(),
    folderPath: z.string(),
  }),
});

// Folder Delete Response
export const folderDeleteResponseNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('deleteFolderResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// List Directory Request
export const listDirectoryRequestNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('listDirectoryRequest'),
  data: z.object({
    dirPath: z.string(),
  }),
});

// List Directory Response
export const listDirectoryResponseNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('listDirectoryResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Write to File Request
export const writeToFileRequestNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('writeToFileRequest'),
  data: z.object({
    filePath: z.string(),
    text: z.string(),
  }),
});

// Write to File Response
export const writeToFileResponseNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('writeToFileResult'),
  data: z.object({
    filePath: z.string(),
    content: z.string(),
  }),
  isError: z.boolean().optional(),
});

// Append to File Request
export const appendToFileRequestNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('appendToFileRequest'),
  data: z.object({
    filePath: z.string(),
    text: z.string(),
  }),
});

// Append to File Response
export const appendToFileResponseNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('appendToFileResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Copy File Request
export const copyFileRequestNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('copyFileRequest'),
  data: z.object({
    sourceFile: z.string(),
    destinationFile: z.string(),
  }),
});

// Copy File Response
export const copyFileResponseNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('copyFileResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Move File Request
export const moveFileRequestNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('moveFileRequest'),
  data: z.object({
    sourceFile: z.string(),
    destinationFile: z.string(),
  }),
});

// Move File Response
export const moveFileResponseNotificationSchema = fsNotificationBaseSchema.extend({
  action: z.literal('moveFileResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Union of all file system notification schemas
export const fsNotificationSchema = z.union([
  fileCreateRequestNotificationSchema,
  fileCreateResponseNotificationSchema,
  folderCreateRequestNotificationSchema,
  folderCreateResponseNotificationSchema,
  fileReadRequestNotificationSchema,
  fileReadResponseNotificationSchema,
  fileReadErrorNotificationSchema,
  fileEditRequestNotificationSchema,
  fileEditResponseNotificationSchema,
  fileDeleteRequestNotificationSchema,
  fileDeleteResponseNotificationSchema,
  folderDeleteRequestNotificationSchema,
  folderDeleteResponseNotificationSchema,
  listDirectoryRequestNotificationSchema,
  listDirectoryResponseNotificationSchema,
  writeToFileRequestNotificationSchema,
  writeToFileResponseNotificationSchema,
  appendToFileRequestNotificationSchema,
  appendToFileResponseNotificationSchema,
  copyFileRequestNotificationSchema,
  copyFileResponseNotificationSchema,
  moveFileRequestNotificationSchema,
  moveFileResponseNotificationSchema,
]);

// Inferred TypeScript types
export type FsNotificationBase = z.infer<typeof fsNotificationBaseSchema>;
export type FileCreateRequestNotification = z.infer<typeof fileCreateRequestNotificationSchema>;
export type FileCreateResponseNotification = z.infer<typeof fileCreateResponseNotificationSchema>;
export type FolderCreateRequestNotification = z.infer<typeof folderCreateRequestNotificationSchema>;
export type FolderCreateResponseNotification = z.infer<typeof folderCreateResponseNotificationSchema>;
export type FileReadRequestNotification = z.infer<typeof fileReadRequestNotificationSchema>;
export type FileReadResponseNotification = z.infer<typeof fileReadResponseNotificationSchema>;
export type FileReadErrorNotification = z.infer<typeof fileReadErrorNotificationSchema>;
export type FileEditRequestNotification = z.infer<typeof fileEditRequestNotificationSchema>;
export type FileEditResponseNotification = z.infer<typeof fileEditResponseNotificationSchema>;
export type FileDeleteRequestNotification = z.infer<typeof fileDeleteRequestNotificationSchema>;
export type FileDeleteResponseNotification = z.infer<typeof fileDeleteResponseNotificationSchema>;
export type FolderDeleteRequestNotification = z.infer<typeof folderDeleteRequestNotificationSchema>;
export type FolderDeleteResponseNotification = z.infer<typeof folderDeleteResponseNotificationSchema>;
export type ListDirectoryRequestNotification = z.infer<typeof listDirectoryRequestNotificationSchema>;
export type ListDirectoryResponseNotification = z.infer<typeof listDirectoryResponseNotificationSchema>;
export type WriteToFileRequestNotification = z.infer<typeof writeToFileRequestNotificationSchema>;
export type WriteToFileResponseNotification = z.infer<typeof writeToFileResponseNotificationSchema>;
export type AppendToFileRequestNotification = z.infer<typeof appendToFileRequestNotificationSchema>;
export type AppendToFileResponseNotification = z.infer<typeof appendToFileResponseNotificationSchema>;
export type CopyFileRequestNotification = z.infer<typeof copyFileRequestNotificationSchema>;
export type CopyFileResponseNotification = z.infer<typeof copyFileResponseNotificationSchema>;
export type MoveFileRequestNotification = z.infer<typeof moveFileRequestNotificationSchema>;
export type MoveFileResponseNotification = z.infer<typeof moveFileResponseNotificationSchema>;

// Union types for convenience
export type FileSystemRequestNotification = z.infer<typeof fsNotificationSchema>;
export type FsNotification = z.infer<typeof fsNotificationSchema>; 