import { Command } from 'commander';
import { createClient, GlobalOptions } from '../client-factory';
import { output, errorOutput } from '../output';

export function registerSwarmCommands(program: Command): void {
  const swarm = program.command('swarm').description('Swarm coordination');

  swarm
    .command('create')
    .description('Create a swarm')
    .requiredOption('--name <name>', 'Swarm name')
    .option('--data <json>', 'Swarm config as JSON')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const data: any = { name: options.name };
        if (options.data) Object.assign(data, JSON.parse(options.data));
        const result = await client.swarm.createSwarm(data);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  swarm
    .command('list')
    .description('List swarms')
    .action(async (_options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.swarm.listSwarms();
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  swarm
    .command('get <swarmId>')
    .description('Get swarm details')
    .action(async (swarmId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.swarm.getSwarm(swarmId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  swarm
    .command('delete <swarmId>')
    .description('Delete a swarm')
    .action(async (swarmId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.swarm.deleteSwarm(swarmId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  swarm
    .command('start <swarmId>')
    .description('Start a swarm')
    .action(async (swarmId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.swarm.startSwarm(swarmId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  swarm
    .command('stop <swarmId>')
    .description('Stop a swarm')
    .action(async (swarmId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.swarm.stopSwarm(swarmId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  swarm
    .command('status <swarmId>')
    .description('Get swarm status')
    .action(async (swarmId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.swarm.getSwarmStatus(swarmId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  // ── Agents subcommand ──
  const agents = swarm.command('agents').description('Swarm agents');

  agents
    .command('list <swarmId>')
    .description('List agents in swarm')
    .action(async (swarmId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.swarm.listAgents(swarmId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  agents
    .command('add <swarmId>')
    .description('Add agent to swarm')
    .requiredOption('--data <json>', 'Agent data as JSON')
    .action(async (swarmId: string, options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const data = JSON.parse(options.data);
        const result = await client.swarm.addAgent(swarmId, data);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  // ── Teams ──
  const teams = swarm.command('teams').description('Swarm teams');

  teams
    .command('list <swarmId>')
    .description('List teams in swarm')
    .action(async (swarmId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.swarm.listTeams(swarmId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  teams
    .command('create <swarmId>')
    .description('Create team in swarm')
    .requiredOption('--name <name>', 'Team name')
    .action(async (swarmId: string, options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.swarm.createTeam(swarmId, { name: options.name } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  // ── Roles ──
  const roles = swarm.command('roles').description('Swarm roles');

  roles
    .command('list <swarmId>')
    .description('List roles in swarm')
    .action(async (swarmId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.swarm.listRoles(swarmId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  roles
    .command('create <swarmId>')
    .description('Create role in swarm')
    .requiredOption('--name <name>', 'Role name')
    .action(async (swarmId: string, options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.swarm.createRole(swarmId, { name: options.name } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });
}
