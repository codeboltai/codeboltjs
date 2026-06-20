const {
  codebolt,
  send,
  nowIso,
  resultFailureReason,
  formatFailedResultLine
} = require("./runtime");
const {
  getProjectRoot,
  extractPlanPathWithLlm,
  loadPlanFromAutoTestingApi,
  readPlan
} = require("./plan-loader");
const {
  AutoTestingReporter,
  createSuiteAutoTestingRun
} = require("./autotesting");
const { TestingPlanRunner } = require("./runner");

class CheckAgentApplication {
  constructor({ runner = new TestingPlanRunner() } = {}) {
    this.runner = runner;
  }

  start() {
    codebolt.onMessage((reqMessage) => this.handle(reqMessage));
  }

  async handle(reqMessage) {
    try {
      const projectRoot = await getProjectRoot();
      let loadedPlans = await loadPlanFromAutoTestingApi(reqMessage);
      if (loadedPlans) {
        send(`Check Agent: loaded ${loadedPlans.length} testing plan${loadedPlans.length === 1 ? "" : "s"} from AutoTesting.`);
      } else {
        send("Check Agent: no autotest id found, extracting testing plan path with codebolt.llm.inference.");
        const planPath = await extractPlanPathWithLlm(reqMessage);
        send(`Check Agent: loading plan ${planPath}`);
        const plan = await readPlan(planPath);
        loadedPlans = [{ plan, source: planPath }];
      }

      const suiteStartedAt = nowIso();
      const results = [];
      const suiteAutoTesting = loadedPlans.length > 1
        ? await createSuiteAutoTestingRun(loadedPlans, reqMessage)
        : undefined;
      if (suiteAutoTesting) {
        await new AutoTestingReporter(suiteAutoTesting).updateRun("running");
      }

      for (let index = 0; index < loadedPlans.length; index += 1) {
        const loaded = loadedPlans[index];
        send(`Check Agent: running plan ${index + 1}/${loadedPlans.length} from ${loaded.source}.`);
        const autoTesting = suiteAutoTesting
          ? { suiteId: suiteAutoTesting.suiteId, caseId: loaded.caseId, run: suiteAutoTesting.run }
          : undefined;
        const result = await this.runner.run(loaded.plan, {
          projectRoot,
          requestMessage: reqMessage,
          suiteId: loaded.suiteId,
          caseId: loaded.caseId,
          autoTesting,
          artifactScope: suiteAutoTesting ? loaded.caseId : undefined,
          completeRunOnFinish: !suiteAutoTesting,
          publishArtifact: true
        });
        results.push({ ...result, source: loaded.source, caseId: loaded.caseId, autoTestingRunId: result.runId });
        if (result.status === "passed") {
          send(`Check Agent: passed ${loaded.plan.metadata.id}. AutoTesting run: ${result.runId}`);
        } else {
          const reason = resultFailureReason(result);
          send(`Check Agent: failed ${loaded.plan.metadata.id} at ${result.failedStep}. Class: ${result.failureClass}.${reason ? ` Reason: ${reason}` : ""} AutoTesting run: ${result.runId}`);
        }
      }

      if (results.length === 1) return JSON.stringify(results[0], null, 2);

      const summary = {
        status: results.some((result) => result.status === "failed") ? "failed" : "passed",
        total: results.length,
        passed: results.filter((result) => result.status === "passed").length,
        failed: results.filter((result) => result.status === "failed").length,
        runId: suiteAutoTesting?.run?.id,
        startedAt: suiteStartedAt,
        finishedAt: nowIso(),
        publishedArtifacts: results.map((result) => result.publishedArtifact).filter(Boolean),
        results
      };
      if (suiteAutoTesting) {
        await new AutoTestingReporter(suiteAutoTesting).updateRun("completed");
      }
      const failedResults = results.filter((result) => result.status === "failed");
      const failureDetails = failedResults.length > 0
        ? `\nFailures:\n${failedResults.map(formatFailedResultLine).join("\n")}`
        : "";
      send(`Check Agent: suite complete. Passed ${summary.passed}/${summary.total}, failed ${summary.failed}/${summary.total}.${failureDetails}`);
      return JSON.stringify(summary, null, 2);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      send(`Check Agent: error - ${message}`);
      return message;
    }
  }
}

module.exports = {
  CheckAgentApplication
};
