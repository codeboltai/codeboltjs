# codebolt.fs - File System Operations

This module provides functionality to interact with the filesystem, including reading, writing, searching, and managing files and directories.

## Response Types

All responses extend a base response with common fields:

```typescript
interface BaseFsResponse {
  success: boolean;      // Whether the operation succeeded
  message?: string;      // Optional status message
  error?: string | any;  // Error details if operation failed
}
```

## Methods

### `createFile(fileName, source, filePath)`

Creates a new file with the specified content.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| fileName | string | Yes | The name of the file to create |
| source | string | Yes | The source content to write into the file |
| filePath | string | Yes | The directory path where the file should be created |

**Response:**
```typescript
{
  success: boolean;
  path?: string;         // Full path of created file
  created?: boolean;     // Whether file was newly created
  bytesWritten?: number; // Number of bytes written
}
```

```typescript
const result = await codebolt.fs.createFile('example.ts', 'const x = 1;', '/path/to/dir');
if (result.success) {
  console.log(`Created: ${result.path}, ${result.bytesWritten} bytes`);
}
```

---

### `createFolder(folderName, folderPath)`

Creates a new folder.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| folderName | string | Yes | The name of the folder to create |
| folderPath | string | Yes | The path where the folder should be created |

**Response:**
```typescript
{
  success: boolean;
  path?: string;     // Full path of created folder
  created?: boolean; // Whether folder was newly created
}
```

```typescript
const result = await codebolt.fs.createFolder('components', '/src');
if (result.success) {
  console.log(`Folder created at: ${result.path}`);
}
```

---

### `readFile(filePath)`

Reads the content of a file.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | The full path of the file to read |

**Response:**
```typescript
{
  success: boolean;
  content?: string;    // The file content
  path?: string;       // Path of the file read
  encoding?: string;   // File encoding (e.g., 'utf-8')
  size?: number;       // File size in bytes
  lineCount?: number;  // Number of lines in file
  truncated?: boolean; // Whether content was truncated
}
```

```typescript
const result = await codebolt.fs.readFile('/path/to/file.ts');
if (result.success) {
  console.log(`Content (${result.lineCount} lines):`);
  console.log(result.content);
}
```

---

### `updateFile(filename, filePath, newContent)`

Updates the content of an existing file.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filename | string | Yes | The name of the file to update |
| filePath | string | Yes | The path of the file to update |
| newContent | string | Yes | The new content to write into the file |

**Response:**
```typescript
{
  success: boolean;
  path?: string;         // Path of updated file
  updated?: boolean;     // Whether file was updated
  bytesWritten?: number; // Number of bytes written
  backupPath?: string;   // Path to backup if created
  changeSummary?: {
    linesAdded: number;
    linesRemoved: number;
    linesModified: number;
  };
}
```

```typescript
const result = await codebolt.fs.updateFile('config.ts', '/src', 'export default {}');
if (result.success && result.changeSummary) {
  console.log(`Lines added: ${result.changeSummary.linesAdded}`);
}
```

---

### `deleteFile(filename, filePath)`

Deletes a file.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filename | string | Yes | The name of the file to delete |
| filePath | string | Yes | The path of the file to delete |

**Response:**
```typescript
{
  success: boolean;
  path?: string;          // Path of deleted file
  deleted?: boolean;      // Whether file was deleted
  moveToTrash?: boolean;  // Whether moved to trash instead
  trashLocation?: string; // Trash location if moved
}
```

```typescript
const result = await codebolt.fs.deleteFile('temp.ts', '/src');
if (result.success) {
  console.log(`Deleted: ${result.path}`);
}
```

---

### `deleteFolder(foldername, folderpath)`

Deletes a folder.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| foldername | string | Yes | The name of the folder to delete |
| folderpath | string | Yes | The path of the folder to delete |

**Response:**
```typescript
{
  success: boolean;
  path?: string;          // Path of deleted folder
  deleted?: boolean;      // Whether folder was deleted
  itemsDeleted?: number;  // Number of items deleted
  moveToTrash?: boolean;  // Whether moved to trash
  trashLocation?: string; // Trash location if moved
}
```

```typescript
const result = await codebolt.fs.deleteFolder('old-components', '/src');
if (result.success) {
  console.log(`Deleted ${result.itemsDeleted} items`);
}
```

---

### `listFile(folderPath, isRecursive?)`

Lists all files in a directory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| folderPath | string | Yes | The path of the folder to list |
| isRecursive | boolean | No | Whether to list files recursively (default: false) |

**Response:**
```typescript
{
  success: boolean;
  files?: string[];     // Array of file paths
  path?: string;        // Directory that was listed
  totalCount?: number;  // Total number of files
  hasMore?: boolean;    // Whether more files exist
  recursive?: boolean;  // Whether search was recursive
}
```

