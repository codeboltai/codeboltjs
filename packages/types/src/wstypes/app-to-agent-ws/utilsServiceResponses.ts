import { z } from 'zod';

/**
 * Utils Service Response Schemas
 * Messages sent from utils CLI service back to agents
 */

// Edit file and apply diff response schema
export const EditFileAndApplyDiffResponseSchema = z.object({
  type: z.literal('editFileAndApplyDiffResponse'),
  filePath: z.string().optional(),
  diff: z.string().optional(),
  diffIdentifier: z.string().optional(),
  prompt: z.string().optional(),
  applyModel: z.string().optional(),
  result: z.union([
    z.string(),
    z.object({
      status: z.enum(['success', 'error', 'review_started', 'rejected']),
      file: z.string(),
      message: z.string()
    })
  ]).optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Union of all utils service response schemas
export const UtilsServiceResponseSchema = EditFileAndApplyDiffResponseSchema;

// Export with the expected name for the index file
export const utilsServiceResponseSchema = UtilsServiceResponseSchema;

// Type exports
export type EditFileAndApplyDiffResponse = z.infer<typeof EditFileAndApplyDiffResponseSchema>;
export type UtilsServiceResponse = z.infer<typeof UtilsServiceResponseSchema>; 