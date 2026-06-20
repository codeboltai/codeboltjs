const {
  WEB_SURFACE,
  send,
  logStep,
  nowIso
} = require("./runtime");
const { materializePlan } = require("./plan-loader");
const {
  AutoTestingReporter,
  createAutoTestingRun
} = require("./autotesting");
const {
  InMemoryRunArtifacts,
  createBrowserEvidenceArtifact
} = require("./artifacts");
const { CodeboltWebProvider } = require("./web-provider");
const {
  rankCandidates,
  candidateLevel,
  resolveCandidateAttempts
} = require("./candidates");
const { verifySuccess, classifyFailure } = require("./verifier");
const {
  buildAutoTestingNotes,
  collectArtifactPaths
} = require("./observations");

class TestingPlanRunner {
  async run(inputPlan, options) {
    const startedAt = nowIso();
    const autoTesting = await createAutoTestingRun(inputPlan, options);
    const reporter = new AutoTestingReporter(autoTesting);
    const runId = autoTesting.run.id;
    logStep("run-plan:start", { runId, planId: inputPlan.metadata?.id });
    const { plan } = materializePlan(inputPlan, runId);
    const artifacts = new InMemoryRunArtifacts(runId, options.artifactScope);
    const resultArtifacts = [];
    const trace = [];
    const llmTrace = [];
    const suggestedRefinements = [];
    const provider = new CodeboltWebProvider({ artifacts, resultArtifacts });

    await reporter.updateRun("running");
    send(`Check Agent: running ${plan.metadata.id} (${plan.flow.length} steps).`);

    const finish = async (partial) => {
      logStep("run-plan:finish", {
        runId,
        planId: plan.metadata.id,
        status: partial.status,
        failedStep: partial.failedStep,
        failureClass: partial.failureClass
      });
      const result = {
        status: partial.status,
        planId: plan.metadata.id,
        runId,
        startedAt,
        finishedAt: nowIso(),
        failedStep: partial.failedStep,
        failureClass: partial.failureClass,
        failureConfidence: partial.failureConfidence,
        message: partial.message,
        trace,
        llmTrace,
        artifacts: resultArtifacts,
        suggestedRefinements
      };
      if (partial.status === "failed") {
        await reporter.updateStep(partial.failedStep, "failed", buildAutoTestingNotes({
          message: partial.message,
          trace: trace.filter((item) => item.stepId === partial.failedStep),
          llmTrace: llmTrace.filter((item) => item.stepId === partial.failedStep),
          suggestedRefinements
        }));
        await reporter.updateCase("failed", partial.message);
      } else if (partial.status === "passed") {
        await reporter.updateCase("passed", `Passed ${trace.length} recorded step attempts.`);
      }
      await provider.cleanup();
      if (options.completeRunOnFinish !== false) {
        await reporter.updateRun("completed");
      }
      await artifacts.writeJson("trace.json", trace);
      await artifacts.writeJson("llm-trace.json", llmTrace);
      await artifacts.writeJson("result.json", result);
      if (options.publishArtifact !== false) {
        result.publishedArtifact = await createBrowserEvidenceArtifact({
          sourcePath: artifacts.runDir,
          planId: plan.metadata.id,
          runId,
          autoTesting,
          status: result.status,
          startedAt,
          finishedAt: result.finishedAt,
          scope: "run",
          evidence: provider.evidence
        });
        await artifacts.writeJson("result.json", result);
      }
      result.evidence = {
        observations: trace.length,
        llmEvents: llmTrace.length,
        artifactEntries: artifacts.entries.size
      };
      return result;
    };

    try {
      if (plan.target.surface !== WEB_SURFACE) {
        logStep("run-plan:unsupported-surface", { surface: plan.target.surface });
        return finish({
          status: "failed",
          failedStep: plan.flow[0]?.id,
          failureClass: "environment",
          failureConfidence: 1,
          message: `This CodeBolt check agent currently implements the web provider only. Expected target.surface "${WEB_SURFACE}", got "${plan.target.surface}".`
        });
      }

      for (const step of plan.flow) {
        logStep("step:start", { stepId: step.id, goal: step.goal, operationType: step.operation?.type });
        send(`Check Agent: step ${step.id} - ${step.goal || step.operation?.type || "operation"}`);
        await reporter.updateStep(step.id, "running", `Started ${step.goal || step.operation?.type || "operation"}.`);
        const stepResult = await runStep({ plan, step, provider, trace, llmTrace, suggestedRefinements });
        logStep("step:complete", { stepId: step.id, status: stepResult.status, message: stepResult.message });
        await artifacts.appendJsonl("trace.jsonl", {
          stepId: step.id,
          status: stepResult.status,
          timestamp: nowIso()
        });
        if (stepResult.status === "failed") {
          logStep("step:classify-failure:start", { stepId: step.id });
          const classification = await classifyFailure({ plan, step, trace, llmTrace, fallbackMessage: stepResult.message });
          logStep("step:classify-failure:complete", {
            stepId: step.id,
            failureClass: classification.failureClass,
            confidence: classification.confidence
          });
          return finish({
            status: "failed",
            failedStep: step.id,
            failureClass: classification.failureClass,
            failureConfidence: classification.confidence,
            message: classification.message
          });
        }
        await reporter.updateStep(step.id, "passed", buildAutoTestingNotes({
          message: stepResult.message,
          trace: trace.filter((item) => item.stepId === step.id),
          llmTrace: llmTrace.filter((item) => item.stepId === step.id)
        }));
      }

      return finish({ status: "passed" });
    } catch (error) {
      await provider.cleanup();
      throw error;
    }
  }
}

