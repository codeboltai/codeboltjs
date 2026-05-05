import { Command } from 'commander';
import { createClient, GlobalOptions } from '../client-factory';
import { output, errorOutput } from '../output';

export function registerEnvironmentCommands(program: Command): void {
  const env = program.command('env').description('Environment management');

  env
    .command('list')
    .description('List environments')
    .action(async (_options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.environments.listEnvironments();
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  env
    .command('create')
    .description('Create an environment')
    .requiredOption('--name <name>', 'Environment name')
    .option('--data <json>', 'Environment config as JSON')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const data: any = { name: options.name };
        if (options.data) Object.assign(data, JSON.parse(options.data));
        const result = await client.environments.createEnvironment(data);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  env
    .command('get <id>')
    .description('Get environment details')
    .action(async (id: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.environments.getEnvironment(id);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  env
    .command('delete <id>')
    .description('Delete an environment')
    .action(async (id: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.environments.deleteEnvironment(id);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  env
    .command('start <id>')
    .description('Start an environment')
    .action(async (id: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.environments.startEnvironment(id);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  env
    .command('stop <id>')
    .description('Stop an environment')
    .action(async (id: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.environments.stopEnvironment(id);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  env
    .command('restart <id>')
    .description('Restart an environment')
    .action(async (id: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.environments.restartEnvironment(id);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  // ── Providers ──
  const providers = env.command('providers').description('Environment providers');

  providers
    .command('list')
    .description('List installed providers')
    .action(async (_options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.environments.listInstalledProviders();
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  providers
    .command('install')
    .description('Install a provider')
    .requiredOption('--data <json>', 'Provider data as JSON')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const data = JSON.parse(options.data);
        const result = await client.environments.installProvider(data);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });
}
