import { z } from 'zod';

// Base agent message schema
export const AgentMessageBaseSchema = z.object({
    agentId: z.string().optional(),
    requestId: z.string(),
    threadId: z.string().optional(),
    agentInstanceId: z.string().optional(),
    parentAgentInstanceId: z.string().optional(),
    parentId: z.string().optional(),
  });