```typescript
const result = await codebolt.fs.listFile('/src', true);
if (result.success) {
  console.log(`Found ${result.totalCount} files:`);
  result.files?.forEach(f => console.log(f));
}
```

---

### `listCodeDefinitionNames(path)`

Lists all code definition names (functions, classes, etc.) in a given path.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| path | string | Yes | The path to search for code definitions |

**Response:**
```typescript
{
  success: boolean;
  definitions?: string[]; // Array of definition names
  result?: string;        // Raw result string
}
```

```typescript
const result = await codebolt.fs.listCodeDefinitionNames('/src/components');
if (result.success) {
  console.log('Definitions:', result.definitions);
}
```

---

### `searchFiles(path, regex, filePattern)`

Searches files using a regex pattern.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| path | string | Yes | The path to search within |
| regex | string | Yes | The regex pattern to search for |
| filePattern | string | Yes | The file pattern to match files (e.g., "*.ts") |

**Response:**
```typescript
{
  success: boolean;
  query?: string;        // The search query used
  path?: string;         // Path that was searched
  totalCount?: number;   // Total matches found
  hasMore?: boolean;     // Whether more results exist
  searchTime?: number;   // Search duration in ms
  results?: Array<{
    path: string;        // File path with matches
    matches: Array<{
      line: number;      // Line number
      lineNumber: number;
      content: string;   // Line content
      startIndex?: number;
      endIndex?: number;
    }>;
  }>;
}
```

```typescript
const result = await codebolt.fs.searchFiles('/src', 'export.*function', '*.ts');
if (result.success) {
  console.log(`Found ${result.totalCount} matches in ${result.searchTime}ms`);
  result.results?.forEach(file => {
    console.log(`\n${file.path}:`);
    file.matches.forEach(m => console.log(`  L${m.lineNumber}: ${m.content}`));
  });
}
```

---

### `grepSearch(path, query, includePattern?, excludePattern?, caseSensitive?)`

Performs a grep search in files.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| path | string | Yes | The path to search within |
| query | string | Yes | The query to search for |
| includePattern | string | No | Pattern of files to include |
| excludePattern | string | No | Pattern of files to exclude |
| caseSensitive | boolean | No | Whether case sensitive (default: true) |

**Response:**
```typescript
{
  success: boolean;
  pattern?: string;        // Search pattern used
  path?: string;           // Path searched
  includePattern?: string; // Include pattern used
  excludePattern?: string; // Exclude pattern used
  totalCount?: number;     // Total matches
  hasMore?: boolean;       // More results exist
  searchTime?: number;     // Duration in ms
  results?: Array<{
    path: string;          // File path
    matches: Array<{
      line: number;
      lineNumber: number;
      content: string;     // Line content
    }>;
  }>;
}
```

```typescript
const result = await codebolt.fs.grepSearch('/src', 'TODO', '*.ts', 'node_modules', false);
if (result.success) {
  console.log(`Found ${result.totalCount} TODOs`);
  result.results?.forEach(file => {
    file.matches.forEach(m => {
      console.log(`${file.path}:${m.lineNumber}: ${m.content}`);
    });
  });
}
```

---

### `fileSearch(query)`

Performs a fuzzy search for files by name.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | The query to search for |

**Response:**
```typescript
{
  success: boolean;
  query?: string;      // Search query used
  results?: string[];  // Array of matching file paths
  result?: string;     // Raw result
}
```

```typescript
const result = await codebolt.fs.fileSearch('component');
if (result.success) {
  console.log('Matching files:', result.results);
}
```

---

### `writeToFile(relPath, newContent)`

Writes content to a file using a relative path.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| relPath | string | Yes | The relative path of the file to write to |
| newContent | string | Yes | The new content to write into the file |

**Response:**
```typescript
{
  success: boolean;
  result?: string;       // Operation result
  bytesWritten?: number; // Bytes written
}
```

```typescript
const result = await codebolt.fs.writeToFile('src/utils/helper.ts', 'export const helper = () => {}');
if (result.success) {
  console.log(`Wrote ${result.bytesWritten} bytes`);
}
```

---

### `editFileWithDiff(targetFile, codeEdit, diffIdentifier, prompt, applyModel?)`

Edits a file by applying a diff.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| targetFile | string | Yes | The target file to edit |
| codeEdit | string | Yes | The code edit/diff to apply |
| diffIdentifier | string | Yes | The diff identifier |
| prompt | string | Yes | The prompt describing the edit |
| applyModel | string | No | The model to use for applying |

**Response:**
```typescript
{
  success: boolean;
  filePath?: string;      // Target file path
  diff?: string;          // Diff applied
  diffIdentifier?: string;
  prompt?: string;
  applyModel?: string;
  result?: string | {
    status: 'success' | 'error' | 'review_started' | 'rejected';
    file: string;
    message: string;
  };
}
```

