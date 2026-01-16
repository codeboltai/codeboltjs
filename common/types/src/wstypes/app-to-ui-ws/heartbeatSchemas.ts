import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * Heartbeat Schemas for Provider and Environment Health Monitoring
 * 
 * Two types of heartbeats:
 * 1. Provider Heartbeat - sent by provider process to main app
 * 2. Environment Heartbeat - sent by provider to environment's remote executor
 */

// ===== Provider Heartbeat Schemas =====

// Provider health status
export const providerHealthStatusSchema = z.enum(['healthy', 'degraded', 'error']);
export type ProviderHealthStatus = z.infer<typeof providerHealthStatusSchema>;

// Provider heartbeat request - sent FROM provider TO main app
export const providerHeartbeatRequestSchema = z.object({
    type: z.literal('providerHeartbeat'),
    providerId: z.string(),
    timestamp: z.string(),
    status: providerHealthStatusSchema,
    connectedEnvironments: z.array(z.string()),
    uptime: z.number().optional(),
    metadata: z.record(z.any()).optional(),
});
export type ProviderHeartbeatRequest = z.infer<typeof providerHeartbeatRequestSchema>;

// Provider heartbeat response - sent FROM main app TO provider
export const providerHeartbeatResponseSchema = z.object({
    type: z.literal('providerHeartbeatResponse'),
    providerId: z.string(),
    received: z.boolean(),
    timestamp: z.string(),
});
export type ProviderHeartbeatResponse = z.infer<typeof providerHeartbeatResponseSchema>;

// ===== Environment Heartbeat Schemas =====

// Environment connection status
export const environmentConnectionStatusSchema = z.enum([
    'active',
    'degraded',
    'unreachable',
]);
export type EnvironmentConnectionStatus = z.infer<typeof environmentConnectionStatusSchema>;

// Remote executor status
export const remoteExecutorStatusSchema = z.enum([
    'running',
    'stopped',
    'starting',
    'error',
    'restarting',
]);
export type RemoteExecutorStatus = z.infer<typeof remoteExecutorStatusSchema>;

// Environment heartbeat request - sent FROM provider TO environment
export const environmentHeartbeatRequestSchema = z.object({
    type: z.literal('environmentHeartbeat'),
    environmentId: z.string(),
    providerId: z.string(),
    timestamp: z.string(),
});
export type EnvironmentHeartbeatRequest = z.infer<typeof environmentHeartbeatRequestSchema>;

// Environment heartbeat response - sent FROM environment TO provider
export const environmentHeartbeatResponseSchema = z.object({
    type: z.literal('environmentHeartbeatResponse'),
    environmentId: z.string(),
    status: environmentConnectionStatusSchema,
    remoteExecutorStatus: remoteExecutorStatusSchema,
    timestamp: z.string(),
    metadata: z.record(z.any()).optional(),
});
export type EnvironmentHeartbeatResponse = z.infer<typeof environmentHeartbeatResponseSchema>;

// ===== Extended Environment States =====

// Extended environment connection state for UI display
export const environmentConnectionStateSchema = z.enum([
    'active',
    'starting',
    'running',
    'stopping',
    'stopped',
    'error',
    'restarting',
    'unconnectable',
    'disconnected',
    'not_available',
    'archived',
]);
export type EnvironmentConnectionState = z.infer<typeof environmentConnectionStateSchema>;

// ===== Provider State for Restart Recovery =====

// Connection details for environment (varies by provider type)
export const environmentConnectionInfoSchema = z.object({
    environmentId: z.string(),
    environmentName: z.string(),
    connectionDetails: z.record(z.any()), // Provider-specific details
    lastConnected: z.string().optional(),
    lastHeartbeat: z.string().optional(),
});
export type EnvironmentConnectionInfo = z.infer<typeof environmentConnectionInfoSchema>;

// Provider state for persistence (used for restart recovery)
export const providerStateSchema = z.object({
    providerId: z.string(),
    providerType: z.string(), // 'docker', 'gitworktree', 'ssh', etc.
    connectionConfig: z.record(z.any()), // Provider-specific config
    environments: z.array(environmentConnectionInfoSchema),
    lastStartTime: z.string().optional(),
    lastHeartbeat: z.string().optional(),
    restartCount: z.number().default(0),
});
export type ProviderState = z.infer<typeof providerStateSchema>;

// ===== Heartbeat Status Tracking =====

export const heartbeatStatusSchema = z.object({
    lastHeartbeat: z.string().optional(),
    missedCount: z.number().default(0),
    status: z.enum(['healthy', 'warning', 'critical', 'dead']),
    restartAttempts: z.number().default(0),
    lastRestartAttempt: z.string().optional(),
});
export type HeartbeatStatus = z.infer<typeof heartbeatStatusSchema>;

// Union of all heartbeat message types
export const heartbeatMessageSchema = z.union([
    providerHeartbeatRequestSchema,
    providerHeartbeatResponseSchema,
    environmentHeartbeatRequestSchema,
    environmentHeartbeatResponseSchema,
]);
export type HeartbeatMessage = z.infer<typeof heartbeatMessageSchema>;
