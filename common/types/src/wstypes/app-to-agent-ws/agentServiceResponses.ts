import { z } from 'zod';

/**
 * Agent Service Response Schemas
 * Messages sent from agent CLI service back to agents
 */

// Find agent by task response schema
export const FindAgentByTaskResponseSchema = z.object({
  type: z.literal('findAgentByTaskResponse'),
  requestId: z.string(),
  agents: z.array(z.any()).optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.any().optional()
});

// List agents response schema
export const ListAgentsResponseSchema = z.object({
  type: z.literal('listAgentsResponse'),
  requestId: z.string(),
  agents: z.array(z.any()).optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.any().optional()
});

// Agents detail response schema
export const AgentsDetailResponseSchema = z.object({
  type: z.literal('agentsDetailResponse'),
  requestId: z.string(),
  agents: z.array(z.any()).optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.any().optional()
});

// Task completion response schema
export const TaskCompletionResponseSchema = z.object({
  type: z.literal('taskCompletionResponse'),
  requestId: z.string(),
  taskId: z.string().optional(),
  status: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.any().optional(),
  timestamp: z.string().optional(),
  from: z.string().optional(),
  agentId: z.string().optional(),
  task: z.string().optional(),
  result: z.any().optional()
});

// Agent service error response schema
export const AgentServiceErrorResponseSchema = z.object({
  type: z.literal('error'),
  requestId: z.string(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.any().optional()
});

// Union of all agent service response schemas
// Start agent response schema
export const StartAgentResponseSchema = z.object({
  type: z.literal('startAgentResponse'),
  requestId: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  agentId: z.string().optional(),
  data: z.any().optional(),
  error: z.any().optional()
});

// Union of all agent service response schemas
export const AgentServiceResponseSchema = z.union([
  FindAgentByTaskResponseSchema,
  ListAgentsResponseSchema,
  AgentsDetailResponseSchema,
  TaskCompletionResponseSchema,
  AgentServiceErrorResponseSchema,
  StartAgentResponseSchema
]);

// Export with the expected name for the index file
export const agentServiceResponseSchema = AgentServiceResponseSchema;

// Type exports
export type FindAgentByTaskResponse = z.infer<typeof FindAgentByTaskResponseSchema>;
export type ListAgentsResponse = z.infer<typeof ListAgentsResponseSchema>;
export type AgentsDetailResponse = z.infer<typeof AgentsDetailResponseSchema>;
export type TaskCompletionResponse = z.infer<typeof TaskCompletionResponseSchema>;
export type AgentServiceErrorResponse = z.infer<typeof AgentServiceErrorResponseSchema>;
export type StartAgentResponse = z.infer<typeof StartAgentResponseSchema>;
export type AgentServiceResponse = z.infer<typeof AgentServiceResponseSchema>;

// Aliases for compatibility
export type GetAgentsListResponse = ListAgentsResponse;
export type GetAgentsDetailResponse = AgentsDetailResponse;
export type ChildAgentFinishedResponse = TaskCompletionResponse;
export type AgentErrorResponse = AgentServiceErrorResponse;































