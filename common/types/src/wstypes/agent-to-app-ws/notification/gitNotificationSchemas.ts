import { z } from 'zod';
import { AgentMessageBaseSchema } from './baseSchemas';

// Git-specific types for proper typing
const GitFileStatusSchema = z.object({
  path: z.string(),
  index: z.string(),
  working_dir: z.string(),
});

const StatusResultSchema = z.object({
  not_added: z.array(z.string()),
  conflicted: z.array(z.string()),
  created: z.array(z.string()),
  deleted: z.array(z.string()),
  modified: z.array(z.string()),
  renamed: z.array(z.string()),
  files: z.array(GitFileStatusSchema),
  staged: z.array(z.string()),
  ahead: z.number(),
  behind: z.number(),
  current: z.string().nullable(),
  tracking: z.string().nullable(),
  detached: z.boolean(),
});

const CommitSummarySchema = z.object({
  hash: z.string(),
  date: z.string(),
  message: z.string(),
  author_name: z.string(),
  author_email: z.string(),
  branches: z.array(z.string()).optional(),
  branch: z.string().optional(),
});

const GitLogsResultSchema = z.object({
  all: z.array(CommitSummarySchema),
  latest: CommitSummarySchema.optional(),
  total: z.number(),
});

const GitBranchSummarySchema = z.object({
  current: z.string().nullable(),
  all: z.array(z.string()),
  branches: z.record(z.object({
    current: z.boolean(),
    name: z.string(),
    commit: z.string(),
    label: z.string(),
  })),
});

// Specific response content types for each git operation
const GitInitResponseContentSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

const GitStatusResponseContentSchema = z.union([
  StatusResultSchema,
  z.object({
    success: z.boolean(),
    data: StatusResultSchema,
    message: z.string().optional(),
  }),
]);

const GitLogsResponseContentSchema = z.union([
  GitLogsResultSchema,
  z.object({
    success: z.boolean(),
    data: GitLogsResultSchema,
    message: z.string().optional(),
  }),
]);

// Enhanced git diff file schema with comprehensive metadata
const GitDiffFileSchema = z.object({
  file: z.string(), // File path
  changes: z.number(), // Total number of changes
  insertions: z.number(), // Lines added
  deletions: z.number(), // Lines removed
  binary: z.boolean().default(false), // Whether file is binary
  status: z.enum(['added', 'modified', 'deleted', 'renamed', 'copied']).optional(), // File change status
  oldFile: z.string().optional(), // Original file path (for renames)
});

// Comprehensive git diff result schema
const GitDiffResultSchema = z.object({
  files: z.array(GitDiffFileSchema), // Array of changed files with details
  insertions: z.number(), // Total insertions across all files
  deletions: z.number(), // Total deletions across all files
  changed: z.number(), // Total number of files changed
  diff: z.string().optional(), // Raw diff text
  stats: z.string().optional(), // Git stats summary
  metadata: z.object({
    totalChanges: z.number(),
    additions: z.number(),
    deletions: z.number(),
    commitHash: z.string().optional(),
    parentCommit: z.string().optional(),
  }).optional(),
});

const GitDiffResponseContentSchema = z.union([
  z.string(), // Raw diff string (for simple cases)
  GitDiffResultSchema, // Structured diff result
  z.object({
    success: z.boolean(),
    data: z.union([
      z.string(), // Raw diff
      GitDiffResultSchema, // Structured diff
    ]),
    commitHash: z.string().optional(),
    message: z.string().optional(),
  }),
]);

const GitBranchResponseContentSchema = z.union([
  GitBranchSummarySchema,
  z.object({
    success: z.boolean(),
    data: GitBranchSummarySchema.optional(),
    message: z.string().optional(),
  }),
]);

const GitSimpleResponseContentSchema = z.union([
  z.string(),
  z.object({
    success: z.boolean(),
    message: z.string().optional(),
  }),
]);

const GitStashListResponseContentSchema = z.union([
  z.array(z.object({
    index: z.number(),
    message: z.string(),
    hash: z.string(),
  })),
  z.object({
    success: z.boolean(),
    data: z.array(z.object({
      index: z.number(),
      message: z.string(),
      hash: z.string(),
    })),
    message: z.string().optional(),
  }),
]);

const GitTagListResponseContentSchema = z.union([
  z.array(z.string()),
  z.object({
    success: z.boolean(),
    data: z.array(z.string()),
    message: z.string().optional(),
  }),
]);

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
  content: GitInitResponseContentSchema,
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
  content: GitSimpleResponseContentSchema,
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
  content: GitSimpleResponseContentSchema,
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
  content: GitStatusResponseContentSchema,
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
  content: GitSimpleResponseContentSchema,
  isError: z.boolean().optional(),
});

// Git Commit Request
export const gitCommitRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('commitRequest'),
  data: z.object({
    path: z.string().optional(),
    message: z.string().min(1, "Commit message is required").max(72, "Commit message should be 72 characters or less"),
  }),
});

