# Agent YAML Configuration

Every code-based agent requires a `codeboltagent.yaml` file that defines metadata, routing, LLM configuration, and actions.

---

## File Location

```
my-agent/
├── codeboltagent.yaml    # Agent configuration (required)
├── package.json
├── src/
│   └── index.ts          # Agent code
├── dist/
│   └── index.js          # Compiled output
└── tsconfig.json
```

---

## Complete Example

```yaml
title: Code Review Agent
unique_id: code-review-agent
version: 1.0.0
author: codebolt

initial_message: Hello! I'm your code review assistant. Share code or select files to review.
description: Expert code reviewer for quality and security
longDescription: >
  A comprehensive code review agent that analyzes your code for:
  - Security vulnerabilities (OWASP Top 10)
  - Performance issues and optimizations
  - Code style and best practices
  - Potential bugs and edge cases

tags:
  - code-review
  - security
  - quality

avatarSrc: https://cdn.codebolt.ai/avatars/code-reviewer.png
avatarFallback: CR

metadata:
  agent_routing:
    worksonblankcode: false
    worksonexistingcode: true
    supportedlanguages:
      - typescript
      - javascript
      - python
      - java
      - go
    supportedframeworks:
      - react
      - node
      - express
      - fastapi
      - spring
    supportRemix: true

  defaultagentllm:
    strict: true
    modelorder:
      - claude-sonnet-4-20250514
      - gpt-4-turbo
      - gpt-4

  llm_role:
    - name: securityllm
      description: LLM specialized for security analysis
      strict: false
      modelorder:
        - claude-sonnet-4-20250514
        - gpt-4-turbo

    - name: performancellm
      description: LLM for performance optimization suggestions
      strict: false
      modelorder:
        - gpt-4-turbo
        - claude-sonnet-4-20250514

  sdlc_steps_managed:
    - name: code_review
      example_instructions:
        - Review this PR for security issues
        - Check code quality and suggest improvements

actions:
  - name: Security Audit
    description: Deep security vulnerability scan
    detailDescription: >
      Performs comprehensive security analysis including OWASP Top 10,
      dependency vulnerabilities, and authentication issues.
    actionPrompt: >
      Perform a comprehensive security audit on this code.
      Check for OWASP Top 10 vulnerabilities, insecure dependencies,
      and authentication/authorization issues.

  - name: Performance Review
    description: Analyze performance bottlenecks
    detailDescription: >
      Identifies performance issues including N+1 queries,
      memory leaks, and algorithmic inefficiencies.
    actionPrompt: >
      Analyze this code for performance issues.
      Look for N+1 queries, memory leaks, inefficient algorithms,
      and suggest optimizations.

  - name: Quick Review
    description: Fast code quality check
    detailDescription: Brief review covering major issues only.
    actionPrompt: >
      Do a quick code review focusing on critical issues only.
      Keep feedback concise and actionable.
```

---

## Field Reference

### Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Display name shown in UI |
| `unique_id` | string | Yes | Unique identifier (no spaces, lowercase) |
| `version` | string | Yes | Semantic version (e.g., "1.0.0") |
| `author` | string | Yes | Creator name or organization |
| `initial_message` | string | Yes | First message shown when agent starts |
| `description` | string | Yes | Short description (50-100 chars) |
| `longDescription` | string | No | Detailed description (supports markdown) |
| `tags` | string[] | No | Categorization tags for search/filter |
| `avatarSrc` | string | No | URL to avatar image |
| `avatarFallback` | string | No | 1-2 character fallback for avatar |

### Metadata.agent_routing

Controls when and how the agent is routed to users.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `worksonblankcode` | boolean | true | Can work on empty/new projects |
| `worksonexistingcode` | boolean | true | Can work on existing codebases |
| `supportedlanguages` | string[] | [] | Languages this agent handles well |
| `supportedframeworks` | string[] | [] | Frameworks this agent specializes in |
| `supportRemix` | boolean | false | Allow users to create remix agents from this |

```yaml
metadata:
  agent_routing:
    worksonblankcode: true
    worksonexistingcode: true
    supportedlanguages:
      - typescript
      - javascript
    supportedframeworks:
      - react
      - nextjs
    supportRemix: true
```

### Metadata.defaultagentllm

Default LLM configuration for the agent.

| Field | Type | Description |
|-------|------|-------------|
| `strict` | boolean | If true, must use specified models exactly |
| `modelorder` | string[] | Preferred models in priority order |

```yaml
metadata:
  defaultagentllm:
    strict: true
    modelorder:
      - claude-sonnet-4-20250514
      - gpt-4-turbo
      - gpt-4
      - gpt-3.5-turbo
```

### Metadata.llm_role

Define specialized LLM configurations for different tasks.

