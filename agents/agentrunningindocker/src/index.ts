import { formatLogMessage } from '@codebolt/types/remote';
import { SampleCodeboltAgent } from './core/agent';
import { getClientConfig } from './config';

/**
 * Main client entry point
 */
async function main(): Promise<void> {
  try {
    // Get configuration
    const config = getClientConfig();
    
    console.log(formatLogMessage('info', 'Main', 'Starting Codebolt Sample Client...'));
    console.log(formatLogMessage('info', 'Main', `Configuration: ${JSON.stringify(config, null, 2)}`));
    
    // Create and start client
    const client = new SampleCodeboltAgent(config);
    await client.start();
    
    // Handle graceful shutdown
    const shutdown = async () => {
      console.log(formatLogMessage('info', 'Main', 'Received shutdown signal, shutting down gracefully...'));
      try {
        await client.stop();
        console.log(formatLogMessage('info', 'Main', 'Client stopped successfully'));
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
      await client.stop();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      console.error(formatLogMessage('error', 'Main', `Unhandled Rejection at: ${promise}, reason: ${reason}`));
      await client.stop();
      process.exit(1);
    });
    
  } catch (error) {
    console.error(formatLogMessage('error', 'Main', `Failed to start client: ${error}`));
    process.exit(1);
  }
}

// Start the application
main();

export { SampleCodeboltAgent };