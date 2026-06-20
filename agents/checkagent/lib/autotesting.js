const {
  codebolt,
  logStep,
  payloadOf,
  runOf,
  responseError
} = require("./runtime");
const { extractRequestedSuiteId } = require("./plan-loader");

class AutoTestingReporter {
  constructor(autoTesting) {
    this.autoTesting = autoTesting;
  }

  get runId() {
    return this.autoTesting?.run?.id;
  }

  get caseId() {
    return this.autoTesting?.caseId;
  }

  async updateRun(status) {
    if (!this.runId) return;
    await safeAutoTestingCall("autotesting:update-run-status", () => codebolt.autoTesting.updateRunStatus({
      runId: this.runId,
      status
    }));
  }

  async updateCase(status, notes) {
    if (!this.runId || !this.caseId) return;
    await safeAutoTestingCall("autotesting:update-run-case", () => codebolt.autoTesting.updateRunCaseStatus({
      runId: this.runId,
      caseId: this.caseId,
      status,
      notes
    }));
  }

  async updateStep(stepId, status, notes) {
    if (!this.runId || !this.caseId || !stepId) return;
    await safeAutoTestingCall("autotesting:update-run-step", () => codebolt.autoTesting.updateRunStepStatus({
      runId: this.runId,
      caseId: this.caseId,
      stepId,
      status,
      logs: notes,
      notes
    }));
  }
}

async function ensureAutoTestingSuite(reqMessage, preferredSuiteId) {
  const requestedSuiteId = preferredSuiteId || extractRequestedSuiteId(reqMessage);
  if (requestedSuiteId) return requestedSuiteId;

  const listedPayload = payloadOf(await codebolt.autoTesting.listSuites({}));
  const suites = Array.isArray(listedPayload.suites) ? listedPayload.suites : [];
  const existing = suites.find((suite) => suite?.name === "Check Agent Runs");
  if (existing?.id) return existing.id;

  const createdPayload = payloadOf(await codebolt.autoTesting.createSuite({
    name: "Check Agent Runs",
    description: "Runs created by checkagent."
  }));
  const suite = createdPayload.suite;
  if (!suite?.id) throw new Error("Auto testing suite could not be created.");
  return suite.id;
}

async function ensureAutoTestingCase(plan, suiteId, preferredCaseId) {
  const key = plan.metadata.id;
  if (preferredCaseId) {
    const existingPayload = payloadOf(await codebolt.autoTesting.getCase({ id: preferredCaseId }));
    const existingCase = existingPayload.testCase;
    if (!existingCase?.id) throw new Error(`Auto testing case ${preferredCaseId} could not be loaded.`);
    const updatedPayload = payloadOf(await codebolt.autoTesting.updateCase({
      id: existingCase.id,
      key,
      name: plan.metadata.title || key,
      testingPlan: plan,
      labels: plan.metadata.tags,
      caseType: plan.target.surface
    }));
    await codebolt.autoTesting.addCaseToSuite({ suiteId, caseId: existingCase.id });
    return updatedPayload.testCase || existingCase;
  }

  const listedPayload = payloadOf(await codebolt.autoTesting.listCases({}));
  const cases = Array.isArray(listedPayload.cases) ? listedPayload.cases : [];
  const existing = cases.find((testCase) => {
    return testCase?.key === key || testCase?.testingPlan?.metadata?.id === key;
  });
  const casePayload = {
    key,
    name: plan.metadata.title || key,
    testingPlan: plan,
    labels: plan.metadata.tags,
    caseType: plan.target.surface
  };

  if (existing?.id) {
    const updatedPayload = payloadOf(await codebolt.autoTesting.updateCase({ id: existing.id, ...casePayload }));
    await codebolt.autoTesting.addCaseToSuite({ suiteId, caseId: existing.id });
    return updatedPayload.testCase || existing;
  }

  const createdPayload = payloadOf(await codebolt.autoTesting.createCase({ suiteId, ...casePayload }));
  const testCase = createdPayload.testCase || createdPayload.case;
  if (!testCase?.id) throw new Error("Auto testing case could not be created.");
  return testCase;
}

async function createAutoTestingRun(plan, options) {
  if (options.autoTesting) return options.autoTesting;

  const suiteId = await ensureAutoTestingSuite(options.requestMessage, options.suiteId);
  const testCase = await ensureAutoTestingCase(plan, suiteId, options.caseId);
  const createRunResponse = await codebolt.autoTesting.createRun({
    testSuiteId: suiteId,
    name: `${plan.metadata.id} ${new Date().toLocaleString()}`
  });
  const run = runOf(createRunResponse);
  if (!run?.id) {
    logStep("autotesting:create-run:unexpected-response", createRunResponse);
    throw new Error(`Auto testing run could not be created.${responseError(createRunResponse) ? ` ${responseError(createRunResponse)}` : ""}`);
  }
  for (const runCase of run.testCases || []) {
    if (runCase.testCaseId !== testCase.id) {
      await safeAutoTestingCall("autotesting:skip-non-target-case", () => codebolt.autoTesting.updateRunCaseStatus({
        runId: run.id,
        caseId: runCase.testCaseId,
        status: "skipped"
      }));
    }
  }
  return { suiteId, caseId: testCase.id, run };
}

async function createSuiteAutoTestingRun(loadedPlans, reqMessage) {
  const suiteId = loadedPlans.find((loaded) => loaded.suiteId)?.suiteId
    || await ensureAutoTestingSuite(reqMessage);
  const createRunResponse = await codebolt.autoTesting.createRun({
    testSuiteId: suiteId,
    name: `Suite run ${new Date().toLocaleString()}`
  });
  const run = runOf(createRunResponse);
  if (!run?.id) {
    logStep("autotesting:create-suite-run:unexpected-response", createRunResponse);
    throw new Error(`Auto testing suite run could not be created.${responseError(createRunResponse) ? ` ${responseError(createRunResponse)}` : ""}`);
  }
  return { suiteId, run };
}

async function safeAutoTestingCall(label, fn) {
  try {
    return await fn();
  } catch (error) {
    logStep(`${label}:failed`, { message: error instanceof Error ? error.message : String(error) });
    return undefined;
  }
}

module.exports = {
  AutoTestingReporter,
  createAutoTestingRun,
  createSuiteAutoTestingRun,
  safeAutoTestingCall
};
