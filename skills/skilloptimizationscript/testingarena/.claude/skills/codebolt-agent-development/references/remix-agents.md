# Remix Agents (No-Code)

Create agents without writing code using markdown files with YAML frontmatter.

---

## Overview

Remix Agents are file-based agents stored as markdown files in `.codebolt/agents/remix/`. They provide:

- **No-code agent creation** - Configure via YAML, customize with markdown
- **Portability** - Share agents as simple text files
- **Compatibility** - Works with OpenCode, Factory.ai, Claude Code
- **Quick customization** - "Remix" existing agents with your tweaks

---

## File Location

```
project/
└── .codebolt/
    └── agents/
        └── remix/
            ├── my-code-reviewer.md
            ├── documentation-writer.md
            └── bug-fixer.md
```

Or globally in `~/.codebolt/agents/remix/`

---

## File Format

A Remix Agent file has two parts:

1. **YAML Frontmatter** - Configuration between `---` markers
2. **Markdown Body** - Custom instructions for the agent

```markdown
---
name: my-agent-name
description: What this agent does
model: claude-sonnet-4-20250514
provider: anthropic
tools:
  - codebolt--readFile
  - codebolt--writeFile
maxSteps: 100
reasoningEffort: medium
skills:
  - skill-name
remixedFromId: base-agent-id
remixedFromTitle: Base Agent Name
version: 1.0.0
---

# Custom Instructions

Your markdown instructions here...
```

---

## Frontmatter Fields

### Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Agent identifier (becomes filename) |
| `description` | string | Yes | Brief description of the agent |

### Model Configuration

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `model` | string | - | Model ID (e.g., "claude-sonnet-4-20250514", "gpt-4") |
| `provider` | string | - | Provider name ("anthropic", "openai", etc.) |
| `reasoningEffort` | 'low' \| 'medium' \| 'high' | - | Reasoning intensity for supported models |

### Capabilities

| Field | Type | Description |
|-------|------|-------------|
| `tools` | string[] | Array of tool IDs (format: `mcpName--toolName`) |
| `skills` | string[] | Skills to auto-load |
| `maxSteps` | number | Maximum agentic iterations |
| `permissions` | object | Tool permissions configuration |

### Remix Metadata

| Field | Type | Description |
|-------|------|-------------|
| `remixedFromId` | string | Original agent ID this was remixed from |
| `remixedFromTitle` | string | Original agent's display name |
| `additionalSubAgent` | any[] | Sub-agents to include |

### Display

| Field | Type | Description |
|-------|------|-------------|
| `avatarSrc` | string | Avatar image URL |
| `avatarFallback` | string | Fallback text for avatar |
| `version` | string | Agent version (e.g., "1.0.0") |
| `metadata` | object | Additional metadata |

### System (Auto-managed)

| Field | Type | Description |
|-------|------|-------------|
| `createdAt` | string | ISO timestamp of creation |
| `updatedAt` | string | ISO timestamp of last update |
| `type` | 'remix' | Always set to 'remix' |

---

## Examples

### Code Review Agent

```markdown
---
name: strict-code-reviewer
description: Thorough code reviewer with security focus
model: claude-sonnet-4-20250514
provider: anthropic
tools:
  - codebolt--readFile
  - codebolt--listFiles
  - codebolt--search
maxSteps: 50
reasoningEffort: high
remixedFromId: base-coding-agent
version: 1.0.0
---

# Code Review Instructions

You are a strict code reviewer. For every code review:

## Security Checks
- Look for SQL injection vulnerabilities
- Check for XSS attack vectors
- Verify proper authentication/authorization
- Scan for hardcoded secrets

## Quality Checks
- Verify error handling
- Check for edge cases
- Review naming conventions
- Assess code complexity

## Output Format
Provide findings as:
- **Critical**: Must fix before merge
- **Warning**: Should fix
- **Info**: Suggestions for improvement
```

### Documentation Writer

```markdown
---
name: docs-writer
description: Creates comprehensive documentation
model: claude-sonnet-4-20250514
provider: anthropic
tools:
  - codebolt--readFile
  - codebolt--writeFile
  - codebolt--listFiles
skills:
  - technical-writing
maxSteps: 100
version: 1.0.0
---

# Documentation Writer

You write clear, comprehensive documentation.

## Style Guide
- Use active voice
- Keep sentences short
- Include code examples
- Add diagrams when helpful

## Structure
1. Overview/Introduction
2. Quick Start
3. Detailed Guide
4. API Reference
5. Examples
6. Troubleshooting
```

### Bug Fixer with Sub-Agents

