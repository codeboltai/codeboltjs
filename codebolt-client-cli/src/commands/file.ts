import { Command } from 'commander';
import { createClient, GlobalOptions } from '../client-factory';
import { output, errorOutput } from '../output';

export function registerFileCommands(program: Command): void {
  const file = program.command('file').description('File operations');

  file
    .command('exists')
    .description('Check if a file exists')
    .requiredOption('--path <path>', 'File path')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.file.checkFileExists({ path: options.path } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  file
    .command('add')
    .description('Add a file')
    .requiredOption('--path <path>', 'File path')
    .requiredOption('--content <content>', 'File content')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.file.addFile({ path: options.path, content: options.content } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });
}