```yaml
metadata:
  llm_role:
    - name: documentationllm
      description: LLM for writing documentation
      strict: false
      modelorder:
        - gpt-4-turbo
        - claude-sonnet-4-20250514

    - name: testingllm
      description: LLM for generating tests
      strict: true
      modelorder:
        - gpt-4-turbo

    - name: actionllm
      description: LLM for executing actions
      strict: false
      modelorder:
        - claude-sonnet-4-20250514
```

**Usage in code:**

```typescript
const agentStep = new AgentStep({
  llmRole: 'documentationllm'  // Uses the documentationllm config
});
```

### Metadata.sdlc_steps_managed

Define which SDLC phases this agent handles.

```yaml
metadata:
  sdlc_steps_managed:
    - name: planning
      example_instructions:
        - Help me plan this feature
        - Create a technical spec

    - name: implementation
      example_instructions:
        - Implement this function
        - Write the API endpoint

    - name: testing
      example_instructions:
        - Write unit tests
        - Create integration tests

    - name: code_review
      example_instructions:
        - Review this PR
        - Check for security issues
```

### Actions

Actions are quick commands users can trigger from the UI.

```yaml
actions:
  - name: ActionName           # Button label
    description: Short text    # Tooltip/subtitle
    detailDescription: >       # Detailed help text
      Full explanation of what this action does
      and when to use it.
    actionPrompt: >            # Prompt sent to agent
      The actual instruction sent to the agent
      when user clicks this action.
```

**Example actions:**

```yaml
actions:
  - name: Explain
    description: Explain selected code
    detailDescription: Get a detailed explanation of how the code works
    actionPrompt: Please explain this code in detail, including its purpose and how it works.

  - name: Optimize
    description: Optimize for performance
    detailDescription: Analyze and optimize code for better performance
    actionPrompt: Analyze this code for performance issues and suggest optimizations.

  - name: Add Tests
    description: Generate unit tests
    detailDescription: Create comprehensive unit tests for the selected code
    actionPrompt: Write comprehensive unit tests for this code using the project's testing framework.

  - name: Document
    description: Add documentation
    detailDescription: Generate JSDoc/docstring documentation
    actionPrompt: Add comprehensive documentation comments to this code.
```

---

## TypeScript Type Definition

```typescript
type AgentYamlConfig = {
  title: string;
  version: string;
  unique_id: string;

  initial_message: string;
  description: string;
  longDescription?: string;

  tags?: string[];

  avatarSrc?: string;
  avatarFallback?: string;

  metadata?: {
    agent_routing?: {
      worksonblankcode?: boolean;
      worksonexistingcode?: boolean;
      supportedlanguages?: string[];
      supportedframeworks?: string[];
      supportRemix?: boolean;
    };

    defaultagentllm?: {
      strict?: boolean;
      modelorder?: string[];
    };

    llm_role?: Array<{
      name: string;
      description: string;
      strict?: boolean;
      modelorder?: string[];
    }>;

    sdlc_steps_managed?: Array<{
      name: string;
      example_instructions?: string[];
    }>;
  };

  actions?: Array<{
    name: string;
    description: string;
    detailDescription?: string;
    actionPrompt: string;
  }>;

  author: string;
};
```

---

## Minimal Example

```yaml
title: Simple Assistant
unique_id: simple-assistant
version: 1.0.0
author: my-name

initial_message: Hi! How can I help?
description: A simple coding assistant

avatarFallback: SA

actions:
  - name: Help
    description: Get help
    actionPrompt: Please help me with this
```

---

## Best Practices

### 1. Clear Unique IDs
```yaml
unique_id: code-review-agent    # Good - descriptive, lowercase, hyphenated
unique_id: agent1               # Bad - not descriptive
unique_id: Code Review Agent    # Bad - spaces and uppercase
```

### 2. Helpful Initial Messages
```yaml
# Good - sets expectations
initial_message: >
  Hello! I'm your code review assistant. I can analyze your code for
  security issues, performance problems, and best practices.
  Share a file or select code to get started.

# Bad - too generic
initial_message: Hello!
```

### 3. Specific Model Orders
```yaml
# Good - specific to task requirements
modelorder:
  - claude-sonnet-4-20250514   # Best for code analysis
  - gpt-4-turbo                # Good fallback

# Consider task requirements when ordering
```

### 4. Useful Actions
```yaml
# Good - specific and actionable
actions:
  - name: Security Audit
    description: Check for OWASP vulnerabilities
    actionPrompt: Perform a security audit focusing on OWASP Top 10...

# Bad - too vague
actions:
  - name: Review
    description: Review code
    actionPrompt: Review this
```

### 5. Language/Framework Specificity
```yaml
# Good - be specific about what you support well
supportedlanguages:
  - typescript
  - javascript
supportedframeworks:
  - react
  - nextjs
  - express

# Bad - claiming everything (unless truly general-purpose)
supportedlanguages: []  # Empty means "all" but may disappoint users
```
