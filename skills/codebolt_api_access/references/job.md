# codebolt.job - Job Management Module

Manages jobs, job groups, dependencies, labels, pheromones, split proposals, locks, unlock requests, bids, and blockers in the codebolt system.


## Table of Contents

- [Response Types](#response-types)
- [Methods](#methods)
  - [Job CRUD](#job-crud)
  - [Job Group Operations](#job-group-operations)
  - [Dependency Operations](#dependency-operations)
  - [Ready/Blocked Operations](#readyblocked-operations)
  - [Label Operations](#label-operations)
  - [Pheromone Type Configuration](#pheromone-type-configuration)
  - [Pheromone Operations on Jobs](#pheromone-operations-on-jobs)
  - [Split Proposals](#split-proposals)
  - [Job Locking](#job-locking)
  - [Unlock Requests](#unlock-requests)
  - [Job Bidding](#job-bidding)
  - [Job Blockers](#job-blockers)
- [Examples](#examples)

## Response Types

All responses extend a base response with common fields:

```typescript
interface BaseResponse {
  success?: boolean;  // Whether the operation succeeded
  message?: string;   // Optional status message
  error?: string;     // Error details if operation failed
}
```

### Job

Used in most job operations to represent a single job:

```typescript
interface Job {
  id: string;                              // Format: {GroupShortName}-{number} e.g., "COD2-5"
  groupId: string;                         // Reference to JobGroup
  sequenceNumber: number;                 // Auto-incrementing within group
  name: string;                            // Job title/name
  description?: string;                   // Detailed description
  type: 'bug' | 'feature' | 'task' | 'epic' | 'chore';
  status: 'open' | 'working' | 'hold' | 'closed';
  priority: 1 | 2 | 3 | 4;                // 1=low, 4=urgent
  assignees: string[];                     // List of assignee names/IDs
  labels: string[];                        // Tags/labels
  dependencies: JobDependency[];
  parentJobId?: string;                    // For sub-jobs (hierarchical)
  notes?: string;                          // Additional notes
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}
```

### JobGroup

Container for related jobs:

```typescript
interface JobGroup {
  id: string;              // UUID
  shortName: string;       // 3-4 letter unique public shortname (e.g., "COD2")
  name?: string;           // Optional display name
  parentId?: string;       // Optional parent group ID
  createdAt: string;
  updatedAt: string;
}
```

### JobDependency

Represents a relationship between jobs:

```typescript
interface JobDependency {
  targetJobId: string;     // The job this depends on
  type: 'blocks' | 'related' | 'parent-child' | 'discovered-from';
  createdAt: string;
}
```

### PheromoneDeposit

Represents a pheromone deposit on a job:

```typescript
interface PheromoneDeposit {
  id?: string;
  type: string;
  intensity?: number;
  depositedBy?: string;
  depositedByName?: string;
  depositedAt?: string;
}
```

### PheromoneAggregation

Aggregated pheromone data for a job:

```typescript
interface PheromoneAggregation {
  type: string;
  totalIntensity: number;
  count: number;
  depositors: string[];
}
```

### SplitProposal

Represents a proposal to split a job:

```typescript
interface SplitProposal {
  id: string;
  description: string;
  proposedJobs: ProposedJob[];
  proposedBy?: string;
  proposedByName?: string;
  proposedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface ProposedJob {
  name: string;
  description?: string;
  type?: 'bug' | 'feature' | 'task' | 'epic' | 'chore';
  priority?: 1 | 2 | 3 | 4;
}
```

### JobLock

Represents a lock on a job:

```typescript
interface JobLock {
  lockedBy: string;
  lockedByName?: string;
  lockedAt: string;
}
```

### UnlockRequest

Request to unlock a locked job:

```typescript
interface UnlockRequest {
  id: string;
  requestedBy: string;
  requestedByName?: string;
  reason: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  respondedBy?: string;
  respondedAt?: string;
}
```

### JobBid

Bid to work on a job:

```typescript
interface JobBid {
  id: string;
  agentId: string;
  agentName?: string;
  reason: string;
  priority: number;
  bidAt: string;
  status: 'pending' | 'accepted' | 'withdrawn';
}
```

### JobBlocker

Blocker preventing job completion:

```typescript
interface JobBlocker {
  id: string;
  text: string;
  addedBy: string;
  addedByName?: string;
  addedAt: string;
  blockerJobIds?: string[];
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}
```

## Methods

### `createJob(groupId, data)`

Creates a new job in the specified group.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| groupId | string | Yes | The ID of the job group to create the job in |
| data | CreateJobData | Yes | Job data including name, type, priority, and optional fields |

**Response:**
```typescript
{
  job: Job;  // The newly created job
}
```

```typescript
const result = await codebolt.job.createJob('group-123', {
  name: 'Fix login bug',
  type: 'bug',
  priority: 4,
  description: 'Users cannot login with Google OAuth',
  assignees: ['agent-1']
});
if (result.job) {
  console.log('Created job:', result.job.id);
}
```

---

### `getJob(jobId)`

Retrieves details of a specific job.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The ID of the job to retrieve |

**Response:**
```typescript
{
  job?: Job | null;  // The job details if found
}
```

```typescript
const result = await codebolt.job.getJob('COD2-5');
if (result.job) {
  console.log('Job:', result.job.name, 'Status:', result.job.status);
}
```

---

### `updateJob(jobId, data)`

Updates an existing job.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The ID of the job to update |
| data | UpdateJobData | Yes | Partial job data with fields to update |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job
}
```

```typescript
const result = await codebolt.job.updateJob('COD2-5', {
  status: 'working',
  priority: 4
});
if (result.job) {
  console.log('Updated job status:', result.job.status);
}
```

---

### `deleteJob(jobId)`

Deletes a single job.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The ID of the job to delete |

**Response:**
```typescript
{
  deleted: boolean;  // Whether the deletion was successful
}
```

```typescript
const result = await codebolt.job.deleteJob('COD2-5');
if (result.deleted) {
  console.log('Job deleted successfully');
}
```

---

### `deleteJobs(jobIds)`

Deletes multiple jobs in bulk.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobIds | string[] | Yes | Array of job IDs to delete |

**Response:**
```typescript
{
  removed: number;  // Number of jobs deleted
}
```

```typescript
const result = await codebolt.job.deleteJobs(['COD2-5', 'COD2-6', 'COD2-7']);
console.log(`Deleted ${result.removed} jobs`);
```

---

### `listJobs(filters?)`

Lists jobs with optional filtering.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filters | JobListFilters | No | Optional filter criteria |

**Response:**
```typescript
{
  jobs: Job[];         // Array of matching jobs
  totalCount?: number; // Total count (may include pagination info)
}
```

```typescript
const result = await codebolt.job.listJobs({
  status: ['open', 'working'],
  priorityMin: 3,
  limit: 10
});
console.log(`Found ${result.jobs.length} high-priority jobs`);
```

---

### `createJobGroup(data)`

Creates a new job group.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| data | CreateJobGroupData | Yes | Group data with optional name, shortName, parentId |

**Response:**
```typescript
{
  group: JobGroup;  // The newly created group
}
```

```typescript
const result = await codebolt.job.createJobGroup({
  name: 'Frontend Development',
  shortName: 'FED'
});
console.log('Created group:', result.group.id, result.group.shortName);
```

---

### `addDependency(jobId, targetId, type?)`

Adds a dependency relationship between jobs.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The ID of the job to add dependency to |
| targetId | string | Yes | The ID of the job this job depends on |
| type | DependencyType | No | Dependency type (default: 'blocks') |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job with new dependency
}
```

```typescript
const result = await codebolt.job.addDependency('COD2-5', 'COD2-3', 'blocks');
if (result.job) {
  console.log('Job now has', result.job.dependencies.length, 'dependencies');
}
```

---

### `removeDependency(jobId, targetId)`

Removes a dependency relationship between jobs.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The ID of the job to remove dependency from |
| targetId | string | Yes | The ID of the dependency job to remove |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job
}
```

```typescript
const result = await codebolt.job.removeDependency('COD2-5', 'COD2-3');
if (result.job) {
  console.log('Dependency removed');
}
```

---

### `getReadyJobs(filters?)`

Gets jobs that are ready to start (no blocking dependencies).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filters | JobListFilters | No | Optional filter criteria |

**Response:**
```typescript
{
  jobs: Job[];  // Array of ready jobs
}
```

```typescript
const result = await codebolt.job.getReadyJobs({ status: ['open'] });
console.log(`Found ${result.jobs.length} jobs ready to start`);
```

---

### `getBlockedJobs(filters?)`

Gets jobs that are blocked by dependencies.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filters | JobListFilters | No | Optional filter criteria |

**Response:**
```typescript
{
  jobs: Job[];  // Array of blocked jobs
}
```

```typescript
const result = await codebolt.job.getBlockedJobs();
console.log(`Found ${result.jobs.length} blocked jobs`);
```

---

### `addLabel(label)`

Adds a new label to the system.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| label | string | Yes | The label name to add |

**Response:**
```typescript
{
  labels: string[];  // Updated list of available labels
}
```

```typescript
const result = await codebolt.job.addLabel('urgent');
console.log('Available labels:', result.labels);
```

---

### `removeLabel(label)`

Removes a label from the system.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| label | string | Yes | The label name to remove |

**Response:**
```typescript
{
  labels: string[];  // Updated list of available labels
}
```

```typescript
const result = await codebolt.job.removeLabel('urgent');
console.log('Remaining labels:', result.labels);
```

---

### `listLabels()`

Lists all available labels.

**Response:**
```typescript
{
  labels: string[];  // Array of label names
}
```

```typescript
const result = await codebolt.job.listLabels();
console.log('Available labels:', result.labels);
```

---

### `getPheromoneTypes()`

Lists all configured pheromone types.

**Response:**
```typescript
{
  types: PheromoneType[];  // Array of pheromone type configurations
}
```

```typescript
const result = await codebolt.job.getPheromoneTypes();
result.types.forEach(type => {
  console.log(`${type.displayName}: ${type.description}`);
});
```

---

### `addPheromoneType(data)`

Adds a new pheromone type configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| data | AddPheromoneTypeData | Yes | Pheromone type data with name, displayName |

**Response:**
```typescript
{
  types: PheromoneType[];  // Updated list of pheromone types
}
```

```typescript
const result = await codebolt.job.addPheromoneType({
  name: 'complexity',
  displayName: 'Complexity',
  description: 'Indicates job complexity level',
  color: '#ff0000'
});
console.log('Added pheromone type');
```

---

### `removePheromoneType(name)`

Removes a pheromone type configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | The pheromone type name to remove |

**Response:**
```typescript
{
  types: PheromoneType[];  // Updated list of pheromone types
}
```

```typescript
const result = await codebolt.job.removePheromoneType('complexity');
console.log('Removed pheromone type');
```

---

### `depositPheromone(jobId, deposit)`

Deposits a pheromone on a job.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID to deposit pheromone on |
| deposit | DepositPheromoneData | Yes | Deposit data with type, intensity, depositedBy |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job
}
```

```typescript
const result = await codebolt.job.depositPheromone('COD2-5', {
  type: 'complexity',
  intensity: 8,
  depositedBy: 'agent-1',
  depositedByName: 'Agent One'
});
if (result.job) {
  console.log('Pheromone deposited');
}
```

---

### `removePheromone(jobId, type, depositedBy?)`

Removes a pheromone deposit from a job.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID to remove pheromone from |
| type | string | Yes | The pheromone type to remove |
| depositedBy | string | No | Optional filter by depositor |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job
}
```

```typescript
const result = await codebolt.job.removePheromone('COD2-5', 'complexity');
if (result.job) {
  console.log('Pheromone removed');
}
```

---

### `getPheromones(jobId)`

Gets all pheromone deposits on a job.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID to get pheromones for |

**Response:**
```typescript
{
  pheromones: PheromoneDeposit[];  // Array of pheromone deposits
}
```

```typescript
const result = await codebolt.job.getPheromones('COD2-5');
result.pheromones.forEach(p => {
  console.log(`${p.type}: intensity ${p.intensity}`);
});
```

---

### `getPheromonesAggregated(jobId)`

Gets aggregated pheromone data for a job.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID to get aggregated pheromones for |

**Response:**
```typescript
{
  aggregations: PheromoneAggregation[];  // Aggregated pheromone data
}
```

```typescript
const result = await codebolt.job.getPheromonesAggregated('COD2-5');
result.aggregations.forEach(agg => {
  console.log(`${agg.type}: total intensity ${agg.totalIntensity}`);
});
```

---

### `listJobsByPheromone(type, minIntensity?)`

Searches for jobs by pheromone type and intensity.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | Yes | The pheromone type to search for |
| minIntensity | number | No | Minimum intensity threshold |

**Response:**
```typescript
{
  jobs: Job[];        // Array of matching jobs
  totalCount: number; // Total count of matches
}
```

```typescript
const result = await codebolt.job.listJobsByPheromone('complexity', 5);
console.log(`Found ${result.jobs.length} complex jobs`);
```

---

### `getPheromonesWithDecay(jobId)`

Gets pheromones on a job with decay applied.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID to get decayed pheromones for |

**Response:**
```typescript
{
  pheromones: PheromoneDeposit[];  // Pheromone deposits with decayed intensity
}
```

```typescript
const result = await codebolt.job.getPheromonesWithDecay('COD2-5');
result.pheromones.forEach(p => {
  console.log(`${p.type}: decayed intensity ${p.intensity}`);
});
```

---

### `getPheromonesAggregatedWithDecay(jobId)`

Gets aggregated pheromone data with decay applied.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID to get decayed aggregated pheromones for |

**Response:**
```typescript
{
  aggregations: PheromoneAggregation[];  // Aggregated data with decay
}
```

```typescript
const result = await codebolt.job.getPheromonesAggregatedWithDecay('COD2-5');
result.aggregations.forEach(agg => {
  console.log(`${agg.type}: decayed total ${agg.totalIntensity}`);
});
```

---

### `addSplitProposal(jobId, proposal)`

Adds a proposal to split a job.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID to add split proposal to |
| proposal | AddSplitProposalData | Yes | Proposal data with description and proposedJobs |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job
}
```

```typescript
const result = await codebolt.job.addSplitProposal('COD2-5', {
  description: 'Split into backend and frontend work',
  proposedJobs: [
    { name: 'Implement backend API', type: 'feature', priority: 4 },
    { name: 'Create frontend UI', type: 'feature', priority: 3 }
  ],
  proposedBy: 'agent-1',
  proposedByName: 'Agent One'
});
if (result.job) {
  console.log('Split proposal added');
}
```

---

### `deleteSplitProposal(jobId, proposalId)`

Deletes a split proposal.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID that has the proposal |
| proposalId | string | Yes | The ID of the proposal to delete |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job
}
```

```typescript
const result = await codebolt.job.deleteSplitProposal('COD2-5', 'proposal-123');
if (result.job) {
  console.log('Split proposal deleted');
}
```

---

### `acceptSplitProposal(jobId, proposalId)`

Accepts a split proposal.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID that has the proposal |
| proposalId | string | Yes | The ID of the proposal to accept |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job with new child jobs created
}
```

```typescript
const result = await codebolt.job.acceptSplitProposal('COD2-5', 'proposal-123');
if (result.job) {
  console.log('Split proposal accepted, new jobs created');
}
```

---

### `lockJob(jobId, agentId, agentName?)`

Acquires a lock on a job.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID to lock |
| agentId | string | Yes | The ID of the agent acquiring the lock |
| agentName | string | No | Optional name of the agent |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job with lock
}
```

```typescript
const result = await codebolt.job.lockJob('COD2-5', 'agent-1', 'Agent One');
if (result.job) {
  console.log('Job locked');
}
```

---

### `unlockJob(jobId, agentId)`

Releases a lock on a job.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID to unlock |
| agentId | string | Yes | The ID of the agent releasing the lock |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job without lock
}
```

```typescript
const result = await codebolt.job.unlockJob('COD2-5', 'agent-1');
if (result.job) {
  console.log('Job unlocked');
}
```

---

### `isJobLocked(jobId)`

Checks if a job is currently locked.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID to check |

**Response:**
```typescript
{
  isLocked: boolean;       // Whether the job is locked
  lock?: JobLock;         // Lock details if locked
}
```

```typescript
const result = await codebolt.job.isJobLocked('COD2-5');
if (result.isLocked) {
  console.log(`Locked by ${result.lock?.lockedBy} at ${result.lock?.lockedAt}`);
} else {
  console.log('Job is not locked');
}
```

---

### `addUnlockRequest(jobId, request)`

Adds a request to unlock a locked job.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID to request unlock for |
| request | AddUnlockRequestData | Yes | Request data with requestedBy and reason |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job with unlock request
}
```

```typescript
const result = await codebolt.job.addUnlockRequest('COD2-5', {
  requestedBy: 'agent-2',
  requestedByName: 'Agent Two',
  reason: 'Need to fix critical bug'
});
if (result.job) {
  console.log('Unlock request added');
}
```

---

### `approveUnlockRequest(jobId, unlockRequestId, respondedBy)`

Approves an unlock request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID with the unlock request |
| unlockRequestId | string | Yes | The ID of the unlock request to approve |
| respondedBy | string | Yes | The ID of the agent approving the request |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job
}
```

```typescript
const result = await codebolt.job.approveUnlockRequest('COD2-5', 'req-123', 'agent-1');
if (result.job) {
  console.log('Unlock request approved');
}
```

---

### `rejectUnlockRequest(jobId, unlockRequestId, respondedBy)`

Rejects an unlock request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID with the unlock request |
| unlockRequestId | string | Yes | The ID of the unlock request to reject |
| respondedBy | string | Yes | The ID of the agent rejecting the request |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job
}
```

```typescript
const result = await codebolt.job.rejectUnlockRequest('COD2-5', 'req-123', 'agent-1');
if (result.job) {
  console.log('Unlock request rejected');
}
```

---

### `deleteUnlockRequest(jobId, unlockRequestId)`

Deletes an unlock request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID with the unlock request |
| unlockRequestId | string | Yes | The ID of the unlock request to delete |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job
}
```

```typescript
const result = await codebolt.job.deleteUnlockRequest('COD2-5', 'req-123');
if (result.job) {
  console.log('Unlock request deleted');
}
```

---

### `addBid(jobId, bid)`

Adds a bid to work on a job.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID to bid on |
| bid | AddBidData | Yes | Bid data with agentId, reason, priority |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job
}
```

```typescript
const result = await codebolt.job.addBid('COD2-5', {
  agentId: 'agent-1',
  agentName: 'Agent One',
  reason: 'I have experience with this feature',
  priority: 1
});
if (result.job) {
  console.log('Bid added');
}
```

---

### `withdrawBid(jobId, bidId)`

Withdraws a bid on a job.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID with the bid |
| bidId | string | Yes | The ID of the bid to withdraw |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job
}
```

```typescript
const result = await codebolt.job.withdrawBid('COD2-5', 'bid-123');
if (result.job) {
  console.log('Bid withdrawn');
}
```

---

### `acceptBid(jobId, bidId)`

Accepts a bid on a job.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID with the bid |
| bidId | string | Yes | The ID of the bid to accept |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job with bid accepted
}
```

```typescript
const result = await codebolt.job.acceptBid('COD2-5', 'bid-123');
if (result.job) {
  console.log('Bid accepted');
}
```

---

### `listBids(jobId)`

Lists all bids on a job.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID to list bids for |

**Response:**
```typescript
{
  bids: JobBid[];  // Array of bids
}
```

```typescript
const result = await codebolt.job.listBids('COD2-5');
result.bids.forEach(bid => {
  console.log(`${bid.agentName}: ${bid.reason}`);
});
```

---

### `addBlocker(jobId, blocker)`

Adds a blocker to a job.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID to add blocker to |
| blocker | AddBlockerData | Yes | Blocker data with text and addedBy |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job
}
```

```typescript
const result = await codebolt.job.addBlocker('COD2-5', {
  text: 'Waiting for API design approval',
  addedBy: 'agent-1',
  addedByName: 'Agent One',
  blockerJobIds: ['COD2-3']
});
if (result.job) {
  console.log('Blocker added');
}
```

---

### `removeBlocker(jobId, blockerId)`

Removes a blocker from a job.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID with the blocker |
| blockerId | string | Yes | The ID of the blocker to remove |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job
}
```

```typescript
const result = await codebolt.job.removeBlocker('COD2-5', 'blocker-123');
if (result.job) {
  console.log('Blocker removed');
}
```

---

### `resolveBlocker(jobId, blockerId, resolvedBy)`

Marks a blocker as resolved.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | The job ID with the blocker |
| blockerId | string | Yes | The ID of the blocker to resolve |
| resolvedBy | string | Yes | The ID of the agent resolving the blocker |

**Response:**
```typescript
{
  job?: Job | null;  // The updated job
}
```

```typescript
const result = await codebolt.job.resolveBlocker('COD2-5', 'blocker-123', 'agent-1');
if (result.job) {
  console.log('Blocker resolved');
}
```

---

## Examples

### Creating and Managing Jobs

```typescript
import { codebolt } from '@codebolt/codeboltjs';

// Create a job group
const group = await codebolt.job.createJobGroup({
  name: 'Authentication System',
  shortName: 'AUTH'
});

// Create a high-priority bug
const bug = await codebolt.job.createJob(group.group.id, {
  name: 'Fix OAuth login timeout',
  type: 'bug',
  priority: 4,
  description: 'Users experience 30-second timeouts during OAuth login',
  labels: ['urgent', 'security'],
  assignees: ['agent-1']
});

// Update job status
await codebolt.job.updateJob(bug.job.id, {
  status: 'working',
  notes: 'Investigating timeout in OAuth callback handler'
});
```

### Working with Dependencies and Ready Jobs

```typescript
// Find jobs ready to start
const readyJobs = await codebolt.job.getReadyJobs({
  status: ['open'],
  priorityMin: 3
});

// Add a dependency between jobs
await codebolt.job.addDependency('AUTH-5', 'AUTH-2', 'blocks');

// Check which jobs are blocked
const blockedJobs = await codebolt.job.getBlockedJobs();
blockedJobs.jobs.forEach(job => {
  console.log(`${job.id} blocked by ${job.dependencies.length} dependencies`);
});
```

### Using Pheromones for Job Tracking

```typescript
// Add a pheromone type
await codebolt.job.addPheromoneType({
  name: 'difficulty',
  displayName: 'Difficulty',
  description: 'Estimated difficulty level (1-10)',
  color: '#ff6600'
});

// Deposit pheromones on jobs to mark difficulty
await codebolt.job.depositPheromone('AUTH-5', {
  type: 'difficulty',
  intensity: 8,
  depositedBy: 'agent-1'
});

// Search for difficult jobs
const difficultJobs = await codebolt.job.listJobsByPheromone('difficulty', 7);
console.log(`Found ${difficultJobs.jobs.length} high-difficulty jobs`);
```

### Managing Job Locks and Bids

```typescript
// Agent locks a job to work on it
await codebolt.job.lockJob('AUTH-5', 'agent-1', 'Agent One');

// Another agent requests unlock
await codebolt.job.addUnlockRequest('AUTH-5', {
  requestedBy: 'agent-2',
  requestedByName: 'Agent Two',
  reason: 'Need to fix critical security issue'
});

// Approve the unlock request
await codebolt.job.approveUnlockRequest('AUTH-5', 'req-123', 'agent-1');

// Agents bid on a job
await codebolt.job.addBid('AUTH-6', {
  agentId: 'agent-1',
  agentName: 'Agent One',
  reason: 'Expert in OAuth flows',
  priority: 1
});

// List all bids and accept one
const bids = await codebolt.job.listBids('AUTH-6');
if (bids.bids.length > 0) {
  await codebolt.job.acceptBid('AUTH-6', bids.bids[0].id);
}
```
