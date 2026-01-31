/**
 * Context Rule Engine Module
 * Provides context rule engine operations for conditional memory inclusion
 */

import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import type {
    ContextRuleEngineResponse,
    ContextRuleEngineListResponse,
    ContextRuleEngineDeleteResponse,
    EvaluateRulesResponse,
    PossibleVariablesResponse,
    CreateContextRuleEngineParams,
    UpdateContextRuleEngineParams,
    EvaluateRulesParams
} from '@codebolt/types/lib';

const contextRuleEngine = {
    /**
     * Create a new rule engine
     * @param config - Rule engine configuration
     */
    create: async (config: CreateContextRuleEngineParams): Promise<ContextRuleEngineResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'contextRuleEngine.create',
                requestId: randomUUID(),
                params: config
            },
            'contextRuleEngine.create'
        );
    },

    /**
     * Get a rule engine by ID
     * @param id - Rule engine ID
     */
    get: async (id: string): Promise<ContextRuleEngineResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'contextRuleEngine.get',
                requestId: randomUUID(),
                params: { id }
            },
            'contextRuleEngine.get'
        );
    },

    /**
     * List all rule engines
     */
    list: async (): Promise<ContextRuleEngineListResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'contextRuleEngine.list',
                requestId: randomUUID(),
                params: {}
            },
            'contextRuleEngine.list'
        );
    },

    /**
     * Update a rule engine
     * @param id - Rule engine ID
     * @param updates - Update parameters
     */
    update: async (id: string, updates: UpdateContextRuleEngineParams): Promise<ContextRuleEngineResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'contextRuleEngine.update',
                requestId: randomUUID(),
                params: { id, ...updates }
            },
            'contextRuleEngine.update'
        );
    },

    /**
     * Delete a rule engine
     * @param id - Rule engine ID
     */
    delete: async (id: string): Promise<ContextRuleEngineDeleteResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'contextRuleEngine.delete',
                requestId: randomUUID(),
                params: { id }
            },
            'contextRuleEngine.delete'
        );
    },

    /**
     * Evaluate rules against provided variables
     * @param params - Evaluation parameters
     */
    evaluate: async (params: EvaluateRulesParams): Promise<EvaluateRulesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'contextRuleEngine.evaluate',
                requestId: randomUUID(),
                params
            },
            'contextRuleEngine.evaluate'
        );
    },

    /**
     * Get all possible variables for UI configuration
     */
    getPossibleVariables: async (): Promise<PossibleVariablesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'contextRuleEngine.getPossibleVariables',
                requestId: randomUUID(),
                params: {}
            },
            'contextRuleEngine.getPossibleVariables'
        );
    }
};

export default contextRuleEngine;
