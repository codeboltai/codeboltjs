# codebolt.project - Project Management

A module for interacting with project settings, paths, and execution operations in the Codebolt environment.

## Response Types

All responses extend a base response with common fields:

```typescript
interface BaseProjectResponse {
  success?: boolean;  // Whether the operation succeeded
  message?: string;   // Optional status message
  error?: string;     // Error details if operation failed
  requestId?: string;  // Request identifier
  timestamp?: string;  // Response timestamp
}
```

### GetProjectSettingsResponse

Returned when retrieving project configuration settings.

```typescript
interface GetProjectSettingsResponse extends BaseProjectResponse {
  type: 'getProjectSettingsResponse';
  projectSettings?: Record<string, any>;  // Full project settings object
  data?: Record<string, any>;             // Additional project data
}
```

### GetProjectPathResponse

Returned when querying the current project location.

```typescript
interface GetProjectPathResponse extends BaseProjectResponse {
  type: 'getProjectPathResponse';
  projectPath?: string;  // Absolute path to the project directory
  projectName?: string;  // Name of the project
  data?: any;           // Additional data
}
```

### GetRepoMapResponse

Returned when fetching the repository structure map.

```typescript
interface GetRepoMapResponse extends BaseProjectResponse {
  type: 'getRepoMapResponse';
  repoMap?: any;  // Repository map structure (varies based on message parameters)
  data?: any;     // Additional data
}
```

### GetEditorFileStatusResponse

Returned when querying the current status of files in the editor.

```typescript
interface GetEditorFileStatusResponse extends BaseProjectResponse {
  type: 'getEditorFileStatusResponse';
  editorStatus?: any;  // Current editor file status
  status?: any;        // Additional status information
  data?: any;          // Additional data
}
```

## Methods

### `getProjectSettings()`

Retrieves the project settings from the Codebolt server.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| None | - | - | No parameters required |

**Response:**
```typescript
{
  type: 'getProjectSettingsResponse';
  requestId: string;
  success?: boolean;
  message?: string;
  projectSettings?: Record<string, any>;
  data?: Record<string, any>;
  error?: string;
  timestamp?: string;
}
```

```typescript
const result = await codebolt.project.getProjectSettings();
if (result.success && result.projectSettings) {
  console.log('Project settings:', result.projectSettings);
}
```

---

### `getProjectPath()`

Retrieves the absolute path and name of the current project.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| None | - | - | No parameters required |

**Response:**
```typescript
{
  type: 'getProjectPathResponse';
  requestId: string;
  success?: boolean;
  message?: string;
  projectPath?: string;
  projectName?: string;
  data?: any;
  error?: string;
  timestamp?: string;
}
```

```typescript
const result = await codebolt.project.getProjectPath();
if (result.success && result.projectPath) {
  console.log(`Project: ${result.projectName} at ${result.projectPath}`);
}
```

---

### `getRepoMap(message)`

Retrieves the repository map for the project. The structure depends on the message parameters provided.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| message | any | Yes | Parameters that control the repo map generation |

**Response:**
```typescript
{
  type: 'getRepoMapResponse';
  requestId: string;
  success?: boolean;
  message?: string;
  repoMap?: any;
  data?: any;
  error?: string;
  timestamp?: string;
}
```

```typescript
const result = await codebolt.project.getRepoMap({ includeTests: true });
if (result.success && result.repoMap) {
  console.log('Repository map:', result.repoMap);
}
```

---

### `runProject()`

Runs the current project. This is a fire-and-forget operation with no response.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| None | - | - | No parameters required |

**Response:**
```typescript
// This method returns void (fire-and-forget)
```

```typescript
codebolt.project.runProject();
console.log('Project execution started');
```

---

### `getEditorFileStatus()`

Retrieves the current status of files in the editor.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| None | - | - | No parameters required |

**Response:**
```typescript
{
  type: 'getEditorFileStatusResponse';
  requestId: string;
  success?: boolean;
  message?: string;
  editorStatus?: any;
  status?: any;
  data?: any;
  error?: string;
  timestamp?: string;
}
```

```typescript
const result = await codebolt.project.getEditorFileStatus();
if (result.success && result.editorStatus) {
  console.log('Editor file status:', result.editorStatus);
}
```

## Examples

### Getting Project Information

```typescript
// Fetch both project path and settings
const [pathResult, settingsResult] = await Promise.all([
  codebolt.project.getProjectPath(),
  codebolt.project.getProjectSettings()
]);

if (pathResult.success && settingsResult.success) {
  console.log(`Working on: ${pathResult.projectName}`);
  console.log(`Location: ${pathResult.projectPath}`);
  console.log('Settings:', settingsResult.projectSettings);
}
```

### Analyzing Repository Structure

```typescript
// Get repository map for analysis
const repoMap = await codebolt.project.getRepoMap({
  includeTests: true,
  includeDocs: false,
  maxDepth: 5
});

if (repoMap.success && repoMap.repoMap) {
  // Process repository structure
  console.log('Repository analyzed successfully');
}
```

### Running Project with Status Check

```typescript
// Check editor status before running project
const status = await codebolt.project.getEditorFileStatus();
if (status.success) {
  console.log('Editor status checked, starting project...');
  codebolt.project.runProject();
}
```

### Complete Project Context

```typescript
// Gather complete project context before performing operations
async function getProjectContext() {
  const settings = await codebolt.project.getProjectSettings();
  const path = await codebolt.project.getProjectPath();
  const repoMap = await codebolt.project.getRepoMap({});
  const editorStatus = await codebolt.project.getEditorFileStatus();

  if (settings.success && path.success) {
    return {
      name: path.projectName,
      path: path.projectPath,
      settings: settings.projectSettings,
      repoMap: repoMap.repoMap,
      editorStatus: editorStatus.editorStatus
    };
  }
  return null;
}
