import { z } from 'zod';
import { AgentMessageBaseSchema } from './baseSchemas';

/**
 * Code Utils Notification Schemas for Agent-to-App Communication
 * Based on notification types in src/types/notification/codeutils.ts
 */

// Base code utils notification schema
export const codeUtilsNotificationBaseSchema = AgentMessageBaseSchema.extend({
  toolUseId: z.string(),
  type: z.literal('codeutilsnotify'),
  action: z.string(),
});

// Grep Search Request
export const grepSearchRequestNotificationSchema = codeUtilsNotificationBaseSchema.extend({
  action: z.literal('grepSearchRequest'),
  data: z.object({
    pattern: z.string(),
    filePath: z.string().optional(),
    recursive: z.boolean().optional(),
    ignoreCase: z.boolean().optional(),
    maxResults: z.number().optional(),
  }),
});

// Grep Search Response
export const grepSearchResponseNotificationSchema = codeUtilsNotificationBaseSchema.extend({
  action: z.literal('grepSearchResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
  data: z.object({
    matches: z.array(z.object({
      file: z.string(),
      line: z.number(),
      content: z.string(),
      matchIndex: z.number().optional(),
      pattern :z.number().optional(),
    })),
    totalMatches: z.number().optional(),
  }).optional(),
});

// Glob Search Request
export const globSearchRequestNotificationSchema = codeUtilsNotificationBaseSchema.extend({
  action: z.literal('globSearchRequest'),
  data: z.object({
    pattern: z.string(),
    basePath: z.string().optional(),
    maxDepth: z.number().optional(),
    includeDirectories: z.boolean().optional(),
  }),
});

// Glob Search Response
export const globSearchResponseNotificationSchema = codeUtilsNotificationBaseSchema.extend({
  action: z.literal('globSearchResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
  data: z.object({
    files: z.array(z.object({
      path: z.string(),
      type: z.enum(['file', 'directory']),
      size: z.number().optional(),
      modified: z.string().optional(),
    })),
    totalFiles: z.number().optional(),
  }).optional(),
});

// Union of all code utils notification schemas
export const codeUtilsNotificationSchema = z.union([
  grepSearchRequestNotificationSchema,
  grepSearchResponseNotificationSchema,
  globSearchRequestNotificationSchema,
  globSearchResponseNotificationSchema,
]);

// Inferred TypeScript types
export type CodeUtilsNotificationBase = z.infer<typeof codeUtilsNotificationBaseSchema>;
export type GrepSearchRequestNotification = z.infer<typeof grepSearchRequestNotificationSchema>;
export type GrepSearchResponseNotification = z.infer<typeof grepSearchResponseNotificationSchema>;
export type GlobSearchRequestNotification = z.infer<typeof globSearchRequestNotificationSchema>;
export type GlobSearchResponseNotification = z.infer<typeof globSearchResponseNotificationSchema>;

// Union types for convenience
export type CodeUtilsNotification = z.infer<typeof codeUtilsNotificationSchema>; 