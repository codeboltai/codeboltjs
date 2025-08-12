import { z } from 'zod';

/**
 * Project Event Schemas for Agent-to-App Communication
 * Based on codeboltjs/src/modules/project.ts module operations
 */

// Base project/setting message schema
export const projectEventBaseSchema = z.object({
  type: z.literal('settingEvent'),
  action: z.string(),
  requestId: z.string(),
});

// Get Project Settings Event Schema
export const getProjectSettingsEventSchema = projectEventBaseSchema.extend({
  action: z.literal('getProjectSettings'),
});

// Get Project Path Event Schema
export const getProjectPathEventSchema = projectEventBaseSchema.extend({
  action: z.literal('getProjectPath'),
});

// Get Repo Map Event Schema
export const getRepoMapEventSchema = projectEventBaseSchema.extend({
  action: z.literal('getRepoMap'),
  message: z.any(),
});

// Get Editor File Status Event Schema
export const getEditorFileStatusEventSchema = projectEventBaseSchema.extend({
  action: z.literal('getEditorFileStatus'),
});

// Run Project Event Schema (different type)
export const runProjectEventSchema = z.object({
  type: z.literal('runProject'),
  requestId: z.string(),
});

// Union of all project event schemas
export const projectEventSchema = z.union([
  getProjectSettingsEventSchema,
  getProjectPathEventSchema,
  getRepoMapEventSchema,
  getEditorFileStatusEventSchema,
  runProjectEventSchema,
]);

// Inferred TypeScript types for events
export type ProjectEventBase = z.infer<typeof projectEventBaseSchema>;
export type GetProjectSettingsEvent = z.infer<typeof getProjectSettingsEventSchema>;
export type GetProjectPathEvent = z.infer<typeof getProjectPathEventSchema>;
export type GetRepoMapEvent = z.infer<typeof getRepoMapEventSchema>;
export type GetEditorFileStatusEvent = z.infer<typeof getEditorFileStatusEventSchema>;
export type RunProjectEvent = z.infer<typeof runProjectEventSchema>;
export type ProjectEvent = z.infer<typeof projectEventSchema>;

