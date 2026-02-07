// Review Merge API types

import type { Pheromone, Lock, UnlockRequest } from './jobs';

export type ReviewRequestStatus =
  | 'draft'
  | 'pending_review'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'review_completed'
  | 'merged'
  | 'rejected'
  | 'closed';

export type ReviewRequestType = 'review' | 'review_merge';
export type MergeStrategy = 'patch' | 'git_worktree';
export type ReviewScope = 'agent' | 'swarm' | 'orchestrator';

export interface WorktreeDetails {
  worktreePath: string;
  branchName: string;
  baseBranch?: string;
  commitHash?: string;
}

export interface MergeConfig {
  strategy: MergeStrategy;
  worktreeDetails?: WorktreeDetails;
  patchContent?: string;
}

export interface MergeResult {
  success: boolean;
  message?: string;
  conflictFiles?: string[];
  appliedAt?: string;
}

export interface ReviewFeedback {
  id: string;
  agentId: string;
  agentName: string;
  type: 'approve' | 'request_changes' | 'comment';
  comment: string;
  createdAt: string;
}

export interface ReviewProposedJob {
  id: string;
  name: string;
  description: string;
  proposedBy: string;
  proposedByName?: string;
  proposedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'converted';
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  convertedJobId?: string;
  convertedAt?: string;
}

export interface ReviewMergeRequest {
  id: string;
  type: ReviewRequestType;
  status: ReviewRequestStatus;
  initialTask: string;
  taskDescription?: string;
  agentId: string;
  agentName: string;
  swarmId?: string;
  scope?: ReviewScope;
  scopeInstanceId?: string;
  title: string;
  description: string;
  majorFilesChanged: string[];
  diffPatch: string;
  changesFilePath?: string;
  mergeConfig?: MergeConfig;
  issuesFaced?: string[];
  remainingTasks?: string[];
  reviews: ReviewFeedback[];
  linkedJobIds: string[];
  pheromones?: Pheromone[];
  lock?: Lock;
  unlockRequests?: UnlockRequest[];
  proposedJobs?: ReviewProposedJob[];
  mergedBy?: string;
  mergeResult?: MergeResult;
  createdAt: string;
  updatedAt: string;
  mergedAt?: string;
  closedAt?: string;
}

export interface CreateReviewMergeRequest {
  type: ReviewRequestType;
  initialTask: string;
  title: string;
  description: string;
  majorFilesChanged: string[];
  diffPatch: string;
  agentId: string;
  agentName: string;
  swarmId?: string;
  scope?: ReviewScope;
  scopeInstanceId?: string;
  issuesFaced?: string[];
  remainingTasks?: string[];
  mergeConfig?: MergeConfig;
  changesFilePath?: string;
  taskDescription?: string;
}

export interface UpdateReviewMergeRequest {
  type?: ReviewRequestType;
  status?: ReviewRequestStatus;
  title?: string;
  description?: string;
  majorFilesChanged?: string[];
  diffPatch?: string;
  issuesFaced?: string[];
  remainingTasks?: string[];
  mergeConfig?: MergeConfig;
  changesFilePath?: string;
  taskDescription?: string;
  mergedBy?: string;
  mergeResult?: MergeResult;
  mergedAt?: string;
  closedAt?: string;
  scope?: ReviewScope;
  scopeInstanceId?: string;
}

export interface UpdateReviewStatusRequest {
  status: ReviewRequestStatus;
}

export interface AddReviewFeedbackRequest {
  agentId: string;
  agentName: string;
  type: 'approve' | 'request_changes' | 'comment';
  comment: string;
}

export interface AddPheromoneRequest {
  type: string;
  intensity?: number;
  depositedBy?: string;
  depositedByName?: string;
  decayRate?: number;
}

export interface LockReviewRequest {
  lockedBy: string;
  lockedByName?: string;
}

export interface UnlockReviewRequest {
  reason?: string;
}

export interface CreateUnlockRequest {
  requestedBy: string;
  requestedByName?: string;
  reason: string;
}

export interface AddProposedJobRequest {
  name: string;
  description: string;
  proposedBy: string;
  proposedByName?: string;
}

export interface AddLinkedJobRequest {
  jobId: string;
}

export interface MergeReviewRequest {
  mergedBy: string;
}

export interface ReviewMergeStatistics {
  total: number;
  pending: number;
  inReview: number;
  approved: number;
  merged: number;
  rejected: number;
  closed: number;
}
