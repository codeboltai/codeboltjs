const path = require("path");
const {
  codebolt,
  PLAN_KIND,
  send,
  logStep,
  firstString,
  payloadOf
} = require("./runtime");
const { inferJson } = require("./llm");

function loadYamlParser() {
  try {
    const yaml = require("yaml");
    return { parse: yaml.parse };
  } catch (yamlError) {
    try {
      const jsYaml = require("js-yaml");
      return { parse: jsYaml.load };
    } catch {
      throw new Error("Install the `yaml` package in checkagent before running testing plans.");
    }
  }
}

const YAML = loadYamlParser();

async function getProjectRoot() {
  try {
    const response = await codebolt.project.getProjectPath();
    return normalizeProjectRoot(
      response?.projectPath ||
      response?.path ||
      response?.data?.projectPath ||
      response?.data?.path ||
      response?.message?.projectPath ||
      process.cwd()
    );
  } catch {
    return normalizeProjectRoot(process.cwd());
  }
}

function normalizeProjectRoot(rawPath) {
  const normalized = String(rawPath || process.cwd())
    .replace(/^file:\/\//i, "")
    .replace(/^["']|["']$/g, "")
    .trim();
  if (path.isAbsolute(normalized)) return path.normalize(normalized);
  if (/^Users[\\/]/.test(normalized)) return path.normalize(`${path.sep}${normalized}`);
  return path.resolve(process.cwd(), normalized);
}

async function extractPlanPathWithLlm(reqMessage) {
  logStep("extract-plan-path:start");
  const projectRoot = await getProjectRoot();
  const userMessage = reqMessage?.userMessage || "";
  const mentionedFullPaths = reqMessage?.mentionedFullPaths || [];
  const mentionedFiles = reqMessage?.mentionedFiles || [];
  const currentFile = reqMessage?.currentFile;

  const extraction = await inferJson(
    "You extract one testing plan file path from a CodeBolt agent start message.",
    `Find the testing plan YAML file path that the check agent should run.

The path may be absolute or relative to the active project. Prefer an explicit .yaml/.yml path from the user message. If the message is ambiguous, set planPath to null and explain why.

Active project root:
${projectRoot}

User message:
${userMessage}

mentionedFullPaths:
${JSON.stringify(mentionedFullPaths, null, 2)}

mentionedFiles:
${JSON.stringify(mentionedFiles, null, 2)}

currentFile:
${JSON.stringify(currentFile)}

Return JSON:
{
  "planPath": "string or null",
  "confidence": 0.0,
  "reason": "short reason"
}`,
    { maxRetries: 3 }
  );

  if (extraction?.planPath && typeof extraction.planPath === "string") {
    const resolvedPath = resolvePlanPath(extraction.planPath, projectRoot);
    logStep("extract-plan-path:resolved-by-llm", { planPath: resolvedPath, confidence: extraction.confidence });
    return resolvedPath;
  }

  const fallback = fallbackPathFromMessage(reqMessage);
  if (fallback) {
    send(`Check Agent: LLM did not return a usable path, using obvious path fallback: ${fallback}`);
    const resolvedPath = resolvePlanPath(fallback, projectRoot);
    logStep("extract-plan-path:resolved-by-fallback", { planPath: resolvedPath });
    return resolvedPath;
  }

  logStep("extract-plan-path:failed", { reason: extraction?.reason || "" });
  throw new Error(`Could not extract a testing plan path from the message. ${extraction?.reason || ""}`.trim());
}

function fallbackPathFromMessage(reqMessage) {
  const fullPaths = reqMessage?.mentionedFullPaths || [];
  const direct = fullPaths.find((item) => typeof item === "string" && /\.ya?ml$/i.test(item));
  if (direct) return direct;
  const text = reqMessage?.userMessage || "";
  const windowsPath = text.match(/[A-Za-z]:[^\r\n"'<>|]+?\.ya?ml\b/i);
  if (windowsPath) return windowsPath[0].trim();
  const relativePath = text.match(/(?:\.{1,2}[\\/])?[A-Za-z0-9_.\-\\/]+\.ya?ml\b/i);
  return relativePath ? relativePath[0].trim() : undefined;
}

function resolvePlanPath(rawPath, projectRoot) {
  const normalized = rawPath.replace(/^file:\/\//i, "").replace(/^["']|["']$/g, "");
  if (path.isAbsolute(normalized)) return path.normalize(normalized);
  return path.resolve(projectRoot, normalized);
}

function extractKeyedValueFromText(text, keys) {
  const source = String(text || "");
  for (const key of keys) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = source.match(new RegExp(`\\b${escaped}\\b\\s*[:=]\\s*["']?([A-Za-z0-9_.:-]+)`, "i"));
    if (match?.[1]) return match[1].replace(/["',.;)]$/, "");
  }
  return undefined;
}

function extractAutoTestingReference(reqMessage) {
  const userMessage = reqMessage?.userMessage || "";
  const caseId = firstString(reqMessage, [
    "testCaseId",
    "caseId",
    "autotestId",
    "autoTestId",
    "autoTestingCaseId",
    "testingCaseId"
  ]) || extractKeyedValueFromText(userMessage, [
    "testCaseId",
    "caseId",
    "autotestId",
    "autoTestId",
    "autoTestingCaseId",
    "testingCaseId"
  ]);
  const runId = firstString(reqMessage, ["runId", "testRunId", "autoTestingRunId"])
    || extractKeyedValueFromText(userMessage, ["runId", "testRunId", "autoTestingRunId"]);
  const suiteId = extractRequestedSuiteId(reqMessage)
    || extractKeyedValueFromText(userMessage, ["testSuiteId", "suiteId", "autoTestingSuiteId"]);
  const filter = firstString(reqMessage, ["filter"])
    || extractKeyedValueFromText(userMessage, ["filter"]);
  if (!caseId && !runId && !suiteId) return undefined;
  return { caseId, runId, suiteId, filter };
}

function extractRequestedSuiteId(reqMessage) {
  return firstString(reqMessage, ["testSuiteId", "suiteId"]);
}

function extractPlanFromTestCase(testCase, sourceLabel) {
  const plan = testCase?.testingPlan;
  validatePlan(plan, sourceLabel);
  return {
    plan,
    caseId: testCase.id,
    suiteId: undefined,
    source: sourceLabel
  };
}

function pickRunCase(run, reference) {
  if (!Array.isArray(run?.testCases) || run.testCases.length === 0) {
    throw new Error(`Run ${run?.id || reference.runId} does not contain any test cases.`);
  }
  if (reference.caseId) {
    const requested = run.testCases.find((runCase) => runCase.testCaseId === reference.caseId);
    if (requested) return requested;
    throw new Error(`Case ${reference.caseId} was not found in run ${run.id}.`);
  }
  if (reference.filter === "failed") {
    const failed = run.testCases.find((runCase) => {
      return runCase.status === "failed" || runCase.steps?.some((step) => step.status === "failed");
    });
    if (failed) return failed;
  }
  return run.testCases[0];
}

async function loadPlanFromAutoTestingApi(reqMessage) {
  const reference = extractAutoTestingReference(reqMessage);
  if (!reference) return undefined;

  logStep("load-autotest:start", reference);

  if (reference.runId) {
    const runPayload = payloadOf(await codebolt.autoTesting.getRun({ id: reference.runId }));
    const run = runPayload.run;
    if (!run?.id) throw new Error(`AutoTesting run ${reference.runId} could not be loaded.`);
    const runCase = pickRunCase(run, reference);
    const casePayload = payloadOf(await codebolt.autoTesting.getCase({ id: runCase.testCaseId }));
    const testCase = casePayload.testCase;
    if (!testCase?.id) throw new Error(`AutoTesting case ${runCase.testCaseId} could not be loaded for run ${run.id}.`);
    const loaded = extractPlanFromTestCase(testCase, `autotesting run ${run.id} case ${testCase.id}`);
    loaded.suiteId = run.testSuiteId;
    loaded.runId = run.id;
    logStep("load-autotest:loaded-from-run", { runId: run.id, caseId: testCase.id, suiteId: run.testSuiteId });
    return [loaded];
  }

  if (reference.caseId) {
    const casePayload = payloadOf(await codebolt.autoTesting.getCase({ id: reference.caseId }));
    const testCase = casePayload.testCase;
    if (!testCase?.id) throw new Error(`AutoTesting case ${reference.caseId} could not be loaded.`);
    const loaded = extractPlanFromTestCase(testCase, `autotesting case ${testCase.id}`);
    loaded.suiteId = reference.suiteId;
    logStep("load-autotest:loaded-from-case", { caseId: testCase.id, suiteId: reference.suiteId });
    return [loaded];
  }

  if (reference.suiteId) {
    const suitePayload = payloadOf(await codebolt.autoTesting.getSuite({ id: reference.suiteId }));
    const testCases = Array.isArray(suitePayload.testCases) ? suitePayload.testCases : [];
    if (testCases.length === 0) throw new Error(`AutoTesting suite ${reference.suiteId} does not contain any test cases.`);
    const loadedCases = testCases.map((testCase) => {
      const loaded = extractPlanFromTestCase(testCase, `autotesting suite ${reference.suiteId} case ${testCase.id}`);
      loaded.suiteId = reference.suiteId;
      return loaded;
    });
    logStep("load-autotest:loaded-from-suite", {
      suiteId: reference.suiteId,
      caseCount: loadedCases.length,
      caseIds: loadedCases.map((loaded) => loaded.caseId)
    });
    return loadedCases;
  }

  return undefined;
}

async function readPlan(planPath) {
  logStep("read-plan:start", { planPath });
  const readResponse = await codebolt.fs.readFile(planPath);
  const source = extractFileContent(readResponse);
  if (!source) {
    throw new Error(`Testing plan file could not be read through codebolt.fs: ${planPath}`);
  }
  const plan = YAML.parse(source);
  validatePlan(plan, planPath);
  logStep("read-plan:complete", { planId: plan.metadata.id, steps: plan.flow.length });
  return plan;
}

function extractFileContent(response) {
  if (typeof response === "string") return response;
  return firstString(response, ["content", "source", "text", "data", "fileContent", "value"]);
}

function validatePlan(plan, planPath) {
  if (!plan || typeof plan !== "object") {
    throw new Error(`Testing plan is empty or invalid: ${planPath}`);
  }
  if (plan.kind !== PLAN_KIND) {
    throw new Error(`Testing plan kind must be ${PLAN_KIND}.`);
  }
  if (!plan.metadata?.id) {
    throw new Error("Testing plan metadata.id is required.");
  }
  if (!plan.target?.surface) {
    throw new Error("Testing plan target.surface is required.");
  }
  if (!Array.isArray(plan.flow) || plan.flow.length === 0) {
    throw new Error("Testing plan flow must contain at least one step.");
  }
  const forbidden = JSON.stringify(plan).match(/\b(playwright|stagehand|appium|openai|selenium|webdriver)\b/i);
  if (forbidden) {
    throw new Error(`Testing plan contains provider-specific implementation name: ${forbidden[0]}`);
  }
}

function materializePlan(inputPlan, runId) {
  const variables = {};
  for (const [key, value] of Object.entries(inputPlan.variables || {})) {
    variables[key] = interpolateValue(value?.value ?? value, runId, {});
  }

  const interpolate = (value) => {
    if (typeof value === "string") {
      return interpolateString(value, runId, variables);
    }
    if (Array.isArray(value)) {
      return value.map(interpolate);
    }
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, interpolate(nested)]));
    }
    return value;
  };

  return { plan: interpolate(inputPlan), variables };
}

function interpolateValue(value, runId, variables) {
  if (typeof value !== "string") return value;
  return interpolateString(value, runId, variables);
}

function interpolateString(value, runId, variables) {
  return value.replace(/\{\{\s*run\.id\s*\}\}/g, runId).replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return variables[key] === undefined ? `{{ ${key} }}` : String(variables[key]);
  });
}

module.exports = {
  getProjectRoot,
  extractPlanPathWithLlm,
  loadPlanFromAutoTestingApi,
  readPlan,
  materializePlan,
  extractRequestedSuiteId
};
