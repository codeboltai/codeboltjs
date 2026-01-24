/**
 * Test utilities for tool wrapper validation
 * 
 * This module provides helper functions for testing tool wrappers,
 * including mock creation, response validation, and common test patterns.
 */

import { ToolResult, ToolErrorType } from '../../src/tools/types';

/**
 * Creates a mock successful module response
 */
export function createMockModuleSuccess<T>(payload: T): { success: true; payload: T } {
    return {
        success: true,
        payload,
    };
}

/**
 * Creates a mock failed module response
 */
export function createMockModuleError(error: string): { success: false; error: string } {
    return {
        success: false,
        error,
    };
}

/**
 * Validates that a ToolResult has the expected structure
 */
export function validateToolResult(result: ToolResult): void {
    expect(result).toBeDefined();
    expect(result).toHaveProperty('llmContent');
    expect(result).toHaveProperty('returnDisplay');
    expect(typeof result.llmContent).toBe('string');
    expect(typeof result.returnDisplay).toBe('string');
}

/**
 * Validates that a ToolResult represents a successful operation
 */
export function validateSuccessResult(result: ToolResult): void {
    validateToolResult(result);
    expect(result.error).toBeUndefined();
    expect(result.llmContent).not.toMatch(/^Error:/);
}

/**
 * Validates that a ToolResult represents a failed operation
 */
export function validateErrorResult(result: ToolResult, expectedErrorType?: ToolErrorType): void {
    validateToolResult(result);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toBeDefined();
    expect(result.error?.type).toBeDefined();
    
    if (expectedErrorType) {
        expect(result.error?.type).toBe(expectedErrorType);
    }
    
    expect(result.llmContent).toMatch(/^Error:/);
}

/**
 * Creates a mock AbortSignal for testing
 */
export function createMockAbortSignal(): AbortSignal {
    const controller = new AbortController();
    return controller.signal;
}

/**
 * Creates a mock module function that returns success
 */
export function createMockModuleFunction<TParams, TResult>(
    mockResponse: TResult
): jest.Mock<Promise<{ success: true; payload: TResult }>, [TParams]> {
    return jest.fn().mockResolvedValue(createMockModuleSuccess(mockResponse));
}

/**
 * Creates a mock module function that returns an error
 */
export function createMockModuleFunctionWithError<TParams>(
    errorMessage: string
): jest.Mock<Promise<{ success: false; error: string }>, [TParams]> {
    return jest.fn().mockResolvedValue(createMockModuleError(errorMessage));
}

/**
 * Creates a mock module function that throws an exception
 */
export function createMockModuleFunctionWithException<TParams>(
    error: Error
): jest.Mock<Promise<never>, [TParams]> {
    return jest.fn().mockRejectedValue(error);
}

/**
 * Waits for a promise to resolve or reject with timeout
 */
export async function waitForPromise<T>(
    promise: Promise<T>,
    timeoutMs: number = 5000
): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`Promise timeout after ${timeoutMs}ms`)), timeoutMs)
        ),
    ]);
}

/**
 * Asserts that a function throws an error with a specific message
 */
export async function expectAsyncError(
    fn: () => Promise<any>,
    expectedMessage?: string | RegExp
): Promise<void> {
    let error: Error | undefined;
    
    try {
        await fn();
    } catch (e) {
        error = e as Error;
    }
    
    expect(error).toBeDefined();
    
    if (expectedMessage) {
        if (typeof expectedMessage === 'string') {
            expect(error?.message).toContain(expectedMessage);
        } else {
            expect(error?.message).toMatch(expectedMessage);
        }
    }
}

/**
 * Test data generators for common types
 */
export const testDataGenerators = {
    /**
     * Generates a random string of specified length
     */
    randomString(length: number = 10): string {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    /**
     * Generates a random ID
     */
    randomId(): string {
        return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Generates a random ISO date string
     */
    randomDate(): string {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 365));
        return date.toISOString();
    },

    /**
     * Generates a random email
     */
    randomEmail(): string {
        return `test-${this.randomString(8)}@example.com`;
    },

    /**
     * Generates a random number within range
     */
    randomNumber(min: number = 0, max: number = 100): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
};

/**
 * Common test patterns for tool wrappers
 */
export const toolTestPatterns = {
    /**
     * Tests that a tool properly handles successful module responses
     */
    async testSuccessCase<TParams, TResult>(
        toolClass: any,
        params: TParams,
        mockModuleResponse: TResult,
        expectedLlmContentPattern?: string | RegExp
    ): Promise<ToolResult> {
        const tool = new toolClass();
        const invocation = tool.build(params);
        const signal = createMockAbortSignal();
        
        const result = await invocation.execute(signal);
        
        validateSuccessResult(result);
        
        if (expectedLlmContentPattern) {
            if (typeof expectedLlmContentPattern === 'string') {
                expect(result.llmContent).toContain(expectedLlmContentPattern);
            } else {
                expect(result.llmContent).toMatch(expectedLlmContentPattern);
            }
        }
        
        return result;
    },

    /**
     * Tests that a tool properly handles module errors
     */
    async testErrorCase<TParams>(
        toolClass: any,
        params: TParams,
        errorMessage: string,
        expectedErrorType: ToolErrorType = ToolErrorType.EXECUTION_FAILED
    ): Promise<ToolResult> {
        const tool = new toolClass();
        const invocation = tool.build(params);
        const signal = createMockAbortSignal();
        
        const result = await invocation.execute(signal);
        
        validateErrorResult(result, expectedErrorType);
        expect(result.error?.message).toContain(errorMessage);
        
        return result;
    },

    /**
     * Tests that a tool properly handles exceptions
     */
    async testExceptionCase<TParams>(
        toolClass: any,
        params: TParams,
        exception: Error
    ): Promise<ToolResult> {
        const tool = new toolClass();
        const invocation = tool.build(params);
        const signal = createMockAbortSignal();
        
        const result = await invocation.execute(signal);
        
        validateErrorResult(result, ToolErrorType.EXECUTION_FAILED);
        
        return result;
    },

    /**
     * Tests that a tool validates parameters correctly
     */
    testParameterValidation<TParams>(
        toolClass: any,
        invalidParams: TParams,
        expectedErrorPattern?: string | RegExp
    ): void {
        const tool = new toolClass();
        
        expect(() => {
            tool.build(invalidParams);
        }).toThrow();
        
        if (expectedErrorPattern) {
            try {
                tool.build(invalidParams);
            } catch (error) {
                const err = error as Error;
                if (typeof expectedErrorPattern === 'string') {
                    expect(err.message).toContain(expectedErrorPattern);
                } else {
                    expect(err.message).toMatch(expectedErrorPattern);
                }
            }
        }
    },
};
