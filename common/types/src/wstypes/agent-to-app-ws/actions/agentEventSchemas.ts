import { z } from 'zod';

/**
 * Agent Event Schemas for Agent-to-App Communication
 * Based on codeboltjs/src/modules/agent.ts module operations
 */

// Agent location enum schema
export const agentLocationSchema = z.enum(['all', 'local_only', 'remote_only']);

// Agents enum schema
export const agentsSchema = z.enum(['local', 'all', 'downloaded']);

// Filter using enum schema
export const filterUsingSchema = z.enum(['use_ai', 'use_vector_db', 'use_both']);

// Base agent message schema
export const agentEventBaseSchema = z.object({
  type: z.literal('agentEvent'),
  action: z.string(),
  requestId: z.string()
});

// Find Agent Event Schema
export const findAgentEventSchema = agentEventBaseSchema.extend({
  action: z.literal('findAgent'),
  task: z.string(),
  agents: z.array(z.string()).optional(),
  maxResult: z.number().optional(),
  location: agentLocationSchema.optional(),
  getFrom: filterUsingSchema.optional(),
});

// Start Agent Event Schema
export const startAgentEventSchema = agentEventBaseSchema.extend({
  action: z.literal('startAgent'),
  agentId: z.string(),
  task: z.string(),
});

// List Agents Event Schema
export const listAgentsEventSchema = agentEventBaseSchema.extend({
  action: z.literal('listAgents'),
  agentType: agentsSchema.optional(),
});

// Get Agents Detail Event Schema
export const getAgentsDetailEventSchema = agentEventBaseSchema.extend({
  action: z.literal('agentsDetail'),
  agentList: z.array(z.string()).optional(),
});

// Union of all agent event schemas
export const agentEventSchema = z.union([
  findAgentEventSchema,
  startAgentEventSchema,
  listAgentsEventSchema,
  getAgentsDetailEventSchema,
]);

// Inferred TypeScript types for enums
export type AgentLocation = z.infer<typeof agentLocationSchema>;
export type Agents = z.infer<typeof agentsSchema>;
export type FilterUsing = z.infer<typeof filterUsingSchema>;

// Inferred TypeScript types for events
export type AgentEventBase = z.infer<typeof agentEventBaseSchema>;
export type FindAgentEvent = z.infer<typeof findAgentEventSchema>;
export type StartAgentEvent = z.infer<typeof startAgentEventSchema>;
export type ListAgentsEvent = z.infer<typeof listAgentsEventSchema>;
export type GetAgentsDetailEvent = z.infer<typeof getAgentsDetailEventSchema>;
export type AgentEvent = z.infer<typeof agentEventSchema>;

