import { ExecuteToolResponse } from '@codebolt/types/sdk';

export type ToolCategory = 'file' | 'search' | 'terminal' | 'git' | 'browser' | 'orchestration';

export interface ValidationResult {
    passed: boolean;
    message: string;
}

export interface TestCase {
    name: string;
    description: string;
    toolName: string;
    params: Record<string, unknown>;
    expectedSuccess: boolean;
    validate?: (result: ExecuteToolResponse) => ValidationResult;
}

export interface TestResult {
    testName: string;
    suiteName: string;
    passed: boolean;
    duration: number;
    error?: string;
    details?: string;
}

export interface TestSuite {
    name: string;
    category: ToolCategory;
    tests: TestCase[];
    setup?: () => Promise<void>;
    teardown?: () => Promise<void>;
}

export interface TestSummary {
    totalTests: number;
    passed: number;
    failed: number;
    duration: number;
    results: TestResult[];
    byCategory: Record<ToolCategory, { passed: number; failed: number; total: number }>;
}
