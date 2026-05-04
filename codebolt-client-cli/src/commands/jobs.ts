import { Command } from 'commander';
import { createClient, GlobalOptions } from '../client-factory';
import { output, errorOutput } from '../output';

export function registerJobCommands(program: Command): void {
  const job = program.command('job').description('Job management');

  job
    .command('list')
    .description('List jobs')
    .option('--status <status>', 'Filter by status')
    .option('--limit <n>', 'Limit results')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const params: any = {};
        if (options.status) params.status = options.status;
        if (options.limit) params.limit = parseInt(options.limit);
        const result = await client.jobs.getAll(params);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  job
    .command('create')
    .description('Create a job')
    .requiredOption('--data <json>', 'Job data as JSON')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const data = JSON.parse(options.data);
        const result = await client.jobs.create(data);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  job
    .command('get <id>')
    .description('Get job details')
    .action(async (id: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.jobs.get(id);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  job
    .command('update <id>')
    .description('Update a job')
    .requiredOption('--data <json>', 'Job data as JSON')
    .action(async (id: string, options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const data = JSON.parse(options.data);
        const result = await client.jobs.update(id, data);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  job
    .command('delete <id>')
    .description('Delete a job')
    .action(async (id: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.jobs.delete(id);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  job
    .command('stats')
    .description('Get job statistics')
    .action(async (_options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.jobs.getStatistics();
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });
}
