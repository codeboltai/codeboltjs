import { Command } from 'commander';
import { createClient, GlobalOptions } from '../client-factory';
import { output, errorOutput } from '../output';

export function registerMcpCommands(program: Command): void {
  const mcp = program.command('mcp').description('MCP server management');

  mcp
    .command('list')
    .description('List MCP servers')
    .action(async (_options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.mcp.getAll();
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  mcp
    .command('get <serverName>')
    .description('Get MCP server details')
    .action(async (serverName: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.mcp.getByName(serverName);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  mcp
    .command('configure')
    .description('Configure MCP server')
    .requiredOption('--data <json>', 'Configuration as JSON')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const data = JSON.parse(options.data);
        const result = await client.mcp.configure(data);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  mcp
    .command('toggle')
    .description('Toggle MCP server')
    .requiredOption('--server <name>', 'Server name')
    .requiredOption('--enabled <bool>', 'Enable or disable')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.mcp.toggle({
          server: options.server,
          enabled: options.enabled === 'true',
        } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  mcp
    .command('install')
    .description('Install MCP server')
    .requiredOption('--data <json>', 'Install data as JSON')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const data = JSON.parse(options.data);
        const result = await client.mcp.install(data);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });
}
