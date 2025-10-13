import { AgentCliOptions } from './types';
import { AgentExecutorServer } from './core/mainAgentExecutorServer';
import { getServerConfig } from './config';
import { Command } from 'commander';
import { v4 as uuidv4 } from 'uuid';
import { logger, LogLevel, Logger } from './utils/logger';
import { AgentTypeEnum } from './types/cli';
import { createOptionResolvers, parseFallbackArgs } from './utils/options';
import { createTuiProcessManager } from './utils/tuiProcessManager/tuiProcessManager';

/**
 * Setup CLI with commander
 */
function setupCLI(): AgentCliOptions {
  const program = new Command();
  
  program
    .name('codebolt-code')
    .description('Codebolt Code - AI-powered coding assistant')
    .version('1.0.0')
    .option('--noui', 'start server only (no TUI interface)')
    .option('--host <host>', 'server host', 'localhost')
    .option('--port <port>', 'server port', (value) => Number(value), 3001)
    .option('-v, --verbose', 'enable verbose logging', false)
    .option('--remote', 'enable remote wrangler proxy connection')
    .option('--remote-url <url>', 'wrangler proxy WebSocket URL')
    .option('--app-token <token>', 'app token for identifying remote app sessions')
    .option('--agent-type <type>', 'agent type: marketplace, local-zip, local-path, or server-zip')
    .option('--agent-detail <detail>', 'agent detail: marketplace ID, local path, zip file path, or server URL')
    .option('--prompt <prompt>', 'initial prompt to send to the agent')
.addHelpText('after', `
 Examples:
   $ codebolt-code                    # Start with TUI interface
   $ codebolt-code --noui            # Start server only
   $ codebolt-code --port 8080       # Start with custom port
   $ codebolt-code --noui --port 8080 # Server only on custom port
   $ codebolt-code --verbose         # Enable verbose logging
   $ codebolt-code --agent-type marketplace --agent-detail agent-123  # Use marketplace agent
   $ codebolt-code --agent-type local-path --agent-detail ./my-agent  # Use local agent
   $ codebolt-code --agent-type local-zip --agent-detail agent.zip    # Use zipped agent
   $ codebolt-code --agent-type server-zip --agent-detail https://example.com/agent.zip  # Use remote agent
   $ codebolt-code --agent-type local-path --agent-detail ./my-agent --prompt "Hello, how are you?"  # Start agent with initial prompt
`);

  program.parse();
  const options = program.opts();
  const fallbackArgs = parseFallbackArgs(program.args as string[]);
  const {
    resolveStringOption,
    resolveBooleanOption,
    resolveNumberOption
  } = createOptionResolvers(fallbackArgs);

  const remoteUrl: string | undefined = resolveStringOption(options.remoteUrl, 'remote-url') || process.env.WRANGLER_PROXY_URL;
  let appToken: string | undefined = resolveStringOption(options.appToken, 'app-token') || process.env.APP_TOKEN;

  if (!appToken) {
    appToken = uuidv4();
  }

  return {
    noui: typeof options.noui === 'boolean' ? options.noui : false,
    host: resolveStringOption(options.host, 'host') ?? 'localhost',
    port: resolveNumberOption(options.port, 'port') ?? 3001,
    verbose: resolveBooleanOption(typeof options.verbose === 'boolean' ? options.verbose : undefined, 'verbose'),
    remote: resolveBooleanOption(typeof options.remote === 'boolean' ? options.remote : undefined, 'remote'),
    remoteUrl,
    appToken,
    agentType: options.agentType ? options.agentType as AgentTypeEnum : undefined,
    agentDetail: resolveStringOption(options.agentDetail, 'agent-detail'),
    prompt: resolveStringOption(options.prompt, 'prompt')
  };
}

/**
 * Main server entry point
 */
async function main(): Promise<void> {
  const options = setupCLI();
  try {
    // Initialize logger with system /tmp path and appropriate log level
    const loggerInstance = Logger.getInstance({
      logFilePath: '/tmp/agent-server.log',
      logLevel: options.verbose ? LogLevel.DEBUG : LogLevel.INFO,
      enableConsole: options.noui ?? false
    });
    
    // Test log file writing
    if (!loggerInstance.testLogWrite()) {
      logger.warn('Warning: Could not write to log file. Console logging only.');
    } else {
      logger.info(`Log file: ${loggerInstance.getLogFilePath()}`);
    }
    
    // Get configuration
    const config = getServerConfig();
    
    // Override config with CLI options
    if (options.host) config.host = options.host;
    if (options.port) config.port = options.port;
    
    logger.info('Starting Codebolt Code...');
    
    if (options.verbose) {
      logger.debug('CLI Options', options);
      logger.debug('Server Configuration', config);
    }
    
    logger.info(`UI Mode: ${options.noui ? 'Server Only' : 'TUI + Server'}`);
    logger.info(`Server: ${config.host}:${config.port}`);

    if (options.remote) {
      logger.info(`Remote proxy enabled${options.remoteUrl ? ` -> ${options.remoteUrl}` : ''}`);
      if (!options.remoteUrl) {
        logger.warn('Remote proxy enabled but no URL provided. Set --remote-url or WRANGLER_PROXY_URL.');
      }
      if (options.appToken) {
        logger.info('App token configured for remote proxy');
      } else {
        logger.warn('No app token provided for remote proxy.');
      }
    }
    
    // Log agent configuration if provided
    if (options.agentType && options.agentDetail) {
      logger.info(`Agent Type: ${options.agentType}`);
      logger.info(`Agent Detail: ${options.agentDetail}`);
      
      // Validate agent type
      const validTypes = Object.values(AgentTypeEnum);
      if (!validTypes.includes(options.agentType)) {
        logger.error(`Invalid agent type: ${options.agentType}. Valid types: ${validTypes.join(', ')}`);
        process.exit(1);
      }
    } else if (options.agentType || options.agentDetail) {
      logger.error('Both --agent-type and --agent-detail must be provided together');
      process.exit(1);
    }
    
    // Log prompt if provided
    if (options.prompt) {
      logger.info(`Initial Prompt: ${options.prompt}`);
    }
    
    // Create and start server
    const server = new AgentExecutorServer(config, options);
    await server.start();
    
    logger.info(`Server started successfully on ${config.host}:${config.port}`);

    const tuiManager = createTuiProcessManager({
      server,
      config,
      options
    });

    tuiManager.initialize();
    
    // Handle uncaught exceptions
    process.on('uncaughtException', async (error: Error): Promise<void> => {
      logger.logError(error, 'Uncaught Exception');
      await tuiManager.stopTuiProcess();
      await server.stop();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason: unknown, promise: Promise<unknown>): Promise<void> => {
      logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`, { promise, reason });
      await tuiManager.stopTuiProcess();
      await server.stop();
      process.exit(1);
    });
    
  } catch (error) {
    logger.logError(error as Error, 'Failed to start server');
    process.exit(1);
  }
}

// Start the application
main();

export { AgentExecutorServer };
