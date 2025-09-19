import { formatLogMessage } from './types';
import { DockerServer } from './core/agentServer';
import { getServerConfig } from './config';
import { spawn, ChildProcess } from 'child_process';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { Command } from 'commander';

// Command line interface
interface CliOptions {
  noui: boolean;
  host?: string;
  port?: number;
  verbose?: boolean;
}

/**
 * Setup CLI with commander
 */
function setupCLI(): CliOptions {
  const program = new Command();
  
  program
    .name('codebolt-code')
    .description('Codebolt Code - AI-powered coding assistant')
    .version('1.0.0')
    .option('--noui, --no-ui', 'start server only (no TUI interface)', false)
    .option('--host <host>', 'server host', 'localhost')
    .option('--port <port>', 'server port', (value) => parseInt(value), 3001)
    .option('-v, --verbose', 'enable verbose logging', false)
    .addHelpText('after', `
Examples:
  $ codebolt-code                    # Start with TUI interface
  $ codebolt-code --noui            # Start server only
  $ codebolt-code --port 8080       # Start with custom port
  $ codebolt-code --noui --port 8080 # Server only on custom port
  $ codebolt-code --verbose         # Enable verbose logging
`);

  program.parse();
  const options = program.opts();
  
  return {
    noui: options.noui,
    host: options.host,
    port: options.port,
    verbose: options.verbose
  };
}


/**
 * Main server entry point
 */
async function main(): Promise<void> {
  const options = setupCLI();

  try {
    // Get configuration
    const config = getServerConfig();
    
    // Override config with CLI options
    if (options.host) config.host = options.host;
    if (options.port) config.port = options.port;
    
    console.log(formatLogMessage('info', 'Main', 'Starting Codebolt Code...'));
    
    if (options.verbose) {
      console.log(formatLogMessage('info', 'Main', `CLI Options: ${JSON.stringify(options, null, 2)}`));
      console.log(formatLogMessage('info', 'Main', `Server Configuration: ${JSON.stringify(config, null, 2)}`));
    }
    
    console.log(formatLogMessage('info', 'Main', `UI Mode: ${options.noui ? 'Server Only' : 'TUI + Server'}`));
    console.log(formatLogMessage('info', 'Main', `Server: ${config.host}:${config.port}`));
    
    // Create and start server
    const server = new DockerServer(config);
    await server.start();
    
    console.log(formatLogMessage('info', 'Server', `Server started successfully on ${config.host}:${config.port}`));

    // Start TUI if not disabled
    let tuiProcess: ChildProcess | null = null;
  
    
    // Handle graceful shutdown
    const shutdown = async () => {
      console.log(formatLogMessage('info', 'Main', 'Received shutdown signal, shutting down gracefully...'));
     
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error(formatLogMessage('error', 'Main', `Uncaught Exception: ${error}`));
      await server.stop();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      console.error(formatLogMessage('error', 'Main', `Unhandled Rejection at: ${promise}, reason: ${reason}`));
      await server.stop();
      process.exit(1);
    });
    
  } catch (error) {
    console.error(formatLogMessage('error', 'Main', `Failed to start server: ${error}`));
    process.exit(1);
  }
}

// Start the application
main();

export { DockerServer };
