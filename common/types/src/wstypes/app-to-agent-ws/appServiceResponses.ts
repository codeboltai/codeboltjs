import { z } from 'zod';

/**
 * App Service Response Schemas
 * Messages sent from app CLI service back to agents
 */

// LLM Configuration schema
const LLMConfigSchema = z.object({
    provider: z.string(),
    model: z.string()
}).nullable();

// Agent state schema
const AgentStateSchema = z.object({
    userName: z.string(),
    defaultLLM: LLMConfigSchema
});

// App state schema  
const AppStateSchema = z.object({
    defaultApplicationLLM: z.unknown(), // Function result, can be various types
    currentActiveProjectPath: z.unknown() // Function result, can be various types
});

// Chat message schema (basic structure)
const ChatSchema = z.object({
    type: z.string(),
    requestId: z.string(),
    messageHistory: z.array(z.unknown()).optional()
}).passthrough(); // Allow additional properties

// Project state file schema (from loadProjectStateFromFile)
const ProjectStateFileSchema = z.object({
    activeAgent: z.union([z.boolean(), z.object({}).passthrough()]),
    pinnedAgent: z.array(z.unknown()),
    runConfig: z.unknown().optional(),
    treeView: z.unknown().optional(),
    pinnedAgentsByThread: z.record(z.array(z.unknown())).optional(),
    modeLayout: z.unknown().optional(),
    currentLayout: z.unknown().optional()
}).passthrough(); // Allow additional properties from the JSON file

// Project state schema based on getCurrentState() structure
const ProjectStateSchema = z.object({
    token_used: z.number(),
    chats: z.array(ChatSchema),
    projectPath: z.string(),
    projectName: z.string(),
    state: ProjectStateFileSchema
});

// Full state schema (combination of all states)
const FullStateSchema = z.object({
    agentState: AgentStateSchema,
    appState: AppStateSchema,
    projectState: ProjectStateSchema
});

// Get app state response schema (returns projectState only)
export const GetAppStateResponseSchema = z.object({
    type: z.literal('getAppStateResponse'),
    state: z.union([ProjectStateSchema, FullStateSchema]) // Can be either projectState or full state
});

// Get project state response schema
export const GetProjectStateResponseSchema = z.object({
    type: z.literal('getProjectStateResponse'),
    projectState: ProjectStateSchema
});

// Update project state response schema
export const UpdateProjectStateResponseSchema = z.object({
    type: z.literal('updateProjectStateResponse'),
    message: z.literal('success')
});

// Union of all app service response schemas
export const AppServiceResponseSchema = z.union([
    GetAppStateResponseSchema,
    GetProjectStateResponseSchema,
    UpdateProjectStateResponseSchema
]);

// Export with the expected name for the index file
export const appServiceResponseSchema = AppServiceResponseSchema;

// Type exports
export type LLMConfig = z.infer<typeof LLMConfigSchema>;
export type AgentState = z.infer<typeof AgentStateSchema>;
export type AppState = z.infer<typeof AppStateSchema>;
export type Chat = z.infer<typeof ChatSchema>;
export type ProjectStateFile = z.infer<typeof ProjectStateFileSchema>;
export type ProjectState = z.infer<typeof ProjectStateSchema>;
export type FullState = z.infer<typeof FullStateSchema>;
export type GetAppStateResponse = z.infer<typeof GetAppStateResponseSchema>;
export type GetProjectStateResponse = z.infer<typeof GetProjectStateResponseSchema>;
export type UpdateProjectStateResponse = z.infer<typeof UpdateProjectStateResponseSchema>;
export type AppServiceResponse = z.infer<typeof AppServiceResponseSchema>;
