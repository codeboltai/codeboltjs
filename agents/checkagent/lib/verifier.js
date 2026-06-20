const {
  codebolt,
  safeCall,
  firstString,
  responseTruthy,
  numberOr
} = require("./runtime");
const { inferJson } = require("./llm");
const {
  resolveBrowserTarget,
  targetToLocator,
  matcherTextOptions
} = require("./browser-targets");
const { compactObservation } = require("./observations");

async function verifySuccess({ plan, step, provider, candidate, observation, llmTrace }) {
  const success = step.success || {};
  const all = Array.isArray(success.all) ? success.all : undefined;
  const any = Array.isArray(success.any) ? success.any : undefined;
  const conditions = all || any || [];
  if (conditions.length === 0) {
    return { passed: true, confidence: 0.75, message: "No success conditions were specified." };
  }

  const results = [];
  for (const condition of conditions) {
    results.push(await verifyCondition({ plan, step, provider, candidate, observation, condition, llmTrace }));
  }

  const passed = all ? results.every((item) => item.passed) : results.some((item) => item.passed);
  return {
    passed,
    confidence: passed ? Math.max(...results.map((item) => item.confidence || 0.5)) : Math.min(...results.map((item) => item.confidence || 0.5)),
    message: passed ? "Success conditions passed." : results.map((item) => item.message).filter(Boolean).join("; ") || "Success conditions failed."
  };
}

async function verifyCondition(input) {
  const condition = input.condition || {};
  if (condition.exact) {
    return verifyExactCondition(input);
  }
  if (condition.structural) {
    const resolved = await resolveBrowserTarget({ structural: condition.structural });
    const visible = resolved.elementId
      ? await safeCall(() => codebolt.browser.is("visible", { kind: "id", value: resolved.elementId }))
      : await safeCall(() => codebolt.browser.is("visible", resolved.locator));
    return {
      passed: Boolean(responseTruthy(visible)),
      confidence: 0.75,
      message: responseTruthy(visible) ? "Structural condition passed." : "Structural condition was not visible."
    };
  }
  if (condition.visual) {
    const hasText = (input.observation.visibleText || []).join(" ").trim().length > 0;
    return { passed: hasText, confidence: 0.65, message: hasText ? "Visual condition passed." : "Page appeared blank." };
  }
  if (condition.semantic) {
    const judgement = await inferJson(
      "You judge whether a user-visible application observation satisfies a semantic testing assertion.",
      `Return JSON:
{
  "passed": true,
  "confidence": 0.0,
  "message": "short reason"
}

Plan summary:
${input.plan.intent?.summary || input.plan.metadata?.title || input.plan.metadata?.id}

Step goal:
${input.step.goal}

Semantic condition:
${JSON.stringify(condition.semantic, null, 2)}

Observation:
${JSON.stringify(compactObservation(input.observation), null, 2)}`,
      { maxRetries: 3 }
    );
    if (judgement) {
      input.llmTrace.push({
        stepId: input.step.id,
        kind: "assertion_judgement",
        status: "used",
        condition,
        confidence: numberOr(judgement.confidence, 0.5),
        reason: String(judgement.message || "")
      });
      return {
        passed: Boolean(judgement.passed),
        confidence: numberOr(judgement.confidence, 0.5),
        message: String(judgement.message || "Semantic assertion judged by LLM.")
      };
    }
    input.llmTrace.push({
      stepId: input.step.id,
      kind: "assertion_judgement",
      status: "unavailable",
      condition,
      message: "LLM did not return semantic assertion judgement."
    });
    return { passed: false, confidence: 0.4, message: "Semantic assertion could not be judged." };
  }
  return { passed: true, confidence: 0.5, message: "Unknown condition treated as pass." };
}

