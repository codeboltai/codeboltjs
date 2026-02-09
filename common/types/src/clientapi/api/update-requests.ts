// Update Requests API types

export interface UpdateRequest {
  id: string;
  title: string;
  description?: string;
  status: UpdateRequestStatus;
  createdBy: string;
  assignedTo?: string;
  changes?: UpdateRequestChange[];
  disputes?: UpdateRequestDispute[];
  watchers?: string[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  completedAt?: string;
  mergedAt?: string;
}

export type UpdateRequestStatus =
  | 'draft'
  | 'submitted'
  | 'in_progress'
  | 'completed'
  | 'merged'
  | 'disputed'
  | 'closed';

export interface UpdateRequestChange {
  path: string;
  type: 'add' | 'modify' | 'delete';
  content?: string;
}

export interface UpdateRequestDispute {
  id: string;
  raisedBy: string;
  reason: string;
  status: 'open' | 'resolved';
  resolution?: string;
  comments?: UpdateRequestDisputeComment[];
  createdAt: string;
  resolvedAt?: string;
}

export interface UpdateRequestDisputeComment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface CreateUpdateRequestRequest {
  title: string;
  description?: string;
  changes?: UpdateRequestChange[];
}

export interface UpdateUpdateRequestRequest {
  title?: string;
  description?: string;
  changes?: UpdateRequestChange[];
  status?: UpdateRequestStatus;
}

export interface CompleteWorkRequest {
  summary?: string;
}

export interface MergeUpdateRequestRequest {
  strategy?: string;
}

export interface AddDisputeRequest {
  reason: string;
}

export interface ResolveDisputeRequest {
  resolution: string;
}

export interface AddDisputeCommentRequest {
  content: string;
}

export interface AddWatcherRequest {
  watcherId: string;
}
