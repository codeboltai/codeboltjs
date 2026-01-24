# codebolt.codeutils - Code Utility Module

A utility module for working with code, including file operations, pattern matching, and matcher management.

## Response Types

All responses extend a base response with common fields:

```typescript
interface BaseResponse {
  success?: boolean;  // Whether the operation succeeded
  message?: string;   // Optional status message
  error?: string;     // Error details if operation failed
}
```

### FileInfo

Represents a file with its content and metadata:

```typescript
interface FileInfo {
  path: string;        // Full file path
  content: string;     // File content
  language?: string;   // Detected programming language
}
```

### FileMatch

Represents a pattern match found in a file:

```typescript
interface FileMatch {
  file: string;                          // Path to the file containing the match
  line: number;                          // Line number of the match
  column: number;                        // Column position of the match
  message: string;                       // Match description or message
  severity: 'error' | 'warning' | 'info';  // Severity level
}
```

### Matcher

Represents a code pattern matcher:

```typescript
interface Matcher {
  name: string;        // Unique matcher name
  description: string; // Description of what the matcher finds
  language: string;    // Target programming language
  pattern: string;     // Regex pattern used for matching
  examples?: string[]; // Optional example matches (for matchDetail only)
}
```

## Methods

### `getAllFilesAsMarkDown()`

Retrieves all project files as formatted Markdown content.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| - | - | - | No parameters |

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  markdown?: string;     // Combined Markdown of all files
  files?: FileInfo[];    // Array of file objects with path, content, language
}
```

```typescript
const result = await codebolt.codeutils.getAllFilesAsMarkDown();
if (result.success && result.markdown) {
  console.log(`Found ${result.files?.length || 0} files`);
  console.log(result.markdown);
}
```

---

### `performMatch(matcherDefinition, problemPatterns, problems?)`

Performs a pattern matching operation to find code issues based on defined patterns.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| matcherDefinition | object | Yes | Definition of the matcher (name, pattern, language, etc.) |
| problemPatterns | any[] | Yes | Array of patterns to match against (regex patterns with severity levels) |
| problems | any[] | No | Optional list of pre-existing problems to include (default: []) |

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  matches?: FileMatch[];  // Array of matches found in files
}
```

```typescript
const matcherDefinition = {
  name: 'unused-variable',
  language: 'javascript',
  pattern: 'const\\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*='
};

const problemPatterns = [
  {
    pattern: 'console\\.log\\(',
    severity: 'warning',
    message: 'Console.log statement found'
  }
];

const result = await codebolt.codeutils.performMatch(matcherDefinition, problemPatterns);
if (result.success && result.matches) {
  result.matches.forEach(match => {
    console.log(`[${match.severity.toUpperCase()}] ${match.file}:${match.line} - ${match.message}`);
  });
}
```

---

### `getMatcherList()`

Retrieves the list of all available code matchers.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| - | - | - | No parameters |

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  matchers?: Matcher[];  // Array of available matchers
}
```

```typescript
const result = await codebolt.codeutils.getMatcherList();
if (result.success && result.matchers) {
  console.log(`Available matchers: ${result.matchers.length}`);
  result.matchers.forEach(matcher => {
    console.log(`- ${matcher.name} (${matcher.language}): ${matcher.description}`);
  });
}
```

---

### `matchDetail(matcher)`

Retrieves detailed information about a specific matcher by name or identifier.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| matcher | string | Yes | The matcher name or identifier to retrieve details for |

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  matcher?: {
    name: string;        // Matcher name
    description: string; // Description
    language: string;    // Target language
    pattern: string;     // Regex pattern
    examples?: string[]; // Example matches
  };
}
```

```typescript
const result = await codebolt.codeutils.matchDetail('unused-variable');
if (result.success && result.matcher) {
  console.log(`Matcher: ${result.matcher.name}`);
  console.log(`Pattern: ${result.matcher.pattern}`);
  console.log(`Examples: ${result.matcher.examples?.join(', ') || 'None'}`);
}
```

## Examples

### Finding Code Issues with Custom Patterns

```typescript
// Define a custom matcher for common JavaScript issues
const matcherDefinition = {
  name: 'js-best-practices',
  language: 'javascript'
};

const problemPatterns = [
  {
    pattern: 'var\\s+',
    severity: 'warning',
    message: 'Consider using let or const instead of var'
  },
  {
    pattern: '==\\s*[^=]',
    severity: 'warning',
    message: 'Use === for strict equality comparison'
  },
  {
    pattern: 'debugger;',
    severity: 'error',
    message: 'Debugger statement found'
  }
];

const result = await codebolt.codeutils.performMatch(matcherDefinition, problemPatterns);

if (result.success) {
  const errors = result.matches?.filter(m => m.severity === 'error') || [];
  const warnings = result.matches?.filter(m => m.severity === 'warning') || [];
  
  console.log(`Found ${errors.length} errors and ${warnings.length} warnings`);
  
  result.matches?.forEach(match => {
    console.log(`  ${match.file}:${match.line} - [${match.severity}] ${match.message}`);
  });
}
```

