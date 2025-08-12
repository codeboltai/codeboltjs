import { z } from 'zod';

/**
 * Git Event Schemas for Agent-to-App Communication
 * Based on codeboltjs/src/modules/git.ts module operations
 */

// Base git message schema
export const gitEventBaseSchema = z.object({
  type: z.literal('gitEvent'),
  action: z.string(),
  requestId: z.string(),
});

// Git Init Event Schema
export const gitInitEventSchema = gitEventBaseSchema.extend({
  action: z.literal('Init'),
  path: z.string(),
});

// Git Pull Event Schema
export const gitPullEventSchema = gitEventBaseSchema.extend({
  action: z.literal('Pull'),
});

// Git Push Event Schema
export const gitPushEventSchema = gitEventBaseSchema.extend({
  action: z.literal('Push'),
});

// Git Status Event Schema
export const gitStatusEventSchema = gitEventBaseSchema.extend({
  action: z.literal('Status'),
});

// Git Add Event Schema
export const gitAddEventSchema = gitEventBaseSchema.extend({
  action: z.literal('Add'),
});

// Git Commit Event Schema
export const gitCommitEventSchema = gitEventBaseSchema.extend({
  action: z.literal('Commit'),
  message: z.string(),
});

// Git Checkout Event Schema
export const gitCheckoutEventSchema = gitEventBaseSchema.extend({
  action: z.literal('Checkout'),
  branch: z.string(),
});

// Git Branch Event Schema
export const gitBranchEventSchema = gitEventBaseSchema.extend({
  action: z.literal('gitBranch'),
  branch: z.string(),
});

// Git Logs Event Schema
export const gitLogsEventSchema = gitEventBaseSchema.extend({
  action: z.literal('gitLogs'),
  path: z.string(),
});

// Git Diff Event Schema
export const gitDiffEventSchema = gitEventBaseSchema.extend({
  action: z.literal('Diff'),
  commitHash: z.string(),
});

// Union of all git event schemas
export const gitEventSchema = z.union([
  gitInitEventSchema,
  gitPullEventSchema,
  gitPushEventSchema,
  gitStatusEventSchema,
  gitAddEventSchema,
  gitCommitEventSchema,
  gitCheckoutEventSchema,
  gitBranchEventSchema,
  gitLogsEventSchema,
  gitDiffEventSchema,
]);

// Inferred TypeScript types for events
export type GitEventBase = z.infer<typeof gitEventBaseSchema>;
export type GitInitEvent = z.infer<typeof gitInitEventSchema>;
export type GitPullEvent = z.infer<typeof gitPullEventSchema>;
export type GitPushEvent = z.infer<typeof gitPushEventSchema>;
export type GitStatusEvent = z.infer<typeof gitStatusEventSchema>;
export type GitAddEvent = z.infer<typeof gitAddEventSchema>;
export type GitCommitEvent = z.infer<typeof gitCommitEventSchema>;
export type GitCheckoutEvent = z.infer<typeof gitCheckoutEventSchema>;
export type GitBranchEvent = z.infer<typeof gitBranchEventSchema>;
export type GitLogsEvent = z.infer<typeof gitLogsEventSchema>;
export type GitDiffEvent = z.infer<typeof gitDiffEventSchema>;
export type GitEvent = z.infer<typeof gitEventSchema>;

