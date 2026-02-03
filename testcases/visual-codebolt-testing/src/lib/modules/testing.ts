import { CodeboltModule, param, fn } from './types';

export const autoTestingModule: CodeboltModule = {
  name: 'autoTesting',
  displayName: 'Auto Testing',
  description: 'Automated testing management',
  category: 'testing',
  functions: [
    // Test Suites
    fn('createSuite', 'Creates a test suite', [
      param('name', 'string', true, 'Suite name'),
      param('description', 'string', false, 'Suite description'),
      param('tags', 'array', false, 'Suite tags'),
    ], 'SuiteResponse'),
    fn('getSuite', 'Gets a test suite', [
      param('suiteId', 'string', true, 'Suite ID'),
    ], 'SuiteResponse'),
    fn('listSuites', 'Lists test suites', [
      param('filters', 'object', false, 'Filter options'),
    ], 'SuiteListResponse'),
    fn('updateSuite', 'Updates a test suite', [
      param('suiteId', 'string', true, 'Suite ID'),
      param('updates', 'object', true, 'Update data'),
    ], 'SuiteResponse'),
    fn('deleteSuite', 'Deletes a test suite', [
      param('suiteId', 'string', true, 'Suite ID'),
    ], 'DeleteResponse'),
    fn('addCaseToSuite', 'Adds case to suite', [
      param('suiteId', 'string', true, 'Suite ID'),
      param('caseId', 'string', true, 'Case ID'),
    ], 'SuiteResponse'),
    fn('removeCaseFromSuite', 'Removes case from suite', [
      param('suiteId', 'string', true, 'Suite ID'),
      param('caseId', 'string', true, 'Case ID'),
    ], 'SuiteResponse'),
    // Test Cases
    fn('createCase', 'Creates a test case', [
      param('title', 'string', true, 'Case title'),
      param('description', 'string', false, 'Case description'),
      param('steps', 'array', false, 'Test steps'),
      param('expectedResult', 'string', false, 'Expected result'),
    ], 'CaseResponse'),
    fn('getCase', 'Gets a test case', [
      param('caseId', 'string', true, 'Case ID'),
    ], 'CaseResponse'),
    fn('listCases', 'Lists test cases', [
      param('filters', 'object', false, 'Filter options'),
    ], 'CaseListResponse'),
    fn('updateCase', 'Updates a test case', [
      param('caseId', 'string', true, 'Case ID'),
      param('updates', 'object', true, 'Update data'),
    ], 'CaseResponse'),
    fn('deleteCase', 'Deletes a test case', [
      param('caseId', 'string', true, 'Case ID'),
    ], 'DeleteResponse'),
    // Test Runs
    fn('createRun', 'Creates a test run', [
      param('suiteId', 'string', true, 'Suite ID'),
      param('name', 'string', false, 'Run name'),
      param('environment', 'string', false, 'Environment'),
    ], 'RunResponse'),
    fn('getRun', 'Gets a test run', [
      param('runId', 'string', true, 'Run ID'),
    ], 'RunResponse'),
    fn('listRuns', 'Lists test runs', [
      param('filters', 'object', false, 'Filter options'),
    ], 'RunListResponse'),
    fn('updateRunStatus', 'Updates run status', [
      param('runId', 'string', true, 'Run ID'),
      param('status', 'string', true, 'New status'),
    ], 'RunResponse'),
    fn('updateRunCaseStatus', 'Updates run case status', [
      param('runId', 'string', true, 'Run ID'),
      param('caseId', 'string', true, 'Case ID'),
      param('status', 'string', true, 'Case status'),
      param('notes', 'string', false, 'Status notes'),
    ], 'RunResponse'),
    fn('updateRunStepStatus', 'Updates run step status', [
      param('runId', 'string', true, 'Run ID'),
      param('caseId', 'string', true, 'Case ID'),
      param('stepIndex', 'number', true, 'Step index'),
      param('status', 'string', true, 'Step status'),
      param('notes', 'string', false, 'Status notes'),
    ], 'RunResponse'),
  ],
};
