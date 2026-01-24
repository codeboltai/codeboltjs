---
name: codebolt-api-access
description: Use when you need to call codebolt modules (fs, browser, terminal, git, chat, llm, thread, todo, memory, task, swarm, job, roadmap, autoTesting, mcp, actionPlan)
---

# Codebolt API Access

This skill provides reference documentation for direct TypeScript SDK calls to codebolt modules.

## Quick Start

### File System
```typescript
import codebolt from '@anthropic/codeboltjs';

// Read and write files
const content = await codebolt.fs.readFile('/path/to/file.ts');
await codebolt.fs.createFile('newfile.ts', 'const x = 1;', '/path/to/dir');

// Search files
const results = await codebolt.fs.grepSearch('/src', 'function', '*.ts');
```

### Browser
```typescript
import codebolt from '@anthropic/codeboltjs';

await codebolt.browser.goToPage('https://example.com');
const screenshot = await codebolt.browser.screenshot();
const markdown = await codebolt.browser.getMarkdown();
await codebolt.browser.close();
```

### Terminal
```typescript
import codebolt from '@anthropic/codeboltjs';

const result = await codebolt.terminal.executeCommand('npm install');
const stream = codebolt.terminal.executeCommandWithStream('npm run dev');
stream.on('commandOutput', (data) => console.log(data));
```

### Git
```typescript
import codebolt from '@anthropic/codeboltjs';

await codebolt.git.init('/path/to/project');
await codebolt.git.addAll();
await codebolt.git.commit('Add new feature');
await codebolt.git.push();
const status = await codebolt.git.status();
```

### LLM
```typescript
import codebolt from '@anthropic/codeboltjs';

const response = await codebolt.llm.inference({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is TypeScript?' }
  ],
  tool_choice: 'auto',
  max_tokens: 1000,
  temperature: 0.7
});
console.log(response.completion.content);
```

### Thread
```typescript
import codebolt from '@anthropic/codeboltjs';

const thread = await codebolt.thread.createThread({
  name: 'Feature Discussion',
  threadType: 'discussion',
  agentId: 'agent-123'
});

await codebolt.thread.startThread(thread.thread.id, {
  initialMessage: 'Lets discuss new feature requirements.'
});

const messages = await codebolt.thread.getThreadMessages({
  threadId: thread.thread.id,
  limit: 50
});
```

### Swarm
```typescript
import codebolt from '@anthropic/codeboltjs';

const swarm = await codebolt.swarm.createSwarm({
  name: 'Processing Swarm',
  allowExternalAgents: false,
  maxAgents: 10
});

const agent = await codebolt.swarm.registerAgent(swarm.data.swarm.id, {
  name: 'Agent Alpha',
  agentType: 'internal'
});

const team = await codebolt.swarm.createTeam(swarm.data.swarm.id, {
  name: 'Processing Team',
  maxMembers: 5
});

const role = await codebolt.swarm.createRole(swarm.data.swarm.id, {
  name: 'Data Processor',
  permissions: ['task:execute', 'data:read'],
  maxAssignees: 5
});
```

### Job
```typescript
import codebolt from '@anthropic/codeboltjs';

const group = await codebolt.job.createJobGroup({
  name: 'Data Processing Jobs'
});

const job = await codebolt.job.createJob(group.data.groupId, {
  title: 'Process dataset',
  priority: 'high',
  estimatedHours: 2
});

await codebolt.job.addDependency(job.data.job.id, otherJobId, 'finish_to_start');
await codebolt.job.lockJob(job.data.job.id, 'agent-001', 'Worker Agent');
await codebolt.job.unlockJob(job.data.job.id, 'agent-001');
```

### MCP Tools
```typescript
import codebolt from '@anthropic/codeboltjs';

const enabled = await codebolt.mcp.getEnabledMCPServers();
const tools = await codebolt.mcp.listMcpFromServers(['filesystem', 'browser']);

const result = await codebolt.mcp.executeTool(
  'filesystem',
  'read_file',
  { path: '/path/to/file.ts' }
);
```

### Auto Testing
```typescript
import codebolt from '@anthropic/codeboltjs';

const suite = await codebolt.autoTesting.createSuite({
  name: 'Authentication Tests'
});

const testCase = await codebolt.autoTesting.addCaseToSuite(suite.data.suite.id, {
  name: 'Valid login',
  steps: ['Navigate', 'Enter credentials', 'Click login'],
  expectedResult: 'Redirected to dashboard'
});

const run = await codebolt.autoTesting.createRun({
  suiteId: suite.data.suite.id,
  name: 'Test Run 001'
});
```

### Memory
```typescript
import codebolt from '@anthropic/codeboltjs';

// Store JSON data
await codebolt.memory.json.save({ theme: 'dark' }, { type: 'config' });
const saved = await codebolt.memory.json.list({ type: 'config' });

// Store markdown notes
await codebolt.memory.markdown.save('# Notes', { topic: 'meetings' });
const notes = await codebolt.memory.markdown.list({ tags: ['meetings'] });
```

