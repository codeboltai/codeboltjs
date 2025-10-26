import { z } from 'zod';
import { AgentMessageBaseSchema } from './baseSchemas';

/**
 * Search Notification Schemas for Agent-to-App Communication
 * Based on search functionality in src/main/server/codeboltTools/tools/
 */

// Base search notification schema
export const searchNotificationBaseSchema = AgentMessageBaseSchema.extend({
  toolUseId: z.string(),
  type: z.literal('searchnotify'),
  action: z.string(),
});

// Codebase Search Request
export const codebaseSearchRequestSchema = searchNotificationBaseSchema.extend({
  action: z.literal('codebaseSearchRequest'),
  data: z.object({
    query: z.string(),
    target_directories: z.array(z.string()).optional(),
  }),
});

// Codebase Search Response
export const codebaseSearchResultSchema = searchNotificationBaseSchema.extend({
  action: z.literal('codebaseSearchResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
  data: z.object({
    query: z.string(),
    results: z.array(z.object({
      file: z.string(),
      content: z.string(),
      line: z.number().optional(),
      score: z.number().optional(),
    })).optional(),
    totalResults: z.number().optional(),
  }).optional(),
});

// Search Files Request
export const searchFilesRequestSchema = searchNotificationBaseSchema.extend({
  action: z.literal('searchFilesRequest'),
  data: z.object({
    path: z.string(),
    regex: z.string(),
    filePattern: z.string().optional(),
  }),
});

// Search Files Response
export const searchFilesResultSchema = searchNotificationBaseSchema.extend({
  action: z.literal('searchFilesResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
  data: z.object({
    path: z.string(),
    regex: z.string(),
    results: z.array(z.object({
      file: z.string(),
      matches: z.array(z.object({
        line: z.number(),
        content: z.string(),
        matchIndex: z.number().optional(),
      })),
    })).optional(),
    totalMatches: z.number().optional(),
  }).optional(),
});

// Search MCP Tool Request
export const searchMcpToolRequestSchema = searchNotificationBaseSchema.extend({
  action: z.literal('searchMcpToolRequest'),
  data: z.object({
    query: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});

// Search MCP Tool Response
export const searchMcpToolResultSchema = searchNotificationBaseSchema.extend({
  action: z.literal('searchMcpToolResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
  data: z.object({
    query: z.string(),
    tools: z.array(z.object({
      name: z.string(),
      description: z.string(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })).optional(),
    totalTools: z.number().optional(),
  }).optional(),
});

// Web Search Request (for general web searches)
export const webSearchRequestSchema = searchNotificationBaseSchema.extend({
  action: z.literal('webSearchRequest'),
  data: z.object({
    query: z.string(),
    maxResults: z.number().optional(),
    searchEngine: z.string().optional(),
  }),
});

// Web Search Response
export const webSearchResultSchema = searchNotificationBaseSchema.extend({
  action: z.literal('webSearchResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
  data: z.object({
    query: z.string(),
    results: z.array(z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string(),
      rank: z.number().optional(),
    })).optional(),
    totalResults: z.number().optional(),
    searchTime: z.number().optional(),
  }).optional(),
});

// Get First Link Request (for getting the first search result)
export const getFirstLinkRequestSchema = searchNotificationBaseSchema.extend({
  action: z.literal('getFirstLinkRequest'),
  data: z.object({
    query: z.string(),
  }),
});

// Get First Link Response
export const getFirstLinkResultSchema = searchNotificationBaseSchema.extend({
  action: z.literal('getFirstLinkResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
  data: z.object({
    query: z.string(),
    url: z.string().optional(),
    title: z.string().optional(),
    snippet: z.string().optional(),
  }).optional(),
});

// Folder Search Request (for searching within specific folders)
export const folderSearchRequestSchema = searchNotificationBaseSchema.extend({
  action: z.literal('folderSearchRequest'),
  data: z.object({
    folderPath: z.string(),
    query: z.string(),
    recursive: z.boolean().optional(),
    fileTypes: z.array(z.string()).optional(),
  }),
});

// Folder Search Response
export const folderSearchResultSchema = searchNotificationBaseSchema.extend({
  action: z.literal('folderSearchResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
  data: z.object({
    folderPath: z.string(),
    query: z.string(),
    results: z.array(z.object({
      file: z.string(),
      matches: z.array(z.object({
        line: z.number(),
        content: z.string(),
        matchIndex: z.number().optional(),
      })),
    })).optional(),
    totalMatches: z.number().optional(),
    filesSearched: z.number().optional(),
  }).optional(),
});

// List Directory for Search Request (for listing directory contents during search operations)
export const listDirectoryForSearchRequestSchema = searchNotificationBaseSchema.extend({
  action: z.literal('listDirectoryForSearchRequest'),
  data: z.object({
    dirPath: z.string(),
    includeHidden: z.boolean().optional(),
    maxDepth: z.number().optional(),
  }),
});

// List Directory for Search Response
export const listDirectoryForSearchResultSchema = searchNotificationBaseSchema.extend({
  action: z.literal('listDirectoryForSearchResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
  data: z.object({
    dirPath: z.string(),
    entries: z.array(z.object({
      name: z.string(),
      type: z.enum(['file', 'directory']),
      size: z.number().optional(),
      modified: z.string().optional(),
      path: z.string(),
    })).optional(),
    totalEntries: z.number().optional(),
  }).optional(),
});

// Grep Search Request
export const grepSearchRequestSchema = searchNotificationBaseSchema.extend({
  action: z.literal('grepSearchRequest'),
  data: z.object({
    pattern: z.string(),
    path: z.string().optional(),
  }),
});

// Grep Search Response
export const grepSearchResultSchema = searchNotificationBaseSchema.extend({
  action: z.literal('grepSearchResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
  data: z.object({
    pattern: z.string(),
    path: z.string().optional(),
    results: z.array(z.object({
      file: z.string(),
      line: z.number(),
      content: z.string(),
    })).optional(),
    totalMatches: z.number().optional(),
    filesWithMatches: z.number().optional(),
  }).optional(),
});

// Glob Search Request
export const globSearchRequestSchema = searchNotificationBaseSchema.extend({
  action: z.literal('globSearchRequest'),
  data: z.object({
    pattern: z.string(),
    path: z.string().optional(),
  }),
});

// Glob Search Response
export const globSearchResultSchema = searchNotificationBaseSchema.extend({
  action: z.literal('globSearchResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
  data: z.object({
    pattern: z.string(),
    path: z.string().optional(),
    results: z.array(z.object({
      path: z.string(),
    })).optional(),
    totalFiles: z.number().optional(),
  }).optional(),
});

// Union of all search notification schemas
export const searchNotificationSchema = z.union([
  codebaseSearchRequestSchema,
  codebaseSearchResultSchema,
  searchFilesRequestSchema,
  searchFilesResultSchema,
  searchMcpToolRequestSchema,
  searchMcpToolResultSchema,
  webSearchRequestSchema,
  webSearchResultSchema,
  getFirstLinkRequestSchema,
  getFirstLinkResultSchema,
  folderSearchRequestSchema,
  folderSearchResultSchema,
  listDirectoryForSearchRequestSchema,
  listDirectoryForSearchResultSchema,
  grepSearchRequestSchema,
  grepSearchResultSchema,
  globSearchRequestSchema,
  globSearchResultSchema,
]);

// Inferred TypeScript types
export type SearchNotificationBase = z.infer<typeof searchNotificationBaseSchema>;
export type CodebaseSearchRequest = z.infer<typeof codebaseSearchRequestSchema>;
export type CodebaseSearchResult = z.infer<typeof codebaseSearchResultSchema>;
export type SearchFilesRequest = z.infer<typeof searchFilesRequestSchema>;
export type SearchFilesResult = z.infer<typeof searchFilesResultSchema>;
export type SearchMcpToolRequest = z.infer<typeof searchMcpToolRequestSchema>;
export type SearchMcpToolResult = z.infer<typeof searchMcpToolResultSchema>;
export type WebSearchRequest = z.infer<typeof webSearchRequestSchema>;
export type WebSearchResult = z.infer<typeof webSearchResultSchema>;
export type GetFirstLinkRequest = z.infer<typeof getFirstLinkRequestSchema>;
export type GetFirstLinkResult = z.infer<typeof getFirstLinkResultSchema>;
export type FolderSearchRequest = z.infer<typeof folderSearchRequestSchema>;
export type FolderSearchResult = z.infer<typeof folderSearchResultSchema>;
export type ListDirectoryForSearchRequest = z.infer<typeof listDirectoryForSearchRequestSchema>;
export type ListDirectoryForSearchResult = z.infer<typeof listDirectoryForSearchResultSchema>;
export type GrepSearchRequest = z.infer<typeof grepSearchRequestSchema>;
export type GrepSearchResult = z.infer<typeof grepSearchResultSchema>;
export type GlobSearchRequest = z.infer<typeof globSearchRequestSchema>;
export type GlobSearchResult = z.infer<typeof globSearchResultSchema>;

// Union types for convenience
export type SearchNotification = z.infer<typeof searchNotificationSchema>; 