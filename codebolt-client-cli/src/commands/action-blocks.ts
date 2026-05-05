import { Command } from 'commander';
import { createClient, GlobalOptions } from '../client-factory';
import { output, errorOutput } from '../output';

export function registerActionBlockCommands(program: Command): void {
  const ab = program.command('actionblock').description('Action block operations');

  ab
    .command('list')
    .description('List action blocks')
    .action(async (_options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.actionBlocks.list();
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  ab
    .command('detail <identifier>')
    .description('Get action block detail')
    .action(async (identifier: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.actionBlocks.getDetail(identifier);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  ab
    .command('stop')
    .description('Stop an action block execution')
    .requiredOption('--execution-id <id>', 'Execution ID')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.actionBlocks.stop({ executionId: options.executionId } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  ab
    .command('stats')
    .description('Get action block statistics')
    .action(async (_options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.actionBlocks.getStats();
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });
}