```typescript
const result = await codebolt.fs.editFileWithDiff(
  '/src/component.ts',
  '- old line\n+ new line',
  'diff-001',
  'Fix the bug in component'
);
if (result.success) {
  console.log('Diff applied:', result.result);
}
```

---

### `readManyFiles(params)`

Reads multiple files based on paths, patterns, or glob expressions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| params.paths | string[] | Yes | Array of file paths, directory paths, or glob patterns |
| params.include | string[] | No | Glob patterns for files to include |
| params.exclude | string[] | No | Glob patterns for files/directories to exclude |
| params.recursive | boolean | No | Whether to search recursively |
| params.use_default_excludes | boolean | No | Use default exclusions (node_modules, .git) |
| params.max_files | number | No | Maximum number of files to read |
| params.max_total_size | number | No | Maximum total size (bytes) |
| params.include_metadata | boolean | No | Include file metadata |
| params.separator_format | string | No | Custom separator format |
| params.notifyUser | boolean | No | Whether to notify user |

**Response:**
```typescript
{
  success: boolean;
  results?: Array<{
    path: string;      // File path
    content?: string;  // File content
    error?: any;       // Error if failed to read
  }>;
  summary?: {
    total: number;     // Total files attempted
    successful: number; // Successfully read
    failed: number;    // Failed to read
  };
}
```

```typescript
const result = await codebolt.fs.readManyFiles({
  paths: ['/project/src'],
  include: ['**/*.ts'],
  exclude: ['**/*.test.ts'],
  recursive: true,
  max_files: 100
});

if (result.success) {
  console.log(`Read ${result.summary?.successful}/${result.summary?.total} files`);
  result.results?.forEach(file => {
    if (file.content) {
      console.log(`${file.path}: ${file.content.length} chars`);
    }
  });
}
```

---

### `listDirectory(params)`

Lists directory contents with advanced options.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| params.path | string | Yes | The path to the directory to list |
| params.ignore | string[] | No | Glob patterns for items to ignore |
| params.show_hidden | boolean | No | Whether to show hidden files |
| params.detailed | boolean | No | Include detailed info (size, permissions) |
| params.limit | number | No | Maximum entries to return |
| params.notifyUser | boolean | No | Whether to notify user |

**Response:**
```typescript
{
  success: boolean;
  path?: string;         // Directory listed
  totalCount?: number;   // Total entries
  hasMore?: boolean;     // More entries exist
  entries?: Array<{
    name: string;        // Entry name
    path: string;        // Full path
    type: 'file' | 'directory' | 'symlink' | 'other';
    size?: number;       // Size in bytes
    permissions?: string; // e.g., 'rwxr-xr-x'
    modifiedTime?: Date;
    isHidden?: boolean;
  }>;
  stats?: {
    totalSize: number;
    fileCount: number;
    directoryCount: number;
  };
}
```

```typescript
const result = await codebolt.fs.listDirectory({
  path: '/src',
  show_hidden: false,
  detailed: true,
  limit: 50
});

if (result.success) {
  console.log(`${result.stats?.fileCount} files, ${result.stats?.directoryCount} dirs`);
  result.entries?.forEach(entry => {
    const icon = entry.type === 'directory' ? '📁' : '📄';
    console.log(`${icon} ${entry.name} (${entry.size} bytes)`);
  });
}
```

## Examples

### Reading and Processing Multiple Files

```typescript
// Read all TypeScript files in src
const result = await codebolt.fs.readManyFiles({
  paths: ['/project/src'],
  include: ['**/*.ts'],
  exclude: ['**/*.test.ts', '**/*.spec.ts'],
  recursive: true
});

if (result.success) {
  // Process each file
  for (const file of result.results || []) {
    if (file.content) {
      console.log(`File: ${file.path}`);
      console.log(`Lines: ${file.content.split('\n').length}`);
    }
  }
}
```

### Search and Replace Pattern

```typescript
// Find all files containing a pattern
const searchResult = await codebolt.fs.grepSearch('/src', 'oldFunction', '*.ts');

if (searchResult.success) {
  // Read and update each file
  for (const file of searchResult.results || []) {
    const readResult = await codebolt.fs.readFile(file.path);
    if (readResult.success && readResult.content) {
      const newContent = readResult.content.replace(/oldFunction/g, 'newFunction');
      await codebolt.fs.writeToFile(file.path, newContent);
    }
  }
}
```

### Directory Tree Exploration

```typescript
// Get detailed directory listing
const listing = await codebolt.fs.listDirectory({
  path: '/project',
  detailed: true,
  show_hidden: false,
  ignore: ['node_modules', '.git', 'dist']
});

if (listing.success) {
  // Separate files and directories
  const dirs = listing.entries?.filter(e => e.type === 'directory') || [];
  const files = listing.entries?.filter(e => e.type === 'file') || [];

  console.log(`Directories: ${dirs.map(d => d.name).join(', ')}`);
  console.log(`Files: ${files.map(f => f.name).join(', ')}`);
}
```
