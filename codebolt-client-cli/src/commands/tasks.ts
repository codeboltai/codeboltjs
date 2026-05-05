import { Command } from 'commander';
import { createClient, GlobalOptions } from '../client-factory';
import { output, errorOutput } from '../output';

export function registerTaskCommands(program: Command): void {
  const task = program.command('task').description('Task management');

  task
    .command('list')
    .description('Search/list tasks')
    .option('--status <status>', 'Filter by status')
    .option('--limit <n>', 'Limit results')
    .option('--offset <n>', 'Offset results')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const params: any = {};
        if (options.status) params.status = options.status;
        if (options.limit) params.limit = parseInt(options.limit);
        if (options.offset) params.offset = parseInt(options.offset);
        const result = await client.tasks.search(params);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  task
    .command('get <taskId>')
    .description('Get task details')
    .action(async (taskId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.tasks.get(taskId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  task
    .command('create')
    .description('Create a new task')
    .requiredOption('--title <title>', 'Task title')
    .option('--description <desc>', 'Task description')
    .option('--priority <priority>', 'Task priority')
    .option('--status <status>', 'Task status')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const data: any = { title: options.title };
        if (options.description) data.description = options.description;
        if (options.priority) data.priority = options.priority;
        if (options.status) data.status = options.status;
        const result = await client.tasks.create(data);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  task
    .command('update <taskId>')
    .description('Update a task')
    .option('--title <title>', 'New title')
    .option('--status <status>', 'New status')
    .option('--priority <priority>', 'New priority')
    .action(async (taskId: string, options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const data: any = {};
        if (options.title) data.title = options.title;
        if (options.status) data.status = options.status;
        if (options.priority) data.priority = options.priority;
        const result = await client.tasks.update(taskId, data);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  task
    .command('delete <taskId>')
    .description('Delete a task')
    .action(async (taskId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.tasks.delete(taskId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  task
    .command('mark-progress <taskId>')
    .description('Mark task as in-progress')
    .action(async (taskId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.tasks.markInProgress(taskId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  task
    .command('mark-completed <taskId>')
    .description('Mark task as completed')
    .action(async (taskId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.tasks.markCompleted(taskId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  task
    .command('mark-failed <taskId>')
    .description('Mark task as failed')
    .action(async (taskId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.tasks.markFailed(taskId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  task
    .command('stats')
    .description('Get task statistics')
    .action(async (_options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.tasks.getStatistics();
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  task
    .command('project')
    .description('Get tasks for current project')
    .action(async (_options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.tasks.getForCurrentProject();
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  task
    .command('hierarchy <taskId>')
    .description('Get task hierarchy')
    .action(async (taskId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.tasks.getHierarchy(taskId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  task
    .command('add-message <taskId>')
    .description('Add a message to a task')
    .requiredOption('--content <text>', 'Message content')
    .option('--author <author>', 'Message author')
    .action(async (taskId: string, options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const data: any = { content: options.content };
        if (options.author) data.author = options.author;
        const result = await client.tasks.addMessage(taskId, data);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });
}