async function runStep(input) {
  const { plan, step, provider, trace, llmTrace, suggestedRefinements } = input;
  const candidates = rankCandidates(
    step.operation?.candidates?.length ? step.operation.candidates : [{ intent: { instruction: step.operation?.intent || step.goal } }],
    plan.runtime?.resolutionOrder || ["exact", "structural", "semantic", "visual", "intent", "task", "providerHint"]
  );
  logStep("run-step:candidates", { stepId: step.id, candidateCount: candidates.length });
  let lastMessage = "No candidate could be executed.";

  for (const sourceCandidate of candidates) {
    logStep("run-step:observe-before:start", { stepId: step.id, candidateLevel: candidateLevel(sourceCandidate) });
    const observationBefore = await provider.observe({ plan, step, candidate: sourceCandidate });
    logStep("run-step:observe-before:complete", {
      stepId: step.id,
      candidateLevel: candidateLevel(sourceCandidate),
      url: observationBefore?.url
    });
    const attempts = await resolveCandidateAttempts({
      plan,
      step,
      sourceCandidate,
      observation: observationBefore,
      llmTrace,
      suggestedRefinements
    });
    logStep("run-step:attempts-resolved", { stepId: step.id, attemptCount: attempts.length });

    for (const attempt of attempts) {
      const candidate = attempt.candidate;
      try {
        logStep("run-step:execute:start", { stepId: step.id, candidateLevel: candidateLevel(candidate) });
        const executed = await provider.execute({ plan, step, candidate });
        logStep("run-step:execute:complete", { stepId: step.id, message: executed.message });
        const observationAfter = executed.observation || (await provider.observe({ plan, step, candidate }));
        logStep("run-step:verify:start", { stepId: step.id });
        const verified = await verifySuccess({ plan, step, provider, candidate, observation: observationAfter, llmTrace });
        logStep("run-step:verify:complete", { stepId: step.id, passed: verified.passed, message: verified.message });
        trace.push({
          stepId: step.id,
          providerId: provider.id,
          candidate,
          resolvedFromCandidate: attempt.resolvedFromCandidate,
          resolutionConfidence: attempt.resolutionConfidence,
          resolutionReason: attempt.resolutionReason,
          status: verified.passed ? "passed" : "failed",
          message: verified.message || executed.message,
          observationBefore,
          observationAfter,
          artifacts: collectArtifactPaths(observationBefore).concat(collectArtifactPaths(observationAfter))
        });
        if (verified.passed) {
          logStep("run-step:passed", { stepId: step.id });
          return { status: "passed" };
        }
        lastMessage = verified.message || "Step verification failed.";
      } catch (error) {
        lastMessage = error instanceof Error ? error.message : String(error);
        logStep("run-step:attempt-failed", { stepId: step.id, message: lastMessage });
        trace.push({
          stepId: step.id,
          providerId: provider.id,
          candidate,
          resolvedFromCandidate: attempt.resolvedFromCandidate,
          resolutionConfidence: attempt.resolutionConfidence,
          resolutionReason: attempt.resolutionReason,
          status: "failed",
          message: lastMessage,
          observationBefore
        });
      }
    }
  }

  return { status: "failed", message: lastMessage };
}

module.exports = {
  TestingPlanRunner
};
