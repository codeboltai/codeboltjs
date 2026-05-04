#!/usr/bin/env node
import { Command } from 'commander';
import { registerChatCommands } from './commands/chat';
import { registerAgentCommands } from './commands/agents';
import { registerGitCommands } from './commands/git';
import { registerTaskCommands } from './commands/tasks';
import { registerProjectCommands } from './commands/projects';
import { registerWorkspaceCommands } from './commands/workspace';
import { registerLlmCommands } from './commands/llm';
import { registerMemoryCommands } from './commands/memory';
import { registerKnowledgeCommands } from './commands/knowledge';
import { registerSwarmCommands } from './commands/swarm';
import { registerEnvironmentCommands } from './commands/environments';
import { registerJobCommands } from './commands/jobs';
import { registerActionBlockCommands } from './commands/action-blocks';
import { registerBrowserCommands } from './commands/browser';
import { registerMcpCommands } from './commands/mcp';
import { registerFileCommands } from './commands/file';
import { registerSystemCommands } from './commands/system';

const program = new Command();

program
  .name('codebolt-client')
  .description('CLI client for CodeBolt server')
  .version('0.1.0')
  .option('-p, --port <number>', 'Server port', process.env.SOCKET_PORT || '12345')
  .option('-H, --host <string>', 'Server hostname', 'localhost')
  .option('--json', 'Output as JSON')
  .option('--debug', 'Enable debug logging')
  .option('--timeout <ms>', 'HTTP timeout in ms', '30000');

// Register all command groups
registerChatCommands(program);
registerAgentCommands(program);
registerGitCommands(program);
registerTaskCommands(program);
registerProjectCommands(program);
registerWorkspaceCommands(program);
registerLlmCommands(program);
registerMemoryCommands(program);
registerKnowledgeCommands(program);
registerSwarmCommands(program);
registerEnvironmentCommands(program);
registerJobCommands(program);
registerActionBlockCommands(program);
registerBrowserCommands(program);
registerMcpCommands(program);
registerFileCommands(program);
registerSystemCommands(program);

program.parse();
