# codebolt.reviewMergeRequest - Review and Merge Request Management

Manage review and merge requests for code changes, including creating requests, adding reviews, tracking status, and merging approved changes.

## Response Types

All responses extend a base response with common fields:

```typescript
interface BaseReviewMergeRequestResponse {
  success?: boolean;  // Whether the operation succeeded
  message?: string;   // Optional status message
  error?: string;     // Error details if operation failed
}
```

### ReviewMergeRequest

Used in get, create, update, addReview, updateStatus, addLinkedJob, and removeLinkedJob responses:

```typescript
interface ReviewMergeRequest {
  id: string;
  type: 'review' | 'review_merge';
  status: 'draft' | 'pending_review' | 'in_review' | 'changes_requested' | 'approved' | 'review_completed' | 'merged' | 'rejected' | 'closed';
  initialTask: string;
  taskDescription?: string;
  agentId: string;
  agentName: string;
  swarmId?: string;
  title: string;
  description: string;
  majorFilesChanged: string[];
  diffPatch: string;
  changesFilePath?: string;
  mergeConfig?: {
    strategy: 'patch' | 'git_worktree';
    worktreeDetails?: {
      worktreePath: string;
      branchName: string;
      baseBranch?: string;
      commitHash?: string;
    };
    patchContent?: string;
  };
  issuesFaced?: string[];
  remainingTasks?: string[];
  reviews: Array<{
    id: string;
    agentId: string;
    agentName: string;
    type: 'approve' | 'request_changes' | 'comment';
    comment: string;
    createdAt: string;
  }>;
  linkedJobIds: string[];
  mergedBy?: string;
  mergeResult?: {
    success: boolean;
    message?: string;
    conflictFiles?: string[];
    appliedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
  mergedAt?: string;
  closedAt?: string;
}
```

### MergeResult

Used in merge response:

```typescript
interface MergeResult {
  success: boolean;
  message?: string;
  conflictFiles?: string[];
  appliedAt?: string;
}
```

## Methods

### `list(filters?)`

List review merge requests with optional filtering.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filters | object | No | Filter options |
| filters.status | string[] | No | Filter by status values |
| filters.type | string[] | No | Filter by type ('review' or 'review_merge') |
| filters.agentId | string | No | Filter by agent ID |
| filters.swarmId | string | No | Filter by swarm ID |
| filters.createdAfter | string | No | ISO date filter |
| filters.createdBefore | string | No | ISO date filter |
| filters.updatedAfter | string | No | ISO date filter |
| filters.updatedBefore | string | No | ISO date filter |
| filters.titleContains | string | No | Filter by title substring |
| filters.limit | number | No | Max results to return |
| filters.offset | number | No | Pagination offset |
| filters.sortBy | string | No | Sort field ('createdAt', 'updatedAt', 'status') |
| filters.sortOrder | string | No | Sort order ('asc' or 'desc') |

**Response:**
```typescript
{
  requests: ReviewMergeRequest[];
  totalCount: number;
}
```

```typescript
const result = await codebolt.reviewMergeRequest.list({
  status: ['pending_review', 'in_review'],
  limit: 10
});
console.log(`Found ${result.totalCount} requests`);
```

---

### `get(id)`

Get a single review merge request by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The request ID |

**Response:**
```typescript
{
  request: ReviewMergeRequest;
}
```

```typescript
const result = await codebolt.reviewMergeRequest.get('req-123');
if (result.request) {
  console.log(`Request: ${result.request.title}`);
}
```

---

### `create(data)`

Create a new review merge request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| data | object | Yes | Request data |
| data.type | string | Yes | 'review' or 'review_merge' |
| data.initialTask | string | Yes | Original task description |
| data.title | string | Yes | Request title |
| data.description | string | Yes | Request description |
| data.majorFilesChanged | string[] | Yes | List of changed files |
| data.diffPatch | string | Yes | Unified diff format |
| data.agentId | string | Yes | Agent ID creating the request |
| data.agentName | string | Yes | Agent name |
| data.swarmId | string | No | Swarm ID if applicable |
| data.issuesFaced | string[] | No | Problems encountered |
| data.remainingTasks | string[] | No | Remaining tasks |
| data.mergeConfig | object | No | Merge configuration |
| data.changesFilePath | string | No | Path to changes summary |
| data.taskDescription | string | No | Extended description |

