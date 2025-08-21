import { z } from 'zod';

/**
 * Project Service Response Schemas
 * Messages sent from project CLI service back to agents
 */

// Get project settings response schema
export const GetProjectSettingsResponseSchema = z.object({
  type: z.literal('getProjectSettingsResponse'),
  requestId: z.string(),
  projectSettings: z.record(z.any()).optional(),
  data: z.record(z.any()).optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  error: z.string().optional()
});

// Get project path response schema
export const GetProjectPathResponseSchema = z.object({
  type: z.literal('getProjectPathResponse'),
  requestId: z.string(),
  projectPath: z.string().optional(),
  projectName: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Get repo map response schema
export const GetRepoMapResponseSchema = z.object({
  type: z.literal('getRepoMapResponse'),
  requestId: z.string(),
  repoMap: z.any().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Get editor file status response schema
export const GetEditorFileStatusResponseSchema = z.object({
  type: z.literal('getEditorFileStatusResponse'),
  requestId: z.string(),
  status: z.any().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Union of all project service response schemas
export const ProjectServiceResponseSchema = z.union([
  GetProjectSettingsResponseSchema,
  GetProjectPathResponseSchema,
  GetRepoMapResponseSchema,
  GetEditorFileStatusResponseSchema
]);

// Export with the expected name for the index file
export const projectServiceResponseSchema = ProjectServiceResponseSchema;

// Type exports
export type GetProjectSettingsResponse = z.infer<typeof GetProjectSettingsResponseSchema>;
export type GetProjectPathResponse = z.infer<typeof GetProjectPathResponseSchema>;
export type GetRepoMapResponse = z.infer<typeof GetRepoMapResponseSchema>;
export type GetEditorFileStatusResponse = z.infer<typeof GetEditorFileStatusResponseSchema>;
export type ProjectServiceResponse = z.infer<typeof ProjectServiceResponseSchema>; 