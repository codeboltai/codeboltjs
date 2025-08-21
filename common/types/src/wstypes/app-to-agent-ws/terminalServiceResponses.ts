import { z } from 'zod';

/**
 * Terminal Service Response Schemas
 * Messages sent from terminal CLI service back to agents
 */

// Command output response schema
export const CommandOutputResponseSchema = z.object({
  type: z.literal('commandOutput'),
  requestId: z.string(),
  output: z.string().optional(),
  stdout: z.string().optional(),
  stderr: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Command error response schema
export const CommandErrorResponseSchema = z.object({
  type: z.literal('commandError'),
  requestId: z.string(),
  error: z.string(),
  exitCode: z.number().optional(),
  stderr: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional()
});

// Command finish response schema
export const CommandFinishResponseSchema = z.object({
  type: z.literal('commandFinish'),
  requestId: z.string(),
  exitCode: z.number(),
  stdout: z.string().optional(),
  stderr: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Terminal interrupt response schema
export const TerminalInterruptResponseSchema = z.object({
  type: z.literal('terminalInterrupted'),
  requestId: z.string(),
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Union of all terminal service response schemas
export const TerminalServiceResponseSchema = z.union([
  CommandOutputResponseSchema,
  CommandErrorResponseSchema,
  CommandFinishResponseSchema,
  TerminalInterruptResponseSchema
]);

// Export with the expected name for the index file
export const terminalServiceResponseSchema = TerminalServiceResponseSchema;

// Type exports
export type CommandOutputResponse = z.infer<typeof CommandOutputResponseSchema>;
export type CommandErrorResponse = z.infer<typeof CommandErrorResponseSchema>;
export type CommandFinishResponse = z.infer<typeof CommandFinishResponseSchema>;
export type TerminalInterruptResponse = z.infer<typeof TerminalInterruptResponseSchema>;
export type TerminalServiceResponse = z.infer<typeof TerminalServiceResponseSchema>; 