**Response:**
```typescript
{
  request: ReviewMergeRequest;
}
```

```typescript
const result = await codebolt.reviewMergeRequest.create({
  type: 'review_merge',
  initialTask: 'Implement feature X',
  title: 'Feature X implementation',
  description: 'Adds feature X with proper error handling',
  majorFilesChanged: ['src/featureX.ts', 'src/utils.ts'],
  diffPatch: '@@ -1,5 +1,10 @@\n+new code',
  agentId: 'agent-123',
  agentName: 'Agent Smith'
});
console.log(`Created request: ${result.request.id}`);
```

---

### `update(id, data)`

Update an existing review merge request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The request ID |
| data | object | Yes | Update data (all optional) |
| data.type | string | No | 'review' or 'review_merge' |
| data.status | string | No | Request status |
| data.title | string | No | Request title |
| data.description | string | No | Request description |
| data.majorFilesChanged | string[] | No | List of changed files |
| data.diffPatch | string | No | Unified diff format |
| data.issuesFaced | string[] | No | Problems encountered |
| data.remainingTasks | string[] | No | Remaining tasks |
| data.mergeConfig | object | No | Merge configuration |
| data.changesFilePath | string | No | Path to changes summary |
| data.taskDescription | string | No | Extended description |
| data.mergedBy | string | No | Who merged the request |
| data.mergeResult | object | No | Merge result details |
| data.mergedAt | string | No | Merge timestamp |
| data.closedAt | string | No | Close timestamp |

**Response:**
```typescript
{
  request: ReviewMergeRequest;
}
```

```typescript
const result = await codebolt.reviewMergeRequest.update('req-123', {
  status: 'approved',
  description: 'Updated description'
});
```

---

### `delete(id)`

Delete a review merge request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The request ID |

**Response:**
```typescript
{
  deleted: boolean;
}
```

```typescript
const result = await codebolt.reviewMergeRequest.delete('req-123');
if (result.deleted) {
  console.log('Request deleted');
}
```

---

### `addReview(id, feedback)`

Add review feedback to a request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The request ID |
| feedback | object | Yes | Review feedback |
| feedback.agentId | string | Yes | Reviewer agent ID |
| feedback.agentName | string | Yes | Reviewer agent name |
| feedback.type | string | Yes | 'approve', 'request_changes', or 'comment' |
| feedback.comment | string | Yes | Review comment |

**Response:**
```typescript
{
  request: ReviewMergeRequest;
}
```

```typescript
const result = await codebolt.reviewMergeRequest.addReview('req-123', {
  agentId: 'reviewer-456',
  agentName: 'Reviewer Jane',
  type: 'approve',
  comment: 'Looks good, approved for merge'
});
```

---

### `updateStatus(id, status)`

Update the status of a review merge request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The request ID |
| status | string | Yes | New status value |

**Response:**
```typescript
{
  request: ReviewMergeRequest;
}
```

```typescript
const result = await codebolt.reviewMergeRequest.updateStatus('req-123', 'approved');
```

---

### `merge(id, mergedBy)`

Merge an approved review merge request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The request ID |
| mergedBy | string | Yes | Agent ID or 'user' who is merging |

**Response:**
```typescript
{
  result: {
    success: boolean;
    message?: string;
    conflictFiles?: string[];
    appliedAt?: string;
  };
}
```

```typescript
const result = await codebolt.reviewMergeRequest.merge('req-123', 'user');
if (result.result.success) {
  console.log('Merge completed');
}
```

---

### `addLinkedJob(id, jobId)`

Link a job to a review merge request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The request ID |
| jobId | string | Yes | The job ID to link |

**Response:**
```typescript
{
  request: ReviewMergeRequest;
}
```

```typescript
const result = await codebolt.reviewMergeRequest.addLinkedJob('req-123', 'job-456');
```

---

### `removeLinkedJob(id, jobId)`

Remove a linked job from a review merge request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The request ID |
| jobId | string | Yes | The job ID to remove |

