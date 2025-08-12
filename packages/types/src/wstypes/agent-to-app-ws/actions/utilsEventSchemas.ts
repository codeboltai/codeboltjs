import { z } from 'zod';

/**
 * Utils Event Schemas for Agent-to-App Communication
 * Based on codeboltjs/src/modules/utils.ts module operations
 */

// Base utils message schema
export const utilsEventBaseSchema = z.object({
  type: z.literal('fsEvent'),
  action: z.string(),
  requestId: z.string(),
  message: z.object({}).passthrough(),
});

// Edit File And Apply Diff Event Schema
export const editFileAndApplyDiffEventSchema = utilsEventBaseSchema.extend({
  action: z.literal('editFileAndApplyDiff'),
  message: z.object({
    filePath: z.string(),
    diff: z.string(),
    diffIdentifier: z.string(),
    prompt: z.string(),
    applyModel: z.string().optional(),
  }),
});

// Utils event schema (only one action used)
export const utilsEventSchema = editFileAndApplyDiffEventSchema;

// Inferred TypeScript types for events
export type UtilsEventBase = z.infer<typeof utilsEventBaseSchema>;
export type EditFileAndApplyDiffEvent = z.infer<typeof editFileAndApplyDiffEventSchema>;
export type UtilsEvent = z.infer<typeof utilsEventSchema>;

