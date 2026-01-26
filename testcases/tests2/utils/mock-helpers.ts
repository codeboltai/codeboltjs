/**
 * Mock helpers for module functions
 * 
 * This module provides utilities for mocking module functions in tests,
 * allowing isolated testing of tool wrappers without requiring actual
 * WebSocket connections.
 */

import type { ToolResult } from '../../../src/tools/types';

/**
 * Standard module response structure
 */
export interface ModuleResponse<T> {
    success: boolean;
    payload?: T;
    error?: string;
}

/**
 * Creates a mock module that returns successful responses
 */
export function createMockModule<T extends Record<string, any>>(
    mockResponses: Partial<Record<keyof T, any>>
): T {
    const mockModule = {} as T;

    for (const [key, value] of Object.entries(mockResponses)) {
        (mockModule as any)[key] = jest.fn().mockResolvedValue({
            success: true,
            payload: value,
        });
    }

    return mockModule;
}

/**
 * Creates a mock module function that returns a successful response
 */
export function mockModuleSuccess<TParams, TResult>(
    result: TResult
): jest.Mock<Promise<ModuleResponse<TResult>>, [TParams]> {
    return jest.fn().mockResolvedValue({
        success: true,
        payload: result,
    });
}

/**
 * Creates a mock module function that returns an error response
 */
export function mockModuleError<TParams>(
    errorMessage: string
): jest.Mock<Promise<ModuleResponse<never>>, [TParams]> {
    return jest.fn().mockResolvedValue({
        success: false,
        error: errorMessage,
    });
}

/**
 * Creates a mock module function that throws an exception
 */
export function mockModuleException<TParams>(
    error: Error
): jest.Mock<Promise<never>, [TParams]> {
    return jest.fn().mockRejectedValue(error);
}

/**
 * Creates a spy on a module function
 */
export function spyOnModule<T extends Record<string, any>>(
    module: T,
    functionName: keyof T
): jest.SpyInstance {
    return jest.spyOn(module, functionName as any);
}

/**
 * Restores all mocks on a module
 */
export function restoreModuleMocks<T extends Record<string, any>>(
    module: T
): void {
    for (const key of Object.keys(module)) {
        const fn = (module as any)[key];
        if (fn && typeof fn.mockRestore === 'function') {
            fn.mockRestore();
        }
    }
}

/**
 * Creates a mock WebSocket message manager
 */
export function createMockMessageManager() {
    return {
        sendAndWaitForResponse: jest.fn(),
        send: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
    };
}

/**
 * Creates a mock Codebolt instance for testing
 */
export function createMockCodebolt() {
    return {
        ready: true,
        waitForReady: jest.fn().mockResolvedValue(undefined),
        messageManager: createMockMessageManager(),
    };
}

/**
 * Test data builders for common types
 */
export const testDataBuilders = {
    /**
     * Builds a mock deliberation object
     */
    deliberation: (overrides?: Partial<any>) => ({
        id: 'test-deliberation-id',
        type: 'voting' as const,
        title: 'Test Deliberation',
        requestMessage: 'Test request message',
        creatorId: 'test-creator-id',
        creatorName: 'Test Creator',
        status: 'collecting-responses' as const,
        participants: ['agent-1', 'agent-2'],
        responseCount: 0,
        agentResponseCount: 0,
        userResponseCount: 0,
        voteCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides,
    }),

    /**
     * Builds a mock deliberation response object
     */
    deliberationResponse: (overrides?: Partial<any>) => ({
        id: 'test-response-id',
        deliberationId: 'test-deliberation-id',
        responderId: 'test-responder-id',
        responderName: 'Test Responder',
        body: 'Test response body',
        voteCount: 0,
        createdAt: new Date().toISOString(),
        ...overrides,
    }),

    /**
     * Builds a mock deliberation vote object
     */
    deliberationVote: (overrides?: Partial<any>) => ({
        id: 'test-vote-id',
        deliberationId: 'test-deliberation-id',
        responseId: 'test-response-id',
        voterId: 'test-voter-id',
        voterName: 'Test Voter',
        createdAt: new Date().toISOString(),
        ...overrides,
    }),

    /**
     * Builds a mock portfolio object
     */
    portfolio: (overrides?: Partial<any>) => ({
        agentId: 'test-agent-id',
        agentName: 'Test Agent',
        karma: 100,
        testimonials: [],
        talents: [],
        conversations: [],
        ...overrides,
    }),

    /**
     * Builds a mock codemap object
     */
    codemap: (overrides?: Partial<any>) => ({
        id: 'test-codemap-id',
        name: 'Test Codemap',
        description: 'Test codemap description',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides,
    }),

    /**
     * Builds a mock search result object
     */
    searchResult: (overrides?: Partial<any>) => ({
        file: 'test-file.ts',
        line: 10,
        column: 5,
        match: 'test match',
        context: 'test context',
        ...overrides,
    }),
};

/**
 * Assertion helpers for tool results
 */
export const toolResultAssertions = {
    /**
     * Asserts that a tool result is successful
     */
    assertSuccess(result: ToolResult): void {
        expect(result).toBeDefined();
        expect(result.error).toBeUndefined();
        expect(result.llmContent).toBeDefined();
        expect(result.returnDisplay).toBeDefined();
        expect(typeof result.llmContent).toBe('string');
        expect(typeof result.returnDisplay).toBe('string');
    },

    /**
     * Asserts that a tool result is an error
     */
    assertError(result: ToolResult, expectedErrorType?: string): void {
        expect(result).toBeDefined();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBeDefined();
        expect(result.error?.type).toBeDefined();

        if (expectedErrorType) {
            expect(result.error?.type).toBe(expectedErrorType);
        }
    },

    /**
     * Asserts that llmContent contains expected text
     */
    assertLlmContentContains(result: ToolResult, expectedText: string): void {
        expect(result.llmContent).toBeDefined();
        expect(typeof result.llmContent).toBe('string');
        expect(result.llmContent).toContain(expectedText);
    },

    /**
     * Asserts that llmContent matches expected pattern
     */
    assertLlmContentMatches(result: ToolResult, pattern: RegExp): void {
        expect(result.llmContent).toBeDefined();
        expect(typeof result.llmContent).toBe('string');
        expect(result.llmContent).toMatch(pattern);
    },
};
