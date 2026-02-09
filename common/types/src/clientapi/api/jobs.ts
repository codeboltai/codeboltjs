// --- Enums and Constants ---

/** Job status */
export type JobStatus = 'open' | 'working' | 'hold' | 'closed' | 'archived';

/** Split status */
export type SplitStatus = 'not_split' | 'partial_split' | 'split_up';

/** Job type */
export type JobType = 'bug' | 'feature' | 'task' | 'epic' | 'chore';

/** Job priority (1-4, 4 = urgent) */
export type JobPriority = 1 | 2 | 3 | 4;

/** Dependency type */
export type DependencyType = 'blocks' | 'related' | 'parent-child';

/** Job event type */
export type JobEventType =
  | 'created'
  | 'status_changed'
  | 'priority_changed'
  | 'type_changed'
  | 'assignee_added'
  | 'assignee_removed'
  | 'label_added'
  | 'label_removed'
  | 'description_changed'
  | 'pheromone_deposited'
  | 'pheromone_removed'
  | 'locked'
  | 'unlocked'
  | 'unlock_requested'
  | 'bid_added'
  | 'bid_withdrawn'
  | 'bid_accepted'
  | 'blocker_added'
  | 'blocker_resolved'
  | 'split_proposed'
  | 'split_accepted'
  | 'split_rejected'
  | 'dependency_added'
  | 'dependency_removed';

// --- Core Entities ---

/** Job dependency */
export interface JobDependency {
  targetJobId: string;
  type: DependencyType;
  createdAt: string;
}

/** Pheromone for stigmergy coordination */
export interface Pheromone {
  type: string;
  intensity: number;
  depositedBy: string;
  depositedByName?: string;
  depositedAt: string;
  expiresAt?: string;
  decayRate?: number;
}

/** Entity lock */
export interface Lock {
  lockedBy: string;
  lockedByName?: string;
  lockedAt: string;
}

/** Unlock request */
export interface UnlockRequest {
  id: string;
  requestedBy: string;
  requestedByName?: string;
  reason: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  respondedAt?: string;
  respondedBy?: string;
}

/** Job bid */
export interface JobBid {
  id: string;
  agentId: string;
  agentName?: string;
  reason: string;
  priority: number;
  submittedAt: string;
  status: 'active' | 'withdrawn' | 'accepted';
}

/** Job blocker */
export interface JobBlocker {
  id: string;
  text: string;
  addedBy: string;
  addedByName?: string;
  addedAt: string;
  blockerJobIds?: string[];
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

/** Job split proposal */
export interface JobSplitProposal {
  id: string;
  jobId: string;
  proposedBy: string;
  proposedAt: string;
  description: string;
  proposedJobs: { name: string; description: string }[];
  status: 'pending' | 'accepted' | 'rejected';
}

/** Job group */
export interface JobGroup {
  id: string;
  shortName: string;
  name?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

/** Main job interface */
export interface Job {
  id: string;
  groupId: string;
  sequenceNumber: number;
  name: string;
  description?: string;
  type: JobType;
  status: JobStatus;
  priority?: JobPriority | null;
  assignees: string[];
  labels: string[];
  dependencies: JobDependency[];
  pheromones: Pheromone[];
  parentJobId?: string;
  notes?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  archivedAt?: string;
  splitProposals?: JobSplitProposal[];
  splitStatus?: SplitStatus;
  discoveredFrom?: string;
  lock?: Lock;
  unlockRequests?: UnlockRequest[];
  bids?: JobBid[];
  blockers?: JobBlocker[];
}

/** Job timeline event */
export interface JobTimelineEvent {
  id: string;
  jobId: string;
  eventType: JobEventType;
  timestamp: string;
  actor: string;
  actorName?: string;
  data: Record<string, unknown>;
  description?: string;
}

/** Job list filters */
export interface JobListFilters {
  status?: JobStatus[];
  priority?: JobPriority[];
  priorityMin?: JobPriority;
  priorityMax?: JobPriority;
  assignee?: string[];
  labels?: string[];
  labelsAny?: string[];
  titleContains?: string;
  descContains?: string;
  ids?: string[];
  groupId?: string;
  type?: JobType[];
  splitStatus?: SplitStatus[];
  filterOutBlockers?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  noAssignee?: boolean;
  noLabels?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'priority' | 'createdAt' | 'updatedAt' | 'status' | 'id' | 'name' | 'importance';
  sortOrder?: 'asc' | 'desc';
}

/** Job statistics */
export interface JobStatistics {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

/** Pheromone type definition */
export interface PheromoneType {
  name: string;
  description?: string;
  defaultIntensity?: number;
  defaultDecayRate?: number;
}

/** Job label */
export interface JobLabel {
  name: string;
  color?: string;
  description?: string;
}

// --- Request Types ---

/** Create job request */
export interface CreateJobRequest {
  groupId: string;
  name: string;
  description?: string;
  type: JobType;
  status?: JobStatus;
  priority?: JobPriority;
  assignees?: string[];
  labels?: string[];
  parentJobId?: string;
  notes?: string;
  dueDate?: string;
  metadata?: Record<string, unknown>;
}

/** Update job request */
export interface UpdateJobRequest {
  name?: string;
  description?: string;
  type?: JobType;
  status?: JobStatus;
  priority?: JobPriority | null;
  assignees?: string[];
  labels?: string[];
  notes?: string;
  dueDate?: string;
}

/** Pheromone deposit request */
export interface PheromoneDepositRequest {
  type: string;
  intensity?: number;
  depositedBy?: string;
  depositedByName?: string;
  decayRate?: number;
}

/** Add dependency request */
export interface AddDependencyRequest {
  targetJobId: string;
  type: DependencyType;
}

/** Bulk delete jobs request */
export interface BulkDeleteJobsRequest {
  jobIds: string[];
}

/** Create job group request */
export interface CreateJobGroupRequest {
  shortName: string;
  name?: string;
  parentId?: string;
}

/** Update job group request */
export interface UpdateJobGroupRequest {
  shortName?: string;
  name?: string;
  parentId?: string;
}

/** Create pheromone type request */
export interface CreatePheromoneTypeRequest {
  name: string;
  description?: string;
  defaultIntensity?: number;
  defaultDecayRate?: number;
}

/** Create label request */
export interface CreateLabelRequest {
  name: string;
  color?: string;
  description?: string;
}

/** Create split proposal request */
export interface CreateSplitProposalRequest {
  description: string;
  proposedBy: string;
  proposedJobs: { name: string; description: string }[];
}

/** Accept split proposal request */
export interface AcceptSplitProposalRequest {
  acceptedBy?: string;
}