### Exploring Available Matchers

```typescript
// Get all available matchers and examine details
const listResult = await codebolt.codeutils.getMatcherList();

if (listResult.success && listResult.matchers) {
  // Group matchers by language
  const byLanguage = listResult.matchers.reduce((acc, matcher) => {
    acc[matcher.language] = acc[matcher.language] || [];
    acc[matcher.language].push(matcher);
    return acc;
  }, {} as Record<string, typeof listResult.matchers>);

  // Display matchers for each language
  for (const [language, matchers] of Object.entries(byLanguage)) {
    console.log(`\n${language.toUpperCase()}:`);
    matchers.forEach(m => console.log(`  - ${m.name}: ${m.description}`));
  }

  // Get details for a specific matcher
  if (listResult.matchers.length > 0) {
    const detailResult = await codebolt.codeutils.matchDetail(listResult.matchers[0].name);
    if (detailResult.success && detailResult.matcher) {
      console.log(`\nDetailed info for ${detailResult.matcher.name}:`);
      console.log(`  Pattern: ${detailResult.matcher.pattern}`);
    }
  }
}
```

### Comprehensive Project Analysis

```typescript
// Combine multiple code utilities for project analysis
async function analyzeProject() {
  // Get all files as markdown for overview
  const markdownResult = await codebolt.codeutils.getAllFilesAsMarkDown();
  
  if (!markdownResult.success) {
    console.error('Failed to get project files');
    return;
  }

  const fileCount = markdownResult.files?.length || 0;
  console.log(`Analyzing ${fileCount} files...`);

  // Get available matchers
  const matcherResult = await codebolt.codeutils.getMatcherList();
  
  if (!matcherResult.success || !matcherResult.matchers) {
    console.error('Failed to get matchers');
    return;
  }

  // Use the first available matcher
  const primaryMatcher = matcherResult.matchers[0];
  console.log(`Using matcher: ${primaryMatcher.name}`);
  
  // Perform matching with the primary matcher
  const matchResult = await codebolt.codeutils.performMatch(
    { name: primaryMatcher.name, language: primaryMatcher.language },
    [{ pattern: primaryMatcher.pattern, severity: 'info', message: 'Matched pattern' }]
  );

  if (matchResult.success && matchResult.matches) {
    const issueCount = matchResult.matches.length;
    console.log(`Found ${issueCount} issues across ${fileCount} files`);
    
    // Group by file
    const byFile = matchResult.matches.reduce((acc, match) => {
      acc[match.file] = acc[match.file] || [];
      acc[match.file].push(match);
      return acc;
    }, {} as Record<string, typeof matchResult.matches>);

    for (const [file, matches] of Object.entries(byFile)) {
      console.log(`\n${file} (${matches.length} issues)`);
      matches.slice(0, 5).forEach(m => {
        console.log(`  Line ${m.line}: ${m.message}`);
      });
    }
  }
}

await analyzeProject();
```

### Targeted Pattern Matching for Specific Language

```typescript
// Find patterns in a specific language (e.g., TypeScript)
async function findTypeScriptIssues() {
  const tsMatcher = {
    name: 'typescript-issues',
    language: 'typescript'
  };

  const tsPatterns = [
    {
      pattern: ':\\s*any\\b',
      severity: 'warning',
      message: 'Avoid using "any" type'
    },
    {
      pattern: '\\.then\\(',
      severity: 'info',
      message: 'Consider using async/await instead of .then()'
    },
    {
      pattern: '@ts-ignore',
      severity: 'error',
      message: 'TypeScript errors are being ignored'
    }
  ];

  const result = await codebolt.codeutils.performMatch(tsMatcher, tsPatterns);

  if (result.success) {
    const summary = {
      total: result.matches?.length || 0,
      errors: result.matches?.filter(m => m.severity === 'error').length || 0,
      warnings: result.matches?.filter(m => m.severity === 'warning').length || 0,
      info: result.matches?.filter(m => m.severity === 'info').length || 0
    };

    console.log('TypeScript Analysis Summary:');
    console.log(`  Total issues: ${summary.total}`);
    console.log(`  Errors: ${summary.errors}`);
    console.log(`  Warnings: ${summary.warnings}`);
    console.log(`  Info: ${summary.info}`);

    if (summary.errors > 0) {
      console.log('\nCritical errors to fix:');
      result.matches
        ?.filter(m => m.severity === 'error')
        .slice(0, 5)
        .forEach(m => {
          console.log(`  ${m.file}:${m.line} - ${m.message}`);
        });
    }
  }
}

await findTypeScriptIssues();
```