// Git Commit Response
export const gitCommitResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('commitResult'),
  content: GitSimpleResponseContentSchema,
  isError: z.boolean().optional(),
});

// Git Checkout Request
export const gitCheckoutRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('checkoutRequest'),
  data: z.object({
    path: z.string().optional(),
    branchName: z.string().min(1, "Branch name is required for checkout"),
  }),
});

// Git Checkout Response
export const gitCheckoutResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('checkoutResult'),
  content: GitSimpleResponseContentSchema,
  isError: z.boolean().optional(),
});

// Git Branch Request
export const gitBranchRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('branchRequest'),
  data: z.object({
    path: z.string().optional(),
    branchName: z.string().min(1, "Branch name is required").regex(/^[a-zA-Z0-9\-_\/]+$/, "Branch name contains invalid characters"),
  }),
});

// Git Branch Response
export const gitBranchResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('branchResult'),
  content: GitBranchResponseContentSchema,
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
  content: GitLogsResponseContentSchema,
  isError: z.boolean().optional(),
});

// Git Diff Request
export const gitDiffRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('diffRequest'),
  data: z.object({
    path: z.string().optional(),
    commitHash: z.string().optional(), // Specific commit to diff
    baseCommit: z.string().optional(), // Base commit for comparison
    targetCommit: z.string().optional(), // Target commit for comparison
    files: z.array(z.string()).optional(), // Specific files to diff
    options: z.object({
      nameOnly: z.boolean().default(false), // Only show file names
      stats: z.boolean().default(true), // Include change statistics
      numstat: z.boolean().default(false), // Show numerical stats
      unified: z.number().optional(), // Number of context lines
      ignoreWhitespace: z.boolean().default(false), // Ignore whitespace changes
    }).optional(),
  }),
});

// Git Diff Response
export const gitDiffResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('diffResult'),
  content: GitDiffResponseContentSchema,
  isError: z.boolean().optional(),
});

// Git Remote Add Request
export const gitRemoteAddRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('remoteAddRequest'),
  data: z.object({
    path: z.string().optional(),
    remoteName: z.string().min(1, "Remote name is required").default("origin"),
    remoteUrl: z.string().url("Invalid remote URL format").or(z.string().regex(/^git@[\w\.-]+:[\w\/-]+\.git$/, "Invalid SSH git URL format")),
  }),
});

// Git Remote Add Response
export const gitRemoteAddResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('remoteAddResult'),
  content: GitSimpleResponseContentSchema,
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
  content: GitSimpleResponseContentSchema,
  isError: z.boolean().optional(),
});

// Git Clone Request
export const gitCloneRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('cloneRequest'),
  data: z.object({
    repoUrl: z.string().url("Invalid repository URL format").or(z.string().regex(/^git@[\w\.-]+:[\w\/-]+\.git$/, "Invalid SSH git URL format")),
    targetPath: z.string().min(1, "Target path is required"),
  }),
});

// Git Clone Response
export const gitCloneResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('cloneResult'),
  content: GitSimpleResponseContentSchema,
  isError: z.boolean().optional(),
});

// Git Merge Request
export const gitMergeRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('mergeRequest'),
  data: z.object({
    path: z.string().optional(),
    branchName: z.string().optional(),
    targetBranch: z.string().optional(),
  }),
});

// Git Merge Response
export const gitMergeResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('mergeResult'),
  content: GitSimpleResponseContentSchema,
  isError: z.boolean().optional(),
});

// Git Rebase Request
export const gitRebaseRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('rebaseRequest'),
  data: z.object({
    path: z.string().optional(),
    targetBranch: z.string().optional(),
  }),
});

// Git Rebase Response
export const gitRebaseResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('rebaseResult'),
  content: GitSimpleResponseContentSchema,
  isError: z.boolean().optional(),
});

// Git Stash Request
export const gitStashRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('stashRequest'),
  data: z.object({
    path: z.string().optional(),
    message: z.string().optional(),
    includeUntracked: z.boolean().default(false),
  }),
});

// Git Stash Response
export const gitStashResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('stashResult'),
  content: GitSimpleResponseContentSchema,
  isError: z.boolean().optional(),
});

// Git Stash Apply Request
export const gitStashApplyRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('stashApplyRequest'),
  data: z.object({
    path: z.string().optional(),
    stashName: z.string().optional(),
  }),
});

// Git Stash Apply Response
export const gitStashApplyResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('stashApplyResult'),
  content: GitSimpleResponseContentSchema,
  isError: z.boolean().optional(),
});

// Git Stash List Request
export const gitStashListRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('stashListRequest'),
  data: z.object({
    path: z.string().optional(),
  }),
});

// Git Stash List Response
export const gitStashListResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('stashListResult'),
  content: GitStashListResponseContentSchema,
  isError: z.boolean().optional(),
});

