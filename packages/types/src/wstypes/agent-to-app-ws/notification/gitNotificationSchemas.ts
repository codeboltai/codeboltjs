import { z } from 'zod';
import { AgentMessageBaseSchema } from './baseSchemas';

/**
 * Git Notification Schemas for Agent-to-App Communication
 * Based on notification types in src/types/notification/git.ts
 */

// Base git notification schema
export const gitNotificationBaseSchema = AgentMessageBaseSchema.extend({
  toolUseId: z.string(),
  type: z.literal('gitnotify'),
  action: z.string(),
});

// Request Notification Schemas

// Git Init Request
export const gitInitRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('initRequest'),
  data: z.object({
    path: z.string().optional(),
  }),
});

// Git Init Response
export const gitInitResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('initResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Git Pull Request
export const gitPullRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('pullRequest'),
  data: z.object({
    path: z.string().optional(),
  }),
});

// Git Pull Response
export const gitPullResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('pullResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Git Push Request
export const gitPushRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('pushRequest'),
  data: z.object({
    path: z.string().optional(),
  }),
});

// Git Push Response
export const gitPushResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('pushResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Git Status Request
export const gitStatusRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('statusRequest'),
  data: z.object({
    path: z.string().optional(),
  }),
});

// Git Status Response
export const gitStatusResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('statusResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Git Add Request
export const gitAddRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('addRequest'),
  data: z.object({
    path: z.string().optional(),
    files: z.array(z.string()).optional(),
  }),
});

// Git Add Response
export const gitAddResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('addResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Git Commit Request
export const gitCommitRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('commitRequest'),
  data: z.object({
    path: z.string().optional(),
    message: z.string().optional(),
  }),
});

// Git Commit Response
export const gitCommitResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('commitResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Git Checkout Request
export const gitCheckoutRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('checkoutRequest'),
  data: z.object({
    path: z.string().optional(),
    branchName: z.string().optional(),
  }),
});

// Git Checkout Response
export const gitCheckoutResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('checkoutResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Git Branch Request
export const gitBranchRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('branchRequest'),
  data: z.object({
    path: z.string().optional(),
    branchName: z.string().optional(),
  }),
});

// Git Branch Response
export const gitBranchResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('branchResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Git Logs Request
export const gitLogsRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('logsRequest'),
  data: z.object({
    path: z.string().optional(),
  }),
});

// Git Logs Response
export const gitLogsResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('logsResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Git Diff Request
export const gitDiffRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('diffRequest'),
  data: z.object({
    path: z.string().optional(),
  }),
});

// Git Diff Response
export const gitDiffResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('diffResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Git Remote Add Request
export const gitRemoteAddRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('remoteAddRequest'),
  data: z.object({
    path: z.string().optional(),
    remoteName: z.string().optional(),
    remoteUrl: z.string().optional(),
  }),
});

// Git Remote Add Response
export const gitRemoteAddResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('remoteAddResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Git Remote Remove Request
export const gitRemoteRemoveRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('remoteRemoveRequest'),
  data: z.object({
    path: z.string().optional(),
    remoteName: z.string().optional(),
  }),
});

// Git Remote Remove Response
export const gitRemoteRemoveResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('remoteRemoveResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Git Clone Request
export const gitCloneRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('cloneRequest'),
  data: z.object({
    repoUrl: z.string().optional(),
    targetPath: z.string().optional(),
  }),
});

// Git Clone Response
export const gitCloneResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('cloneResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Union of all git notification schemas
export const gitNotificationSchema = z.union([
  gitInitRequestNotificationSchema,
  gitInitResponseNotificationSchema,
  gitPullRequestNotificationSchema,
  gitPullResponseNotificationSchema,
  gitPushRequestNotificationSchema,
  gitPushResponseNotificationSchema,
  gitStatusRequestNotificationSchema,
  gitStatusResponseNotificationSchema,
  gitAddRequestNotificationSchema,
  gitAddResponseNotificationSchema,
  gitCommitRequestNotificationSchema,
  gitCommitResponseNotificationSchema,
  gitCheckoutRequestNotificationSchema,
  gitCheckoutResponseNotificationSchema,
  gitBranchRequestNotificationSchema,
  gitBranchResponseNotificationSchema,
  gitLogsRequestNotificationSchema,
  gitLogsResponseNotificationSchema,
  gitDiffRequestNotificationSchema,
  gitDiffResponseNotificationSchema,
  gitRemoteAddRequestNotificationSchema,
  gitRemoteAddResponseNotificationSchema,
  gitRemoteRemoveRequestNotificationSchema,
  gitRemoteRemoveResponseNotificationSchema,
  gitCloneRequestNotificationSchema,
  gitCloneResponseNotificationSchema,
]);

// Inferred TypeScript types
export type GitNotificationBase = z.infer<typeof gitNotificationBaseSchema>;
export type GitInitRequestNotification = z.infer<typeof gitInitRequestNotificationSchema>;
export type GitInitResponseNotification = z.infer<typeof gitInitResponseNotificationSchema>;
export type GitPullRequestNotification = z.infer<typeof gitPullRequestNotificationSchema>;
export type GitPullResponseNotification = z.infer<typeof gitPullResponseNotificationSchema>;
export type GitPushRequestNotification = z.infer<typeof gitPushRequestNotificationSchema>;
export type GitPushResponseNotification = z.infer<typeof gitPushResponseNotificationSchema>;
export type GitStatusRequestNotification = z.infer<typeof gitStatusRequestNotificationSchema>;
export type GitStatusResponseNotification = z.infer<typeof gitStatusResponseNotificationSchema>;
export type GitAddRequestNotification = z.infer<typeof gitAddRequestNotificationSchema>;
export type GitAddResponseNotification = z.infer<typeof gitAddResponseNotificationSchema>;
export type GitCommitRequestNotification = z.infer<typeof gitCommitRequestNotificationSchema>;
export type GitCommitResponseNotification = z.infer<typeof gitCommitResponseNotificationSchema>;
export type GitCheckoutRequestNotification = z.infer<typeof gitCheckoutRequestNotificationSchema>;
export type GitCheckoutResponseNotification = z.infer<typeof gitCheckoutResponseNotificationSchema>;
export type GitBranchRequestNotification = z.infer<typeof gitBranchRequestNotificationSchema>;
export type GitBranchResponseNotification = z.infer<typeof gitBranchResponseNotificationSchema>;
export type GitLogsRequestNotification = z.infer<typeof gitLogsRequestNotificationSchema>;
export type GitLogsResponseNotification = z.infer<typeof gitLogsResponseNotificationSchema>;
export type GitDiffRequestNotification = z.infer<typeof gitDiffRequestNotificationSchema>;
export type GitDiffResponseNotification = z.infer<typeof gitDiffResponseNotificationSchema>;
export type GitRemoteAddRequestNotification = z.infer<typeof gitRemoteAddRequestNotificationSchema>;
export type GitRemoteAddResponseNotification = z.infer<typeof gitRemoteAddResponseNotificationSchema>;
export type GitRemoteRemoveRequestNotification = z.infer<typeof gitRemoteRemoveRequestNotificationSchema>;
export type GitRemoteRemoveResponseNotification = z.infer<typeof gitRemoteRemoveResponseNotificationSchema>;
export type GitCloneRequestNotification = z.infer<typeof gitCloneRequestNotificationSchema>;
export type GitCloneResponseNotification = z.infer<typeof gitCloneResponseNotificationSchema>;

// Union types for convenience
export type GitNotification = z.infer<typeof gitNotificationSchema>; 