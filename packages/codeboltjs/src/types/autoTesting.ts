// Actions matching backend autoTestingService.cli.ts
export enum AutoTestingAction {
  // Suites
  SUITE_CREATE = 'autotesting.suite.create',
  SUITE_GET = 'autotesting.suite.get',
  SUITE_LIST = 'autotesting.suite.list',
  SUITE_UPDATE = 'autotesting.suite.update',
  SUITE_DELETE = 'autotesting.suite.delete',
  SUITE_CASE_ADD = 'autotesting.suite.case.add',
  SUITE_CASE_REMOVE = 'autotesting.suite.case.remove',
  // Cases
  CASE_CREATE = 'autotesting.case.create',
  CASE_GET = 'autotesting.case.get',
  CASE_LIST = 'autotesting.case.list',
  CASE_UPDATE = 'autotesting.case.update',
  CASE_DELETE = 'autotesting.case.delete',
  // Runs
  RUN_CREATE = 'autotesting.run.create',
  RUN_GET = 'autotesting.run.get',
  RUN_LIST = 'autotesting.run.list',
  RUN_UPDATE_STATUS = 'autotesting.run.update_status',
  RUN_CASE_UPDATE = 'autotesting.run.case.update',
  RUN_STEP_UPDATE = 'autotesting.run.step.update',
}

// Response types matching backend responses
export enum AutoTestingResponseType {
  SUITE_CREATE_RESPONSE = 'autotesting.suite.create.response',
  SUITE_GET_RESPONSE = 'autotesting.suite.get.response',
  SUITE_LIST_RESPONSE = 'autotesting.suite.list.response',
  SUITE_UPDATE_RESPONSE = 'autotesting.suite.update.response',
  SUITE_DELETE_RESPONSE = 'autotesting.suite.delete.response',
  SUITE_CASE_ADD_RESPONSE = 'autotesting.suite.case.add.response',
  SUITE_CASE_REMOVE_RESPONSE = 'autotesting.suite.case.remove.response',

  CASE_CREATE_RESPONSE = 'autotesting.case.create.response',
  CASE_GET_RESPONSE = 'autotesting.case.get.response',
  CASE_LIST_RESPONSE = 'autotesting.case.list.response',
  CASE_UPDATE_RESPONSE = 'autotesting.case.update.response',
  CASE_DELETE_RESPONSE = 'autotesting.case.delete.response',

  RUN_CREATE_RESPONSE = 'autotesting.run.create.response',
  RUN_GET_RESPONSE = 'autotesting.run.get.response',
  RUN_LIST_RESPONSE = 'autotesting.run.list.response',
  RUN_UPDATE_STATUS_RESPONSE = 'autotesting.run.update_status.response',
  RUN_CASE_UPDATE_RESPONSE = 'autotesting.run.case.update.response',
  RUN_STEP_UPDATE_RESPONSE = 'autotesting.run.step.update.response',
}

export type TestStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
export type TestRunStatus = 'pending' | 'running' | 'completed' | 'cancelled';

export interface TestStep {
  id: string;
  order: number;
  content: string;
  status?: TestStatus;
  logs?: string;
  userOverride?: boolean;
}

export interface TestCase {
  id: string;
  key: string;
  name: string;
  description?: string;
  steps: TestStep[];
  labels?: string[];
  priority?: 'low' | 'medium' | 'high' | 'automated';
  type?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  testCaseIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TestRunStep {
  stepId: string;
  status: TestStatus;
  logs?: string;
  userOverride?: boolean;
  executedAt?: string;
}

export interface TestRunCase {
  testCaseId: string;
  status: TestStatus;
  steps: TestRunStep[];
  userOverride?: boolean;
  startedAt?: string;
  completedAt?: string;
}

export interface TestRun {
  id: string;
  testSuiteId: string;
  name: string;
  status: TestRunStatus;
  testCases: TestRunCase[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Parameters
export interface ICreateSuiteParams {
  name: string;
  description?: string;
  testCaseIds?: string[];
}

export interface IGetSuiteParams {
  id: string;
}

export interface IListSuitesParams {}

export interface IUpdateSuiteParams {
  id: string;
  name?: string;
  description?: string;
  testCaseIds?: string[];
}

export interface IDeleteSuiteParams {
  id: string;
}

export interface IAddCaseToSuiteParams {
  suiteId: string;
  caseId: string;
}

export interface IRemoveCaseFromSuiteParams {
  suiteId: string;
  caseId: string;
}

export interface ICreateCaseParams {
  key: string;
  name: string;
  description?: string;
  steps: Array<{ content: string; order?: number }>;
  labels?: string[];
  priority?: TestCase['priority'];
  type?: string;
}

export interface IGetCaseParams {
  id: string;
}

export interface IListCasesParams {}

export interface IUpdateCaseParams {
  id: string;
  key?: string;
  name?: string;
  description?: string;
  steps?: Array<{ id?: string; content: string; order?: number }>;
  labels?: string[];
  priority?: TestCase['priority'];
  type?: string;
}

export interface IDeleteCaseParams {
  id: string;
}

export interface ICreateRunParams {
  testSuiteId: string;
  name?: string;
}

export interface IGetRunParams {
  id: string;
}

export interface IListRunsParams {
  suiteId?: string;
}

export interface IUpdateRunStatusParams {
  runId: string;
  status: TestRunStatus;
}

export interface IUpdateRunCaseParams {
  runId: string;
  caseId: string;
  status: TestStatus;
  userOverride?: boolean;
}

export interface IUpdateRunStepParams {
  runId: string;
  caseId: string;
  stepId: string;
  status: TestStatus;
  logs?: string;
  userOverride?: boolean;
}

// Responses
export interface ICreateSuiteResponse {
  payload: { suite: TestSuite };
}

export interface IGetSuiteResponse {
  payload: { suite: TestSuite; testCases: TestCase[] };
}

export interface IListSuitesResponse {
  payload: { suites: TestSuite[] };
}

export interface IUpdateSuiteResponse {
  payload: { suite: TestSuite };
}

export interface IDeleteSuiteResponse {
  payload: { ok: boolean } | { suiteId?: string };
}

export interface IAddCaseToSuiteResponse {
  payload: { suite: TestSuite };
}

export interface IRemoveCaseFromSuiteResponse {
  payload: { suite: TestSuite };
}

export interface ICreateCaseResponse {
  payload: { testCase: TestCase };
}

export interface IGetCaseResponse {
  payload: { testCase: TestCase };
}

export interface IListCasesResponse {
  payload: { cases: TestCase[] };
}

export interface IUpdateCaseResponse {
  payload: { testCase: TestCase };
}

export interface IDeleteCaseResponse {
  payload: { ok: boolean } | { caseId?: string };
}

export interface ICreateRunResponse {
  payload: { run: TestRun };
}

export interface IGetRunResponse {
  payload: { run: TestRun };
}

export interface IListRunsResponse {
  payload: { runs: TestRun[] };
}

export interface IUpdateRunStatusResponse {
  payload: { run: TestRun };
}

export interface IUpdateRunCaseResponse {
  payload: { run: TestRun };
}

export interface IUpdateRunStepResponse {
  payload: { run: TestRun };
}