// Git Reset Request
export const gitResetRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('resetRequest'),
  data: z.object({
    path: z.string().optional(),
    mode: z.enum(['soft', 'mixed', 'hard']).default('mixed'),
    target: z.string().optional(),
  }),
});

// Git Reset Response
export const gitResetResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('resetResult'),
  content: GitSimpleResponseContentSchema,
  isError: z.boolean().optional(),
});

// Git Tag Request
export const gitTagRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('tagRequest'),
  data: z.object({
    path: z.string().optional(),
    tagName: z.string().min(1, "Tag name is required").regex(/^[^\s]+$/, "Tag name cannot contain spaces"),
    message: z.string().optional(),
    commit: z.string().optional(),
  }),
});

// Git Tag Response
export const gitTagResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('tagResult'),
  content: GitSimpleResponseContentSchema,
  isError: z.boolean().optional(),
});

// Git Tag List Request
export const gitTagListRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('tagListRequest'),
  data: z.object({
    path: z.string().optional(),
  }),
});

// Git Tag List Response
export const gitTagListResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('tagListResult'),
  content: GitTagListResponseContentSchema,
  isError: z.boolean().optional(),
});

// Git Fetch Request
export const gitFetchRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('fetchRequest'),
  data: z.object({
    path: z.string().optional(),
    remote: z.string().optional(),
    branch: z.string().optional(),
  }),
});

// Git Fetch Response
export const gitFetchResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('fetchResult'),
  content: GitSimpleResponseContentSchema,
  isError: z.boolean().optional(),
});

// Git Revert Request
export const gitRevertRequestNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('revertRequest'),
  data: z.object({
    path: z.string().optional(),
    commit: z.string().min(1, "Commit hash is required for revert"),
    noCommit: z.boolean().default(false),
  }),
});

// Git Revert Response
export const gitRevertResponseNotificationSchema = gitNotificationBaseSchema.extend({
  action: z.literal('revertResult'),
  content: GitSimpleResponseContentSchema,
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
  gitMergeRequestNotificationSchema,
  gitMergeResponseNotificationSchema,
  gitRebaseRequestNotificationSchema,
  gitRebaseResponseNotificationSchema,
  gitStashRequestNotificationSchema,
  gitStashResponseNotificationSchema,
  gitStashApplyRequestNotificationSchema,
  gitStashApplyResponseNotificationSchema,
  gitStashListRequestNotificationSchema,
  gitStashListResponseNotificationSchema,
  gitResetRequestNotificationSchema,
  gitResetResponseNotificationSchema,
  gitTagRequestNotificationSchema,
  gitTagResponseNotificationSchema,
  gitTagListRequestNotificationSchema,
  gitTagListResponseNotificationSchema,
  gitFetchRequestNotificationSchema,
  gitFetchResponseNotificationSchema,
  gitRevertRequestNotificationSchema,
  gitRevertResponseNotificationSchema,
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
export type GitMergeRequestNotification = z.infer<typeof gitMergeRequestNotificationSchema>;
export type GitMergeResponseNotification = z.infer<typeof gitMergeResponseNotificationSchema>;
export type GitRebaseRequestNotification = z.infer<typeof gitRebaseRequestNotificationSchema>;
export type GitRebaseResponseNotification = z.infer<typeof gitRebaseResponseNotificationSchema>;
export type GitStashRequestNotification = z.infer<typeof gitStashRequestNotificationSchema>;
export type GitStashResponseNotification = z.infer<typeof gitStashResponseNotificationSchema>;
export type GitStashApplyRequestNotification = z.infer<typeof gitStashApplyRequestNotificationSchema>;
export type GitStashApplyResponseNotification = z.infer<typeof gitStashApplyResponseNotificationSchema>;
export type GitStashListRequestNotification = z.infer<typeof gitStashListRequestNotificationSchema>;
export type GitStashListResponseNotification = z.infer<typeof gitStashListResponseNotificationSchema>;
export type GitResetRequestNotification = z.infer<typeof gitResetRequestNotificationSchema>;
export type GitResetResponseNotification = z.infer<typeof gitResetResponseNotificationSchema>;
export type GitTagRequestNotification = z.infer<typeof gitTagRequestNotificationSchema>;
export type GitTagResponseNotification = z.infer<typeof gitTagResponseNotificationSchema>;
export type GitTagListRequestNotification = z.infer<typeof gitTagListRequestNotificationSchema>;
export type GitTagListResponseNotification = z.infer<typeof gitTagListResponseNotificationSchema>;
export type GitFetchRequestNotification = z.infer<typeof gitFetchRequestNotificationSchema>;
export type GitFetchResponseNotification = z.infer<typeof gitFetchResponseNotificationSchema>;
export type GitRevertRequestNotification = z.infer<typeof gitRevertRequestNotificationSchema>;
export type GitRevertResponseNotification = z.infer<typeof gitRevertResponseNotificationSchema>;

// Union types for convenience
export type GitNotification = z.infer<typeof gitNotificationSchema>; 