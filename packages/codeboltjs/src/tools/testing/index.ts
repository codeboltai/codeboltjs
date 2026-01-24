/**
 * Testing tools for automated test management
 */

// Test Suite Tools
export { TestSuiteCreateTool, type TestSuiteCreateToolParams } from './test-suite-create';
export { TestSuiteGetTool, type TestSuiteGetToolParams } from './test-suite-get';
export { TestSuiteListTool, type TestSuiteListToolParams } from './test-suite-list';
export { TestSuiteUpdateTool, type TestSuiteUpdateToolParams } from './test-suite-update';
export { TestSuiteDeleteTool, type TestSuiteDeleteToolParams } from './test-suite-delete';

// Test Case Tools
export { TestCaseCreateTool, type TestCaseCreateToolParams } from './test-case-create';
export { TestCaseGetTool, type TestCaseGetToolParams } from './test-case-get';
export { TestCaseListTool, type TestCaseListToolParams } from './test-case-list';
export { TestCaseUpdateTool, type TestCaseUpdateToolParams } from './test-case-update';

// Test Run Tools
export { TestRunCreateTool, type TestRunCreateToolParams } from './test-run-create';
export { TestRunGetTool, type TestRunGetToolParams } from './test-run-get';
export { TestRunUpdateStatusTool, type TestRunUpdateStatusToolParams } from './test-run-update-status';

// Create instances for convenience
import { TestSuiteCreateTool } from './test-suite-create';
import { TestSuiteGetTool } from './test-suite-get';
import { TestSuiteListTool } from './test-suite-list';
import { TestSuiteUpdateTool } from './test-suite-update';
import { TestSuiteDeleteTool } from './test-suite-delete';
import { TestCaseCreateTool } from './test-case-create';
import { TestCaseGetTool } from './test-case-get';
import { TestCaseListTool } from './test-case-list';
import { TestCaseUpdateTool } from './test-case-update';
import { TestRunCreateTool } from './test-run-create';
import { TestRunGetTool } from './test-run-get';
import { TestRunUpdateStatusTool } from './test-run-update-status';

/**
 * All testing tools
 */
export const testingTools = [
    // Test Suite Tools
    new TestSuiteCreateTool(),
    new TestSuiteGetTool(),
    new TestSuiteListTool(),
    new TestSuiteUpdateTool(),
    new TestSuiteDeleteTool(),
    // Test Case Tools
    new TestCaseCreateTool(),
    new TestCaseGetTool(),
    new TestCaseListTool(),
    new TestCaseUpdateTool(),
    // Test Run Tools
    new TestRunCreateTool(),
    new TestRunGetTool(),
    new TestRunUpdateStatusTool(),
];
