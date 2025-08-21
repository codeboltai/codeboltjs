import { z } from 'zod';
import { AgentMessageBaseSchema } from './baseSchemas';

/**
 * Search Notification Schemas for Agent-to-App Communication
 * Based on notification types in src/types/notification/search.ts
 */

// Base search notification schema
export const searchNotificationBaseSchema = AgentMessageBaseSchema.extend({
  toolUseId: z.string(),
  type: z.literal('searchnotify'),
  action: z.string(),
});

// Search Init Request
export const searchInitRequestSchema = searchNotificationBaseSchema.extend({
  action: z.literal('searchInitRequest'),
  data: z.object({
    engine: z.string().optional(),
  }),
});

// Search Request
export const searchRequestSchema = searchNotificationBaseSchema.extend({
  action: z.literal('searchRequest'),
  data: z.object({
    query: z.string(),
  }),
});

// Get First Link Request
export const getFirstLinkRequestSchema = searchNotificationBaseSchema.extend({
  action: z.literal('getFirstLinkRequest'),
  data: z.object({
    query: z.string(),
  }),
});

// Codebase Search Request
export const codebaseSearchRequestSchema = searchNotificationBaseSchema.extend({
  action: z.literal('codebaseSearchRequest'),
  data: z.object({
    query: z.string(),
    target_directories: z.array(z.string()).optional(),
  }),
});

// Search Init Response
export const searchInitResultSchema = searchNotificationBaseSchema.extend({
  action: z.literal('searchInitResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Search Response
export const searchResultSchema = searchNotificationBaseSchema.extend({
  action: z.literal('searchResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Get First Link Response
export const getFirstLinkResultSchema = searchNotificationBaseSchema.extend({
  action: z.literal('getFirstLinkResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Codebase Search Response
export const codebaseSearchResultSchema = searchNotificationBaseSchema.extend({
  action: z.literal('codebaseSearchResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Union of all search notification schemas
export const searchNotificationSchema = z.union([
  searchInitRequestSchema,
  searchRequestSchema,
  getFirstLinkRequestSchema,
  codebaseSearchRequestSchema,
  searchInitResultSchema,
  searchResultSchema,
  getFirstLinkResultSchema,
  codebaseSearchResultSchema,
]);

// Inferred TypeScript types
export type SearchNotificationBase = z.infer<typeof searchNotificationBaseSchema>;
export type SearchInitRequest = z.infer<typeof searchInitRequestSchema>;
export type SearchRequest = z.infer<typeof searchRequestSchema>;
export type GetFirstLinkRequest = z.infer<typeof getFirstLinkRequestSchema>;
export type CodebaseSearchRequest = z.infer<typeof codebaseSearchRequestSchema>;
export type SearchInitResult = z.infer<typeof searchInitResultSchema>;
export type SearchResult = z.infer<typeof searchResultSchema>;
export type GetFirstLinkResult = z.infer<typeof getFirstLinkResultSchema>;
export type CodebaseSearchResult = z.infer<typeof codebaseSearchResultSchema>;

// Union types for convenience
export type SearchNotification = z.infer<typeof searchNotificationSchema>; 