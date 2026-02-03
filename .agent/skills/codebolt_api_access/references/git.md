# codebolt.git - Git Operations

This module provides functionality to interact with Git repositories, including initialization, cloning, committing, branching, and other common Git operations.

## Response Types

All responses extend a base response with common fields:

```typescript
interface BaseGitResponse {
  type: string;           // Response type identifier
  requestId: string;      // Unique request identifier
  success?: boolean;      // Whether the operation succeeded
  message?: string;       // Optional status message
  data?: any;            // Additional response data
  error?: string;        // Error details if operation failed
  timestamp?: string;    // ISO timestamp of the response
}
```

## Methods

### `init(path)`

Initializes a new Git repository at the given path.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| path | string | Yes | The file system path where the Git repository should be initialized |

**Response:**
```typescript
{
  type: 'gitInitResponse';
  requestId: string;
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
  timestamp?: string;
}
```

```typescript
const result = await codebolt.git.init('/path/to/project');
if (result.success) {
  console.log('Repository initialized:', result.message);
}
```

---

### `pull()`

Pulls the latest changes from the remote repository to the local repository.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|

**Response:**
```typescript
{
  type: 'gitPullResponse';
  requestId: string;
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
  timestamp?: string;
}
```

```typescript
const result = await codebolt.git.pull();
if (result.success) {
  console.log('Pull successful:', result.message);
}
```

---

### `push()`

Pushes local repository changes to the remote repository.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|

**Response:**
```typescript
{
  type: 'gitPushResponse';
  requestId: string;
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
  timestamp?: string;
}
```

```typescript
const result = await codebolt.git.push();
if (result.success) {
  console.log('Push successful:', result.message);
}
```

---

### `status()`

Retrieves the status of the local repository.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|

**Response:**
```typescript
{
  type: 'gitStatusResponse';
  requestId: string;
  status?: any;          // Git status information
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
  timestamp?: string;
}
```

```typescript
const result = await codebolt.git.status();
if (result.success) {
  console.log('Repository status:', result.status);
}
```

---

### `addAll()`

Adds all changes in the local repository to the staging area.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|

**Response:**
```typescript
{
  type: 'AddResponse';
  requestId: string;
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
  timestamp?: string;
  content?: string;
}
```

```typescript
const result = await codebolt.git.addAll();
if (result.success) {
  console.log('Changes staged:', result.message);
}
```

---

### `commit(message)`

Commits the staged changes with the given commit message.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| message | string | Yes | The commit message to use for the commit |

**Response:**
```typescript
{
  type: 'gitCommitResponse';
  requestId: string;
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
  timestamp?: string;
  content?: string;
}
```

```typescript
const result = await codebolt.git.commit('Add new feature implementation');
if (result.success) {
  console.log('Commit successful:', result.message);
}
```

---

### `checkout(branch)`

Checks out a branch or commit in the local repository.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| branch | string | Yes | The name of the branch or commit to check out |

**Response:**
```typescript
{
  type: 'gitCheckoutResponse';
  requestId: string;
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
  timestamp?: string;
  branch?: string;
}
```

```typescript
const result = await codebolt.git.checkout('feature/new-feature');
if (result.success) {
  console.log('Checked out branch:', result.branch);
}
```

---

### `branch(branch)`

Creates a new branch in the local repository.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| branch | string | Yes | The name of the new branch to create |

**Response:**
```typescript
{
  type: 'gitBranchResponse';
  requestId: string;
  branches?: string[];   // List of branches
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
  timestamp?: string;
  branch?: string;
}
```

```typescript
const result = await codebolt.git.branch('feature/new-feature');
if (result.success) {
  console.log('Branch created:', result.branch);
  console.log('All branches:', result.branches);
}
```

---

### `logs(path)`

Retrieves the commit logs for the local repository.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| path | string | Yes | The file system path of the local Git repository |

**Response:**
```typescript
{
  type: 'gitLogsResponse';
  requestId: string;
  logs?: any[];          // Array of commit log entries
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
  timestamp?: string;
}
```

```typescript
const result = await codebolt.git.logs('/path/to/repo');
if (result.success) {
  console.log('Commit history:', result.logs);
}
```

---

### `diff(commitHash)`

Retrieves the diff of changes for a specific commit.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| commitHash | string | Yes | The hash of the commit to retrieve the diff for |

**Response:**
```typescript
{
  type: 'gitDiffResponse';
  requestId: string;
  diff?: string;         // Diff output
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
  timestamp?: string;
}
```

```typescript
const result = await codebolt.git.diff('abc123def456');
if (result.success) {
  console.log('Diff output:', result.diff);
}
```

---

### `clone(url, path?)`

Clones a remote Git repository to the specified path.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| url | string | Yes | The URL of the remote repository to clone |
| path | string | No | The file system path where the repository should be cloned |

**Response:**
```typescript
{
  type: 'gitCloneResponse';
  requestId: string;
  url?: string;          // Repository URL that was cloned
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
  timestamp?: string;
}
```

```typescript
const result = await codebolt.git.clone('https://github.com/user/repo.git', '/path/to/clone');
if (result.success) {
  console.log('Repository cloned:', result.url);
}
```

## Examples

### Complete Git Workflow

```typescript
// Initialize a new repository
const initResult = await codebolt.git.init('/project');
if (!initResult.success) {
  console.error('Init failed:', initResult.error);
  return;
}

// Make changes to files...

// Stage all changes
const addResult = await codebolt.git.addAll();
if (!addResult.success) {
  console.error('Add failed:', addResult.error);
  return;
}

// Commit changes
const commitResult = await codebolt.git.commit('Initial commit');
if (!commitResult.success) {
  console.error('Commit failed:', commitResult.error);
  return;
}

// Create a new branch
const branchResult = await codebolt.git.branch('feature/main');
if (branchResult.success) {
  console.log('Branch created:', branchResult.branch);
}
```

### Clone and Inspect Repository

```typescript
// Clone a repository
const cloneResult = await codebolt.git.clone(
  'https://github.com/owner/project.git',
  '/workspace/project'
);

if (cloneResult.success) {
  // Check repository status
  const status = await codebolt.git.status();
  console.log('Repo status:', status.status);

  // View commit history
  const logs = await codebolt.git.logs('/workspace/project');
  if (logs.success) {
    console.log(`Found ${logs.logs?.length || 0} commits`);
    logs.logs?.forEach(log => console.log(log));
  }
}
```

### Sync with Remote Repository

```typescript
// Pull latest changes
const pullResult = await codebolt.git.pull();
if (pullResult.success) {
  console.log('Pulled changes:', pullResult.message);

  // Make local changes...

  // Stage and commit
  await codebolt.git.addAll();
  await codebolt.git.commit('Update feature');

  // Push to remote
  const pushResult = await codebolt.git.push();
  if (pushResult.success) {
    console.log('Pushed changes successfully');
  }
}
```

### Inspect Changes with Diff

```typescript
// View diff for a specific commit
const diffResult = await codebolt.git.diff('a1b2c3d4e5f6');
if (diffResult.success && diffResult.diff) {
  console.log('Changes in commit a1b2c3d4e5f6:');
  console.log(diffResult.diff);
}

// View commit history to find commit hashes
const logs = await codebolt.git.logs('/path/to/repo');
if (logs.success) {
  logs.logs?.forEach((log, index) => {
    console.log(`Commit ${index + 1}:`, log);
  });
}
```
