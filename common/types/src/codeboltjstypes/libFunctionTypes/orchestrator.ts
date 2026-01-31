/**
 * Orchestrator SDK Function Types
 * Types for the orchestrator module functions
 */

// Base response interface for orchestrator operations
export interface BaseOrchestratorSDKResponse {
  success: boolean;
  message?: string;
  error?: OrchestratorError;
}

/**
 * Orchestrator error structure
 */
export interface OrchestratorError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Orchestrator status values
 */
export type OrchestratorStatus = 'idle' | 'running' | 'paused';

/**
 * Orchestrator event types - custom event strings for orchestrator operations.
 * The server parses `orchestrator.\<action\>` type strings.
 */
export type OrchestratorEventType =
  | 'orchestrator.list'
  | 'orchestrator.get'
  | 'orchestrator.getSettings'
  | 'orchestrator.create'
  | 'orchestrator.update'
  | 'orchestrator.updateSettings'
  | 'orchestrator.delete'
  | 'orchestrator.updateStatus'
  | 'orchestrator.updateCodeboltJs';

/**
 * Orchestrator instance structure
 */
export interface OrchestratorInstance {
  id: string;
  name: string;
  description: string;
  agentId: string;
  defaultWorkerAgentId?: string | null;
  threadId: string;
  status: OrchestratorStatus;
  metadata?: Record<string, unknown>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Parameters for creating an orchestrator
 */
export interface CreateOrchestratorParams {
  name: string;
  description: string;
  agentId: string;
  defaultWorkerAgentId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating an orchestrator
 */
export interface UpdateOrchestratorParams {
  name?: string;
  description?: string;
  agentId?: string;
  defaultWorkerAgentId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating orchestrator settings
 */
export interface UpdateOrchestratorSettingsParams {
  name?: string;
  description?: string;
  defaultWorkerAgentId?: string;
  metadata?: Record<string, unknown>;
}

// Orchestrator responses
export interface OrchestratorResponse extends BaseOrchestratorSDKResponse {
  requestId?: string;
  data?: OrchestratorInstance | OrchestratorInstance[] | unknown;
}

export interface ListOrchestratorsResponse extends BaseOrchestratorSDKResponse {
  requestId?: string;
  data?: OrchestratorInstance[];
}

export interface GetOrchestratorResponse extends BaseOrchestratorSDKResponse {
  requestId?: string;
  data?: OrchestratorInstance;
}

export interface CreateOrchestratorResponse extends BaseOrchestratorSDKResponse {
  requestId?: string;
  data?: OrchestratorInstance;
}

export interface UpdateOrchestratorResponse extends BaseOrchestratorSDKResponse {
  requestId?: string;
  data?: OrchestratorInstance;
}

export interface DeleteOrchestratorResponse extends BaseOrchestratorSDKResponse {
  requestId?: string;
}

export interface UpdateOrchestratorStatusResponse extends BaseOrchestratorSDKResponse {
  requestId?: string;
  data?: OrchestratorInstance;
}