async function verifyExactCondition(input) {
  const exact = input.condition.exact || {};
  if (exact.titleContains) {
    const title = input.observation.data?.title || "";
    return {
      passed: String(title).includes(String(exact.titleContains)),
      confidence: 0.9,
      message: `Title contains ${exact.titleContains}.`
    };
  }
  if (exact.urlContains) {
    const url = input.observation.url || firstString(await safeCall(() => codebolt.browser.getUrl()), ["url", "currentUrl", "content"]) || "";
    return {
      passed: url.includes(String(exact.urlContains)),
      confidence: 0.9,
      message: `URL contains ${exact.urlContains}.`
    };
  }
  if (exact.url) {
    const url = input.observation.url || "";
    return { passed: url === exact.url, confidence: 0.9, message: `URL equals ${exact.url}.` };
  }
  if (exact.visibleText) {
    const options = matcherTextOptions(exact.visibleText);
    const haystack = (input.observation.visibleText || []).join("\n");
    const passed = options.some((text) => haystack.includes(text));
    return { passed, confidence: 0.85, message: passed ? "Visible text matched." : `Visible text not found: ${options.join(", ")}` };
  }
  if (exact.fieldValue) {
    const target = exact.fieldValue.target || {};
    const equals = String(exact.fieldValue.equals ?? "");
    const locator = targetToLocator(target);
    const response = locator
      ? await safeCall(() => codebolt.browser.get("value", { selector: locator }))
      : undefined;
    const value = firstString(response, ["value", "content", "text"]);
    return {
      passed: value === equals,
      confidence: value === equals ? 0.9 : 0.65,
      message: value === equals ? "Field value matched." : `Expected field value ${equals}, got ${value || "<empty>"}.`
    };
  }
  return { passed: true, confidence: 0.5, message: "Exact condition had no supported assertion keys." };
}

async function classifyFailure({ plan, step, trace, llmTrace, fallbackMessage }) {
  const classified = await inferJson(
    "You classify a failed provider-neutral testing plan run.",
    `Return JSON:
{
  "failureClass": "app_bug" | "plan_unclear" | "environment",
  "confidence": 0.0,
  "message": "short explanation"
}

Classification rules:
- app_bug: The plan was clear and environment worked, but user-visible behavior did not meet expectations.
- plan_unclear: The plan/candidate/assertion was ambiguous or impossible to resolve.
- environment: Browser, file, CodeBolt API, app startup, or LLM infrastructure failed.

Plan failure policy:
${JSON.stringify(plan.failurePolicy || {}, null, 2)}

Step:
${JSON.stringify({ id: step.id, goal: step.goal, operation: step.operation, success: step.success }, null, 2)}

Fallback message:
${fallbackMessage || ""}

Trace:
${JSON.stringify(trace.slice(-6), null, 2)}

LLM trace:
${JSON.stringify(llmTrace.slice(-6), null, 2)}`,
    { maxRetries: 3 }
  );

  if (classified?.failureClass) {
    llmTrace.push({
      stepId: step.id,
      kind: "failure_classification",
      status: "used",
      confidence: numberOr(classified.confidence, 0.5),
      reason: String(classified.message || "")
    });
    return {
      failureClass: classified.failureClass,
      confidence: numberOr(classified.confidence, 0.5),
      message: String(classified.message || fallbackMessage || "Testing plan failed.")
    };
  }

  const lower = String(fallbackMessage || "").toLowerCase();
  if (lower.includes("browser") || lower.includes("file") || lower.includes("install") || lower.includes("llm")) {
    return { failureClass: "environment", confidence: 0.55, message: fallbackMessage || "Environment failure." };
  }
  if (lower.includes("resolve") || lower.includes("candidate") || lower.includes("ambiguous")) {
    return { failureClass: "plan_unclear", confidence: 0.55, message: fallbackMessage || "Plan was unclear." };
  }
  return { failureClass: "app_bug", confidence: 0.5, message: fallbackMessage || "Expected app behavior was not observed." };
}

module.exports = {
  verifySuccess,
  classifyFailure
};
