
import codebolt from "@codebolt/codeboltjs";
import { FlatUserMessage } from '@codebolt/types/sdk';
import { GitWorktreeProviderService } from './services/GitWorktreeProviderService';
import { 
  ProviderInitVars, 
  ProviderStartResult, 
  DiffResult, 
  ProviderConfig,
  AgentStartMessage
} from './interfaces/IProviderService';

// Create provider service instance
const providerService = new GitWorktreeProviderService();

// Register CodeBolt event handlers
console.log('[Git WorkTree Provider] Registering event handlers...');

/**
 * Provider start handler - onProviderStart
 */
codebolt.onProviderStart(onProviderStart);

/**
 * Provider agent start handler - starts agent loop with sandbox
 */
codebolt.onProviderAgentStart(onProviderAgentStart);

/**
 * Get diff files handler - uses sandbox git
 */
codebolt.onGetDiffFiles(onGetDiffFiles);

/**
 * Close signal handler - destroys sandbox
 */
codebolt.onCloseSignal(onCloseSignal);

/**
 * Create patch request handler
 */
codebolt.onCreatePatchRequest(onCreatePatchRequest);


/**
 * Message listener - handles incoming WebSocket messages
 */

codebolt.onRawMessage(onRawMessage)

/**
 * Create pull request handler
 */
codebolt.onCreatePullRequestRequest(onCreatePullRequestRequest);

async function onProviderStart(initvars: ProviderInitVars): Promise<ProviderStartResult> {
    return await providerService.onProviderStart(initvars);
}

async function onProviderAgentStart(initvars: AgentStartMessage): Promise<void> {
    
    return await providerService.onProviderAgentStart(initvars);
}

async function onGetDiffFiles(): Promise<DiffResult> {
    return await providerService.onGetDiffFiles();
}

async function onCloseSignal(): Promise<void> {
    return await providerService.onCloseSignal();
}

function onCreatePatchRequest(): void {
    return providerService.onCreatePatchRequest();
}

function onCreatePullRequestRequest(): void {
    return providerService.onCreatePullRequestRequest();
}

async function onRawMessage(userMessage:any): Promise<void> {
    console.log('[GitWorktreeProvider] MessageReceived in On Raw Message',userMessage);

  
    // Handle the message through the provider service
    return await providerService.onMessage(userMessage);
}