**Response:**
```typescript
{
  request: ReviewMergeRequest;
}
```

```typescript
const result = await codebolt.reviewMergeRequest.removeLinkedJob('req-123', 'job-456');
```

---

### `pending()`

Get all pending review requests.

**Response:**
```typescript
{
  requests: ReviewMergeRequest[];
  totalCount: number;
}
```

```typescript
const result = await codebolt.reviewMergeRequest.pending();
console.log(`Pending requests: ${result.totalCount}`);
```

---

### `readyToMerge()`

Get all requests ready to be merged.

**Response:**
```typescript
{
  requests: ReviewMergeRequest[];
  totalCount: number;
}
```

```typescript
const result = await codebolt.reviewMergeRequest.readyToMerge();
result.requests.forEach(req => console.log(req.title));
```

---

### `byAgent(agentId)`

Get all requests for a specific agent.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agentId | string | Yes | The agent ID |

**Response:**
```typescript
{
  requests: ReviewMergeRequest[];
  totalCount: number;
}
```

```typescript
const result = await codebolt.reviewMergeRequest.byAgent('agent-123');
console.log(`Agent's requests: ${result.totalCount}`);
```

---

### `bySwarm(swarmId)`

Get all requests for a specific swarm.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | The swarm ID |

**Response:**
```typescript
{
  requests: ReviewMergeRequest[];
  totalCount: number;
}
```

```typescript
const result = await codebolt.reviewMergeRequest.bySwarm('swarm-789');
```

---

### `statistics()`

Get statistics about review merge requests.

**Response:**
```typescript
{
  statistics: any;
}
```

```typescript
const result = await codebolt.reviewMergeRequest.statistics();
console.log(result.statistics);
```

## Examples

### Create and Review a Merge Request

```typescript
const request = await codebolt.reviewMergeRequest.create({
  type: 'review_merge',
  initialTask: 'Add user authentication',
  title: 'Add user authentication feature',
  description: 'Implements login and registration endpoints',
  majorFilesChanged: ['src/auth.ts', 'src/routes.ts'],
  diffPatch: '@@ -0,0 +1,50 @@\n+new auth code',
  agentId: 'agent-123',
  agentName: 'Agent Smith'
});

const review = await codebolt.reviewMergeRequest.addReview(request.request.id, {
  agentId: 'reviewer-456',
  agentName: 'Code Reviewer',
  type: 'approve',
  comment: 'Authentication logic looks correct'
});
```

### Workflow: List, Approve, and Merge

```typescript
const pending = await codebolt.reviewMergeRequest.pending();
for (const req of pending.requests) {
  console.log(`Reviewing: ${req.title}`);
  
  await codebolt.reviewMergeRequest.addReview(req.id, {
    agentId: 'reviewer-456',
    agentName: 'Code Reviewer',
    type: 'approve',
    comment: 'Approved for merge'
  });
  
  await codebolt.reviewMergeRequest.updateStatus(req.id, 'approved');
  
  const mergeResult = await codebolt.reviewMergeRequest.merge(req.id, 'user');
  if (mergeResult.result.success) {
    console.log(`Merged: ${req.title}`);
  }
}
```

### Filter and Process Requests by Agent

```typescript
const agentRequests = await codebolt.reviewMergeRequest.byAgent('agent-123');
const completed = agentRequests.requests.filter(r => 
  r.status === 'merged' || r.status === 'closed'
);

console.log(`Agent completed ${completed.length} requests`);
```

### Handle Merge Conflicts

```typescript
const ready = await codebolt.reviewMergeRequest.readyToMerge();
for (const req of ready.requests) {
  const result = await codebolt.reviewMergeRequest.merge(req.id, 'user');
  if (!result.result.success && result.result.conflictFiles) {
    console.log(`Conflicts in ${req.title}:`);
    result.result.conflictFiles.forEach(f => console.log(`  - ${f}`));
    
    await codebolt.reviewMergeRequest.addReview(req.id, {
      agentId: 'agent-123',
      agentName: 'Agent Smith',
      type: 'request_changes',
      comment: `Resolve conflicts in: ${result.result.conflictFiles.join(', ')}`
    });
  }
}
```
