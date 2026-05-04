import { Command } from 'commander';
import { createClient, GlobalOptions } from '../client-factory';
import { output, errorOutput } from '../output';
import { chatSend, chatSendStreaming } from '../streaming';

export function registerChatCommands(program: Command): void {
  const chat = program.command('chat').description('Chat and thread operations');

  chat
    .command('send')
    .description('Send a chat message and wait for completion (non-streaming)')
    .requiredOption('-m, --message <text>', 'Message to send')
    .option('--agent <id>', 'Agent ID to use')
    .option('--thread <id>', 'Thread ID')
    .option('--timeout <ms>', 'Timeout in milliseconds', '600000')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      try {
        await chatSend({
          message: options.message,
          agent: options.agent,
          thread: options.thread,
          timeout: options.timeout,
          json: globalOpts.json,
          host: globalOpts.host,
          port: globalOpts.port,
        });
        process.exit(0);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  chat
    .command('send-streaming')
    .description('Send a chat message with real-time streaming output')
    .requiredOption('-m, --message <text>', 'Message to send')
    .option('--agent <id>', 'Agent ID to use')
    .option('--thread <id>', 'Thread ID')
    .option('--timeout <ms>', 'Timeout in milliseconds', '600000')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      try {
        await chatSendStreaming({
          message: options.message,
          agent: options.agent,
          thread: options.thread,
          timeout: options.timeout,
          json: globalOpts.json,
          host: globalOpts.host,
          port: globalOpts.port,
        });
        process.exit(0);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  // ── Threads subcommands ──
  const threads = chat.command('threads').description('Thread management');

  threads
    .command('list')
    .description('List all chat threads')
    .action(async (_options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.chat.getThreadsInfo();
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  threads
    .command('create')
    .description('Create/initiate a new thread')
    .option('--name <name>', 'Thread name')
    .option('--thread-id <id>', 'Thread ID')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.chat.initiateNewThread({
          threadId: options.threadId,
          name: options.name,
        } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  threads
    .command('get <threadId>')
    .description('Get messages for a thread')
    .action(async (threadId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.chat.getMessages(threadId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  threads
    .command('delete <threadId>')
    .description('Remove a thread')
    .action(async (threadId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.chat.removeThread({ threadId } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  threads
    .command('set-active <threadId>')
    .description('Set the active thread')
    .action(async (threadId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.chat.setActiveThread({ threadId } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  // ── Steps subcommands ──
  const steps = chat.command('steps').description('Chat step management');

  steps
    .command('add <threadId>')
    .description('Add a step to a thread')
    .requiredOption('--data <json>', 'Step data as JSON')
    .action(async (threadId: string, options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const data = JSON.parse(options.data);
        const result = await client.chat.addStep({ threadId, ...data } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  // ── Store message ──
  chat
    .command('store-message')
    .description('Store a message in a thread')
    .requiredOption('--thread <id>', 'Thread ID')
    .requiredOption('--role <role>', 'Message role (user/agent)')
    .requiredOption('--content <text>', 'Message content')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.chat.storeMessage({
          threadId: options.thread,
          role: options.role,
          content: options.content,
        } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });
}
