# Instructions for Adding New Modules

This document explains how to add new codebolt modules to the `codebolt-api-access` skill.

## Directory Structure

```
skills/codebolt_api_access/
├── SKILL.md              # Main skill file (update module table here)
├── INSTRUCTIONS.md       # This file
└── references/
    ├── fs.md             # File system module
    ├── browser.md        # Browser module
    ├── terminal.md       # Terminal module
    └── <new-module>.md   # Add new modules here
```

## Step-by-Step Process

### 1. Locate the Source Module

Find the TypeScript source file in:
```
/packages/codeboltjs/src/modules/<module-name>.ts
```

### 2. Find the Response Types

Response types are defined in:
```
/common/types/src/codeboltjstypes/libFunctionTypes/<module-name>.ts
```

If not found there, check:
```
/common/types/src/sdk-types.ts
/packages/codeboltjs/src/types/socketMessageTypes.ts
```

### 3. Create the Reference File

Create a new file at `references/<module-name>.md` following this template:

```markdown
# codebolt.<module> - <Module Description>

<Brief description of what this module does>

## Response Types

All responses extend a base response with common fields:

\`\`\`typescript
interface Base<Module>Response {
  success?: boolean;  // Whether the operation succeeded
  message?: string;   // Optional status message
  error?: string;     // Error details if operation failed
}
\`\`\`

### <CustomType1>

<Description of when this type is used>

\`\`\`typescript
interface <CustomType1> {
  field1: type;  // Description
  field2: type;  // Description
}
\`\`\`

## Methods

### \`methodName(param1, param2, options?)\`

<Description of what the method does>

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| param1 | string | Yes | Description |
| param2 | number | No | Description (default: value) |

**Response:**
\`\`\`typescript
{
  success: boolean;
  field1?: string;  // Description
  field2?: number;  // Description
}
\`\`\`

\`\`\`typescript
const result = await codebolt.<module>.methodName('value', 123);
if (result.success) {
  console.log(result.field1);
}
\`\`\`

---

### \`nextMethod(...)\`

...

## Examples

### <Use Case Title>

\`\`\`typescript
// Example code showing common usage pattern
\`\`\`
```

### 4. Update SKILL.md

Add the new module to the Module Reference table in `SKILL.md`:

```markdown
## Module Reference

| Module | Description | Reference |
|--------|-------------|-----------|
| `codebolt.fs` | File system operations | [fs.md](references/fs.md) |
| `codebolt.browser` | Browser automation | [browser.md](references/browser.md) |
| `codebolt.terminal` | Command execution | [terminal.md](references/terminal.md) |
| `codebolt.<new>` | <Description> | [<new>.md](references/<new>.md) |  <!-- ADD HERE -->
```

Optionally add a Quick Start example if the module is commonly used.

## Documentation Conventions

### Method Documentation

Each method must include:

1. **Method signature** with all parameters
2. **Parameter table** with types, required/optional, and descriptions
3. **Response type** as inline TypeScript (not just type name)
4. **Usage example** showing success handling

### Response Types

**DO NOT** just reference type names like `Promise<SomeResponse>`. Instead, document the actual structure:

```markdown
<!-- BAD - Agent won't understand this -->
**Returns:** `Promise<SearchFilesResponse>`

<!-- GOOD - Agent knows exactly what to expect -->
**Response:**
\`\`\`typescript
{
  success: boolean;
  results?: Array<{
    path: string;
    matches: Array<{
      line: number;
      content: string;
    }>;
  }>;
  totalCount?: number;
}
\`\`\`
```

### Optional Fields

Mark optional fields with `?` and document their meaning:

```typescript
{
  success: boolean;      // Always present
  data?: string;         // Only present on success
  error?: string;        // Only present on failure
  count?: number;        // May be omitted if zero
}
```

### Complex Types

For complex/nested types, define them in the Response Types section at the top:

```markdown
## Response Types

### FileEntry

Used in directory listing responses:

\`\`\`typescript
interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
}
\`\`\`

## Methods

### \`listDirectory(path)\`

**Response:**
\`\`\`typescript
{
  success: boolean;
  entries?: FileEntry[];  // See FileEntry type above
}
\`\`\`
```

### Examples Section

Include 2-4 practical examples showing:
- Basic usage
- Error handling
- Common workflows
- Edge cases if relevant

## Checklist Before Submitting

- [ ] Read the source module file completely
- [ ] Read the response type definitions
- [ ] Document ALL public methods (not internal/helper functions)
- [ ] Include inline response types (not just type names)
- [ ] Add usage examples for each method
- [ ] Add 2-4 practical examples at the end
- [ ] Update the module table in SKILL.md
- [ ] Verify all code examples are syntactically correct

## Available Modules to Add

These modules exist in `/packages/codeboltjs/src/modules/` but are not yet documented:

| Module | Source File | Priority |
|--------|-------------|----------|
| `codebolt.chat` | `chat.ts` | High |
| `codebolt.git` | `git.ts` | High |
| `codebolt.llm` | `llm.ts` | High |
| `codebolt.project` | `project.ts` | Medium |
| `codebolt.crawler` | `crawlwer.ts` | Medium |
| `codebolt.dbmemory` | `dbmemory.ts` | Medium |
| `codebolt.codeutils` | `codeutils.ts` | Medium |
| `codebolt.search` | `search.ts` | Medium |
| `codebolt.vectordb` | `vectordb.ts` | Low |
| `codebolt.knowledge` | `knowledge.ts` | Low |

Check the modules directory for the complete list:
```bash
ls /packages/codeboltjs/src/modules/
```
