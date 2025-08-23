/**
 * @fileoverview Provider Lifecycle Handlers
 * @description Handles provider start, stop, close signals, and initialization
 */

import { createE2BSandbox } from '../utils/sandboxManager';
import { sendNotification, sendSystemNotification } from '../utils/messageHelpers';
import { InitVars, ProviderStatus } from '../types/provider';
import { E2BSandbox } from '../types/sandbox';

const { SystemNotificationAction } = require('../../../../common/types/dist/codeboltjstypes/notification.enum');

// Simple state management
let currentSandbox: E2BSandbox | null = null;
let isInitialized = false;

/**
 * Get current sandbox instance
 */
export function getCurrentSandbox(): E2BSandbox | null {
  return currentSandbox;
}

/**
 * Check if provider is initialized
 */
export function getIsInitialized(): boolean {
  return isInitialized;
}

/**
 * Provider start handler - creates sandbox
 */
export async function onProviderStart(initvars: InitVars): Promise<ProviderStatus> {
  console.log('[E2B Provider] Starting with init vars:', initvars);
  
  try {
    currentSandbox = createE2BSandbox({
      template: initvars.template,
      timeout: initvars.timeout,
      env: initvars.environment
    });
    
    await currentSandbox.create();
    isInitialized = true;
    
    console.log('[E2B Provider] Sandbox created:', currentSandbox.id);
    
    return {
      status: 'ready',
      sandboxId: currentSandbox.id,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[E2B Provider] Failed to create sandbox:', error);
    const errorMessage = `Failed to create E2B sandbox: ${error instanceof Error ? error.message : 'Unknown error'}`;
    
    return {
      status: 'error',
      error: errorMessage,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Close signal handler - destroys sandbox
 */
export async function onCloseSignal(): Promise<{ status: string; sandboxId?: string }> {
  console.log('[E2B Provider] Received close signal');
  
  try {
    if (currentSandbox && isInitialized) {
      // Send system notification for process stopping
      sendSystemNotification(SystemNotificationAction.PROCESS_STOPPED_REQUEST, {
        processName: 'E2B Provider',
        processId: currentSandbox.id,
        stopTime: new Date().toISOString()
      });
      
      const sandboxId = currentSandbox.id;
      await currentSandbox.destroy();
      currentSandbox = null;
      isInitialized = false;
      
      console.log('[E2B Provider] Sandbox destroyed');
      return { 
        status: 'sandbox_destroyed',
        sandboxId 
      };
    }
    
    return { status: 'no_sandbox_to_destroy' };
  } catch (error) {
    console.error('[E2B Provider] Error destroying sandbox:', error);
    const errorMessage = `Failed to destroy sandbox: ${error instanceof Error ? error.message : 'Unknown error'}`;
    
    return {
      status: 'error',
      error: errorMessage
    };
  }
}

/**
 * Get current sandbox status (utility function)
 */
export function getSandboxStatus(): { initialized: boolean; sandboxId?: string } {
  return {
    initialized: isInitialized,
    sandboxId: currentSandbox?.id
  };
}

/**
 * Reset provider state (useful for testing)
 */
export function resetProviderState(): void {
  currentSandbox = null;
  isInitialized = false;
}