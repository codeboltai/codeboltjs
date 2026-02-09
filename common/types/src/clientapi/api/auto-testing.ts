// Auto Testing API types

export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  cases: TestCase[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TestCase {
  id: string;
  name: string;
  description?: string;
  steps: TestStep[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TestStep {
  id: string;
  action: string;
  expected?: string;
  data?: Record<string, unknown>;
  order: number;
}

export interface TestRun {
  id: string;
  suiteId?: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'cancelled';
  cases: TestRunCase[];
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestRunCase {
  caseId: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  steps: TestRunStep[];
  startedAt?: string;
  completedAt?: string;
}

export interface TestRunStep {
  stepId: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  result?: string;
  error?: string;
}

export interface CreateTestSuiteRequest {
  name: string;
  description?: string;
}

export interface UpdateTestSuiteRequest {
  name?: string;
  description?: string;
}

export interface AddTestCaseToSuiteRequest {
  caseId: string;
}

export interface CreateTestCaseRequest {
  name: string;
  description?: string;
  steps: TestStep[];
  tags?: string[];
}

export interface UpdateTestCaseRequest {
  name?: string;
  description?: string;
  steps?: TestStep[];
  tags?: string[];
}

export interface CreateTestRunRequest {
  suiteId?: string;
  caseIds?: string[];
}

export interface UpdateTestRunRequest {
  status?: 'pending' | 'running' | 'passed' | 'failed' | 'cancelled';
}

export interface PatchTestRunCaseRequest {
  status?: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
}

export interface PatchTestRunCaseStepRequest {
  status?: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  result?: string;
  error?: string;
}
