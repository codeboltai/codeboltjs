import { Command } from 'commander';
import { createClient, GlobalOptions } from '../client-factory';
import { output, errorOutput } from '../output';

export function registerMemoryCommands(program: Command): void {
  const memory = program.command('memory').description('Memory management');

  memory
    .command('list')
    .description('List memory threads')
    .option('--type <type>', 'Filter by type (generic|markdown|json|context|episodic)')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const params: any = {};
        if (options.type) params.type = options.type;
        const result = await client.memory.listThreads(params);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  memory
    .command('get <threadId>')
    .description('Get memory thread')
    .action(async (threadId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.memory.getThread(threadId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  memory
    .command('create')
    .description('Create a memory thread')
    .requiredOption('--name <name>', 'Thread name')
    .option('--type <type>', 'Thread type')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const data: any = { name: options.name };
        if (options.type) data.type = options.type;
        const result = await client.memory.createThread(data);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  memory
    .command('update <threadId>')
    .description('Update a memory thread')
    .option('--name <name>', 'New name')
    .action(async (threadId: string, options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const data: any = {};
        if (options.name) data.name = options.name;
        const result = await client.memory.updateThread(threadId, data);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  memory
    .command('archive <threadId>')
    .description('Archive a memory thread')
    .action(async (threadId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.memory.archiveThread(threadId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  // ── Markdown memory ──
  const markdown = memory.command('markdown').description('Markdown memory threads');

  markdown
    .command('create')
    .description('Create markdown memory thread')
    .requiredOption('--name <name>', 'Thread name')
    .option('--content <content>', 'Initial markdown content')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.memory.createMarkdownThread({ name: options.name, content: options.content } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  markdown
    .command('get <threadId>')
    .description('Get markdown memory thread')
    .action(async (threadId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.memory.getMarkdownThread(threadId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  markdown
    .command('update-content <threadId>')
    .description('Update markdown content')
    .requiredOption('--content <md>', 'Markdown content')
    .action(async (threadId: string, options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.memory.updateMarkdownThreadContent(threadId, { content: options.content } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  // ── JSON memory ──
  const json = memory.command('json').description('JSON memory threads');

  json
    .command('create')
    .description('Create JSON memory thread')
    .requiredOption('--name <name>', 'Thread name')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.memory.createJsonThread({ name: options.name } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  json
    .command('get <threadId>')
    .description('Get JSON memory thread')
    .action(async (threadId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.memory.getJsonThread(threadId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  json
    .command('update-data <threadId>')
    .description('Update JSON data')
    .requiredOption('--data <json>', 'JSON data')
    .action(async (threadId: string, options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const data = JSON.parse(options.data);
        const result = await client.memory.updateJsonThreadData(threadId, data);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  // ── Context memory ──
  const context = memory.command('context').description('Context memory threads');

  context
    .command('create')
    .description('Create context memory thread')
    .requiredOption('--name <name>', 'Thread name')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.memory.createContextThread({ name: options.name } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  context
    .command('save-from-chat <threadId>')
    .description('Save context from chat')
    .requiredOption('--chat-id <id>', 'Chat thread ID')
    .action(async (threadId: string, options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.memory.saveContextFromChat(threadId, { chatId: options.chatId } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  context
    .command('summarize <threadId>')
    .description('Summarize context thread')
    .action(async (threadId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.memory.summarizeContextThread(threadId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  // ── Episodic memory ──
  const episodic = memory.command('episodic').description('Episodic memory');

  episodic
    .command('create')
    .description('Create episodic memory')
    .requiredOption('--name <name>', 'Memory name')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.memory.createEpisodicMemory({ name: options.name } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  episodic
    .command('events <memoryId>')
    .description('Get episodic events')
    .action(async (memoryId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.memory.getEpisodicEvents(memoryId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  episodic
    .command('add-events <memoryId>')
    .description('Add episodic events')
    .requiredOption('--data <json>', 'Events data as JSON')
    .action(async (memoryId: string, options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const data = JSON.parse(options.data);
        const result = await client.memory.addEpisodicEvents(memoryId, data);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });
}
