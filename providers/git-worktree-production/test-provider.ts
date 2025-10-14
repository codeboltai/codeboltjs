import { GitWorktreeProviderService } from './src/services/GitWorktreeProviderService';

// Simple test to verify the provider can be instantiated
const provider = new GitWorktreeProviderService({
  agentServerPort: 3001,
  agentServerHost: 'localhost',
  worktreeBaseDir: '.worktree',
  timeouts: {
    agentServerStartup: 30000,
    wsConnection: 10000,
    gitOperations: 30000,
    cleanup: 15000,
  },
});

console.log('GitWorktreeProviderService created successfully');

// Test that we can get event handlers
const handlers = provider.getEventHandlers();
console.log('Event handlers retrieved successfully');

console.log('Provider test completed successfully');