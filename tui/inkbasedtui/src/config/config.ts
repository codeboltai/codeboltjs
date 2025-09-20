/**
 * Configuration management for Codebolt CLI
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export interface CliArgs {
  port?: number;
  host?: string;
  serverPath?: string;
  agentPath?: string;
  verbose?: boolean;
  noServer?: boolean;
  noAgent?: boolean;
}

export interface CodeboltConfig {
  server: {
    port: number;
    host: string;
    autoStart: boolean;
    path?: string;
  };
  agent: {
    autoStart: boolean;
    path?: string;
  };
  cli: {
    verbose: boolean;
    theme: string;
  };
}

export function parseArguments(): CliArgs {
  return yargs(hideBin(process.argv))
    .option('port', {
      alias: 'p',
      type: 'number',
      description: 'Server port (if specified, runs in client-only mode)',
    })
    .option('host', {
      alias: 'h',
      type: 'string',
      description: 'Server host (if specified, runs in client-only mode)',
    })
    .option('server-path', {
      alias: 's',
      type: 'string',
      description: 'Path to server directory',
    })
    .option('agent-path', {
      alias: 'a',
      type: 'string',
      description: 'Path to agent directory',
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Enable verbose logging',
      default: false,
    })
    .option('no-server', {
      type: 'boolean',
      description: 'Don\'t auto-start server',
      default: false,
    })
    .option('no-agent', {
      type: 'boolean',
      description: 'Don\'t auto-start agent',
      default: false,
    })
    .help()
    .parseSync();
}

export function getDefaultConfig(): CodeboltConfig {
  return {
    server: {
      port: 3001,
      host: 'localhost',
      autoStart: true,
    },
    agent: {
      autoStart: true,
    },
    cli: {
      verbose: false,
      theme: 'default',
    },
  };
}

export function mergeConfig(defaultConfig: CodeboltConfig, args: CliArgs): CodeboltConfig {
  return {
    server: {
      ...defaultConfig.server,
      port: args.port ?? defaultConfig.server.port,
      host: args.host ?? defaultConfig.server.host,
      autoStart: !args.noServer,
      path: args.serverPath,
    },
    agent: {
      ...defaultConfig.agent,
      autoStart: !args.noAgent,
      path: args.agentPath,
    },
    cli: {
      ...defaultConfig.cli,
      verbose: args.verbose ?? defaultConfig.cli.verbose,
    },
  };
}
