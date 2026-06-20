const {
  logStep,
  numberOr
} = require("./runtime");
const { inferJson } = require("./llm");
const { compactObservation } = require("./observations");

function rankCandidates(candidates, resolutionOrder) {
  const rank = new Map(resolutionOrder.map((level, index) => [level, index]));
  return [...candidates].sort((left, right) => candidateRank(left, rank) - candidateRank(right, rank));
}

function candidateRank(candidate, rank) {
  return rank.get(candidateLevel(candidate)) ?? 999;
}

function candidateLevel(candidate) {
  if (candidate.exact) return "exact";
  if (candidate.structural) return "structural";
  if (candidate.semantic) return "semantic";
  if (candidate.visual) return "visual";
  if (candidate.intent) return "intent";
  if (candidate.task) return "task";
  if (candidate.providerHint) return "providerHint";
  return "unknown";
}

async function resolveCandidateAttempts(input) {
  const level = candidateLevel(input.sourceCandidate);
  if (!["semantic", "intent", "task", "visual"].includes(level)) {
    return [{ candidate: input.sourceCandidate }];
  }

  const resolved = await inferJson(
    "You resolve provider-neutral testing plan candidates into concrete web candidates for a CodeBolt browser runtime.",
    `Resolve the candidate for the next test step.

Return JSON:
{
  "resolvedCandidate": {
    "exact": { "web": { "stableId": "data-testid value" } }
  },
  "confidence": 0.0,
  "reason": "short reason"
}

You may return one of these forms:
- {"exact":{"web":{"stableId":"..."}}}
- {"exact":{"web":{"id":"..."}}}
- {"exact":{"web":{"selector":"..."}}}
- {"structural":{"role":"button","name":"..."}}
- {"structural":{"label":"..."}}
- {"structural":{"placeholder":"..."}}
- {"structural":{"text":"..."}}

Do not mention Playwright, Selenium, OpenAI, or any implementation engine.

Plan summary:
${input.plan.intent?.summary || input.plan.metadata?.title || input.plan.metadata?.id}

Step:
${JSON.stringify({ id: input.step.id, goal: input.step.goal, operation: input.step.operation }, null, 2)}

Source candidate:
${JSON.stringify(input.sourceCandidate, null, 2)}

Observation:
${JSON.stringify(compactObservation(input.observation), null, 2)}`,
    { maxRetries: 3 }
  );

  if (resolved?.resolvedCandidate) {
    input.llmTrace.push({
      stepId: input.step.id,
      kind: "candidate_resolution",
      status: "used",
      sourceCandidate: input.sourceCandidate,
      resolvedCandidate: resolved.resolvedCandidate,
      confidence: numberOr(resolved.confidence, 0.5),
      reason: String(resolved.reason || "Resolved by codebolt.llm.inference.")
    });
    input.suggestedRefinements.push({
      stepId: input.step.id,
      kind: "candidate",
      level: candidateLevel(resolved.resolvedCandidate),
      value: resolved.resolvedCandidate,
      confidence: numberOr(resolved.confidence, 0.5),
      source: "codebolt-llm"
    });
    return [
      {
        candidate: resolved.resolvedCandidate,
        resolvedFromCandidate: input.sourceCandidate,
        resolutionConfidence: numberOr(resolved.confidence, 0.5),
        resolutionReason: String(resolved.reason || "")
      },
      { candidate: input.sourceCandidate }
    ];
  }

  logStep("candidate-resolution:unavailable", { stepId: input.step.id, level });
  input.llmTrace.push({
    stepId: input.step.id,
    kind: "candidate_resolution",
    status: "unavailable",
    sourceCandidate: input.sourceCandidate,
    message: "LLM did not return a resolvedCandidate."
  });
  return [{ candidate: input.sourceCandidate }];
}

module.exports = {
  rankCandidates,
  candidateLevel,
  resolveCandidateAttempts
};