```markdown
---
name: bug-hunter
description: Finds and fixes bugs systematically
model: claude-sonnet-4-20250514
provider: anthropic
tools:
  - codebolt--readFile
  - codebolt--writeFile
  - codebolt--terminal
  - codebolt--search
maxSteps: 150
additionalSubAgent:
  - agentId: test-runner
    title: Test Runner
  - agentId: debugger
    title: Debugger
version: 1.0.0
---

# Bug Hunter Instructions

You systematically find and fix bugs.

## Process
1. **Reproduce** - Understand and reproduce the bug
2. **Isolate** - Find the root cause
3. **Fix** - Implement the minimal fix
4. **Verify** - Run tests to confirm fix
5. **Document** - Add comments explaining the fix

## Rules
- Never make unrelated changes
- Add regression tests for bugs
- Prefer minimal, targeted fixes
```

### Minimal Agent (Read-Only)

```markdown
---
name: code-explainer
description: Explains code without modifications
tools: read-only
maxSteps: 20
---

# Code Explainer

You explain code clearly and concisely.

- Break down complex logic step by step
- Explain the "why" not just the "what"
- Use analogies when helpful
- Highlight potential issues or improvements
```

---

## Tool Selection

### Specifying Individual Tools

```yaml
tools:
  - codebolt--readFile
  - codebolt--writeFile
  - codebolt--search
  - codebolt--terminal
  - github--createPullRequest
```

### Using Tool Categories

```yaml
tools: read-only    # Only read operations
tools: all          # All available tools
```

### Common Tool IDs

| Tool ID | Description |
|---------|-------------|
| `codebolt--readFile` | Read file contents |
| `codebolt--writeFile` | Write/create files |
| `codebolt--listFiles` | List directory contents |
| `codebolt--search` | Search in files |
| `codebolt--terminal` | Execute terminal commands |
| `codebolt--git` | Git operations |

---

## Creating via UI

Remix Agents can also be created through the Codebolt UI:

1. Select an existing agent to remix
2. Customize name, description
3. Select tools from available MCPs
4. Add sub-agents if needed
5. Configure model/provider (optional)
6. Write custom instructions
7. Save

The UI creates the markdown file automatically in `.codebolt/agents/remix/`.

---

## Programmatic Access

### List All Remix Agents

```typescript
// Via API
const response = await fetch('/api/agent/remix');
const { remixAgents } = await response.json();
```

### Create Remix Agent

```typescript
const agentData = {
  name: 'my-agent',
  description: 'My custom agent',
  model: 'claude-sonnet-4-20250514',
  provider: 'anthropic',
  tools: ['codebolt--readFile'],
  customInstructions: '# Instructions\n\nYou are...'
};

await fetch('/api/agent/remix', {
  method: 'POST',
  body: JSON.stringify(agentData)
});
```

### Update Remix Agent

```typescript
await fetch(`/api/agent/remix/${encodeURIComponent(agentName)}`, {
  method: 'PUT',
  body: JSON.stringify(updateData)
});
```

### Delete Remix Agent

```typescript
await fetch(`/api/agent/remix/${encodeURIComponent(agentName)}`, {
  method: 'DELETE'
});
```

---

## When to Use Remix Agents

| Scenario | Use Remix Agent? |
|----------|------------------|
| Quick customization of existing agent | Yes |
| Non-developer creating an agent | Yes |
| Prototyping before full implementation | Yes |
| Need custom agent loop logic | No, use Level 2/3 |
| Complex multi-step workflows | No, use Workflows |
| Reusable logic across agents | No, use ActionBlocks |
| Need programmatic tool creation | No, use createTool() |

---

## Migration to Code Agents

When a Remix Agent needs more complexity:

```typescript
// Convert Remix Agent concept to CodeboltAgent
import { CodeboltAgent } from '@codebolt/agent/unified';
import { CoreSystemPromptModifier, ToolInjectionModifier } from '@codebolt/agent/processor-pieces';

// Original remix agent custom instructions become the system prompt
const customInstructions = `
# Code Review Instructions
You are a strict code reviewer...
`;

const agent = new CodeboltAgent({
  instructions: customInstructions,
  processors: {
    messageModifiers: [
      new CoreSystemPromptModifier({
        customSystemPrompt: customInstructions
      }),
      new ToolInjectionModifier({
        toolFilter: (t) => ['readFile', 'search'].some(name => t.name.includes(name))
      })
    ]
  }
});
```

---

## Best Practices

### 1. Clear Naming
```yaml
name: security-focused-reviewer  # Good - descriptive
name: agent1                     # Bad - unclear
```

### 2. Detailed Instructions
```markdown
# Good - specific and actionable
When reviewing code:
1. Check for SQL injection in all database queries
2. Verify input validation on user-supplied data

# Bad - vague
Review the code for issues.
```

### 3. Appropriate Tool Selection
```yaml
# Good - minimal required tools
tools:
  - codebolt--readFile
  - codebolt--search

# Avoid - overly permissive
tools: all
```

### 4. Version Your Agents
```yaml
version: 1.0.0  # Semantic versioning
```

### 5. Document the Base Agent
```yaml
remixedFromId: base-coding-agent
remixedFromTitle: Base Coding Agent  # Human-readable reference
```
