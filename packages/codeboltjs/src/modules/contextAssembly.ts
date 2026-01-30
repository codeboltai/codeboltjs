/**
 * Context Assembly Module
 * Provides context assembly engine operations for building agent context
 */

import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import type {
    ContextAssemblyResponse,
    ContextValidateResponse,
    MemoryTypesResponse,
    RuleEvaluationResponse,
    RequiredVariablesResponse,
    ContextAssemblyRequest
} from '@codebolt/types/lib';

const contextAssembly = {
    /**
     * Assemble context from various memory sources
     * @param request - Context assembly request
     */
    getContext: async (request: ContextAssemblyRequest): Promise<ContextAssemblyResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'contextAssembly.getContext',
                requestId: randomUUID(),
                params: request
            },
            'contextAssembly.getContext'
        );
    },

    /**
     * Validate a context assembly request
     * @param request - Request to validate
     */
    validate: async (request: ContextAssemblyRequest): Promise<ContextValidateResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'contextAssembly.validate',
                requestId: randomUUID(),
                params: request
            },
            'contextAssembly.validate'
        );
    },

    /**
     * List available memory types
     */
    listMemoryTypes: async (): Promise<MemoryTypesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'contextAssembly.listMemoryTypes',
                requestId: randomUUID(),
                params: {}
            },
            'contextAssembly.listMemoryTypes'
        );
    },

    /**
     * Evaluate rules only without fetching memory content
     * @param request - Context assembly request
     * @param ruleEngineIds - Optional specific rule engine IDs to evaluate
     */
    evaluateRules: async (request: ContextAssemblyRequest, ruleEngineIds?: string[]): Promise<RuleEvaluationResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'contextAssembly.evaluateRules',
                requestId: randomUUID(),
                params: { ...request, rule_engine_ids: ruleEngineIds }
            },
            'contextAssembly.evaluateRules'
        );
    },

    /**
     * Get required variables for specific memory types
     * @param memoryNames - Array of memory type names
     */
    getRequiredVariables: async (memoryNames: string[]): Promise<RequiredVariablesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'contextAssembly.getRequiredVariables',
                requestId: randomUUID(),
                params: { memory_names: memoryNames }
            },
            'contextAssembly.getRequiredVariables'
        );
    }
};

export default contextAssembly;
