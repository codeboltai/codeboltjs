import { formatLogMessage } from '@codebolt/shared-types';
import { DockerServer } from './core/dockerServer';
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
 * Find the gotui binary path
 */
function findGotuiBinary(): string | null {
  // In CommonJS, __filename and __dirname are available globally
  
  // Try different possible locations for the gotui binary
  const possiblePaths = [
    // In development - relative to server
    resolve(__dirname, '../../../gotui/gotui'),
    resolve(__dirname, '../../../gotui/cmd/gotui/gotui'),
    // In packaged version - relative to server dist
    resolve(__dirname, '../../gotui/gotui'),
    resolve(__dirname, '../../bin/gotui'),
    // In packaged dist - codebolt-code structure
    resolve(__dirname, '../gotui/gotui'),
    // Fallback - system PATH
    'gotui'
  ];

  for (const path of possiblePaths) {
    if (path === 'gotui' || existsSync(path)) {
      console.log(formatLogMessage('info', 'TUI', `Found gotui binary at: ${path}`));
      return path;
    }
  }

  return null;
}

/**
 * Start the Go TUI
 */
function startGoTUI(host: string, port: number, verbose: boolean = false): ChildProcess | null {
  const gotuiPath = findGotuiBinary();
  
  if (!gotuiPath) {
    console.error(formatLogMessage('error', 'TUI', 'Could not find gotui binary. Please build it first or use --noui flag.'));
    return null;
  }

  console.log(formatLogMessage('info', 'TUI', `Starting Go TUI: ${gotuiPath}`));
  
  const args = ['--host', host, '--port', port.toString(), '--noServer'];
  
  if (verbose) {
    console.log(formatLogMessage('info', 'TUI', `TUI args: ${args.join(' ')}`));
  }
  
  const tuiProcess = spawn(gotuiPath, args, {
    stdio: verbose ? ['pipe', 'inherit', 'inherit'] : ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, TERM: 'xterm-256color' }
  });

  tuiProcess.stdout?.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log(formatLogMessage('info', 'TUI', output));
    }
  });

  tuiProcess.stderr?.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log(formatLogMessage('warn', 'TUI', output));
    }
  });

  tuiProcess.on('exit', (code, signal) => {
    if (code !== 0) {
      console.log(formatLogMessage('info', 'TUI', `TUI process exited with code ${code}, signal ${signal}`));
    }
  });

  tuiProcess.on('error', (error) => {
    console.error(formatLogMessage('error', 'TUI', `Failed to start TUI: ${error.message}`));
  });

  return tuiProcess;
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
    if (!options.noui) {
      console.log(formatLogMessage('info', 'Main', 'Starting TUI interface...'));
      tuiProcess = startGoTUI(config.host || 'localhost', config.port, options.verbose);
      
      if (tuiProcess) {
        console.log(formatLogMessage('info', 'Main', 'TUI started successfully. Use Ctrl+C to exit.'));
      } else {
        console.log(formatLogMessage('warn', 'Main', 'TUI failed to start. Running in server-only mode.'));
      }
    } else {
      console.log(formatLogMessage('info', 'Main', 'Server-only mode. TUI disabled.'));
    }
    
    // Handle graceful shutdown
    const shutdown = async () => {
      console.log(formatLogMessage('info', 'Main', 'Received shutdown signal, shutting down gracefully...'));
      try {
        // Stop TUI first
        if (tuiProcess && !tuiProcess.killed) {
          console.log(formatLogMessage('info', 'Main', 'Stopping TUI process...'));
          tuiProcess.kill('SIGTERM');
          
          // Give TUI time to gracefully exit
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (!tuiProcess.killed) {
            console.log(formatLogMessage('warn', 'Main', 'Force killing TUI process...'));
            tuiProcess.kill('SIGKILL');
          }
        }
        
        // Stop server
        await server.stop();
        console.log(formatLogMessage('info', 'Main', 'Server stopped successfully'));
        process.exit(0);
      } catch (error) {
        console.error(formatLogMessage('error', 'Main', `Error during shutdown: ${error}`));
        process.exit(1);
      }
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