## Module Reference

| Module | Description | Reference |
|--------|-------------|-----------|
| `codebolt.fs` | File system operations (read, write, search, diff) | [fs.md](references/fs.md) |
| `codebolt.browser` | Browser automation (navigation, screenshots, DOM) | [browser.md](references/browser.md) |
| `codebolt.terminal` | Command execution (sync, async, streaming) | [terminal.md](references/terminal.md) |
| `codebolt.git` | Git operations (init, clone, commit, push, pull) | [git.md](references/git.md) |
| `codebolt.chat` | Chat & WebSocket communication (messages, process lifecycle, notifications) | [chat.md](references/chat.md) |
| `codebolt.project` | Project management (settings, path, repo map, execution) | [project.md](references/project.md) |
| `codebolt.llm` | LLM inference with tools and model configuration | [llm.md](references/llm.md) |
| `codebolt.agent` | Agent discovery and execution (find, start, list agents) | [agent.md](references/agent.md) |
| `codebolt.thread` | Thread management (create, start, update, delete, messages) | [thread.md](references/thread.md) |
| `codebolt.todo` | Todo list management (add, update, delete, export, import) | [todo.md](references/todo.md) |
| `codebolt.memory` | Persistent memory storage (JSON, Markdown, Todo formats) | [memory.md](references/memory.md) |
| `codebolt.task` | Task management (create, update, delete, assign, execute) | [task.md](references/task.md) |
| `codebolt.codeutils` | Code analysis, matching, and markdown generation | [codeutils.md](references/codeutils.md) |
| `codebolt.search` | Web search operations | [search.md](references/search.md) |
| `codebolt.job` | Job management with pheromones, bidding, locks, blockers | [job.md](references/job.md) |
| `codebolt.swarm` | Swarm orchestration with teams, roles, vacancies | [swarm.md](references/swarm.md) |
| `codebolt.orchestrator` | Orchestrator management and control | [orchestrator.md](references/orchestrator.md) |
| `codebolt.requirementPlan` | Requirement plan document management (sections, review) | [requirementPlan.md](references/requirementPlan.md) |
| `codebolt.actionPlan` | Action plan workflow management (tasks, groups, execution) | [actionPlan.md](references/actionPlan.md) |
| `codebolt.actionBlock` | Action block management and execution | [actionBlock.md](references/actionBlock.md) |
| `codebolt.codebaseSearch` | Semantic code search and MCP tool search | [codebaseSearch.md](references/codebaseSearch.md) |
| `codebolt.mcp` | MCP server and tool management (configure, list, execute) | [mcp.md](references/mcp.md) |
| `codebolt.autoTesting` | Automated testing (suites, cases, runs) | [autoTesting.md](references/autoTesting.md) |
| `codebolt.hook` | Hook management (event triggers, actions, conditions) | [hook.md](references/hook.md) |
| `codebolt.crawler` | Web crawler automation (start, navigate, scroll, click, screenshot) | [crawler.md](references/crawler.md) |
| `codebolt.vectordb` | Vector database operations (store, retrieve, query vectors) | [vectordb.md](references/vectordb.md) |
| `codebolt.history` | Chat history summarization (full history, partial history) | [history.md](references/history.md) |
| `codebolt.rag` | RAG system (placeholder) | [rag.md](references/rag.md) |
| `codebolt.roadmap` | Roadmap management (phases, features, ideas) | [roadmap.md](references/roadmap.md) |
| `codebolt.reviewMergeRequest` | Review and merge request management (create, review, merge, track) | [reviewMergeRequest.md](references/reviewMergeRequest.md) |
| `codebolt.knowledge` | Knowledge base (placeholder) | [knowledge.md](references/knowledge.md) |
| `codebolt.dbmemory` | In-memory key-value database operations | [dbmemory.md](references/dbmemory.md) |

## Common Patterns

### File Operations
```typescript
// Read, write, and search files
const content = await codebolt.fs.readFile('/path/to/file.ts');
await codebolt.fs.updateFile('file.ts', '/path/to', newContent);
const results = await codebolt.fs.grepSearch('/src', 'function', '*.ts');
```

### Browser Automation
```typescript
// Navigate, capture content, screenshot
await codebolt.browser.goToPage('https://example.com');
const markdown = await codebolt.browser.getMarkdown();
await codebolt.browser.screenshot({ fullPage: true });
```

### Command Streaming
```typescript
// Stream command output
const stream = codebolt.terminal.executeCommandWithStream('npm test');
stream.on('commandOutput', (data) => console.log('Output:', data));
stream.on('commandFinish', (data) => {
  console.log('Finished:', data);
  stream.cleanup?.();
});
```
