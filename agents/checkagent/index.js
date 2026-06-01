// Disable optional native ws modules so the agent starts cleanly in ordinary Node installs.
process.env.WS_NO_BUFFER_UTIL = "1";
process.env.WS_NO_UTF_8_VALIDATE = "1";
process.env.CODEBOLT_URL = process.env.CODEBOLT_URL || "ws://localhost:3000/codebolt";
process.env.CODEBOLT_ID = process.env.CODEBOLT_ID || "checkagent";

const path = require("path");
const crypto = require("crypto");
const codebolt = require("@codebolt/codeboltjs");

const PLAN_KIND = "TestingPlan";
const RESULT_DIR = ".codebolt/autotests";
const WEB_SURFACE = "web";

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

function send(message, payload) {
  try {
    codebolt.chat.sendMessage(message, payload);
  } catch {
    console.log(message, payload || "");
  }
}

function logStep(message, payload) {
  const prefix = `[checkagent] ${nowIso()} ${message}`;
  if (payload === undefined) {
    console.log(prefix);
    return;
  }
  console.log(prefix, payload);
}

function nowIso() {
  return new Date().toISOString();
}

function stableRunId() {
  return `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

function stripJsonFences(text) {
  return String(text || "")
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
}

function parseJsonObject(text) {
  const cleaned = stripJsonFences(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return undefined;
    try {
      return JSON.parse(match[0]);
    } catch {
      return undefined;
    }
  }
}

function llmText(response) {
  return (
    response?.completion?.choices?.[0]?.message?.content ||
    response?.completion?.choices?.[0]?.text ||
    response?.completion?.content ||
    response?.message ||
    response?.content ||
    ""
  );
}

async function inferJson(systemPrompt, userPrompt, options = {}) {
  let lastResponse = "";
  let lastError = "";
  const maxRetries = options.maxRetries || 2;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    const retryText = attempt === 1 ? "" : `\n\nPrevious response was not valid JSON.\nError: ${lastError}\nResponse: ${lastResponse.slice(0, 1000)}\nReturn only corrected JSON.`;
    const response = await codebolt.llm.inference({
      messages: [
        { role: "system", content: `${systemPrompt}\n\nReturn only valid JSON. Do not use markdown.` },
        { role: "user", content: `${userPrompt}${retryText}` }
      ],
      llmrole: options.llmrole || "testingllm",
      temperature: options.temperature ?? 0
    });
    lastResponse = llmText(response);
    const parsed = parseJsonObject(lastResponse);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
    lastError = "Response was not a JSON object.";
  }
  return undefined;
}

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

async function makeArtifacts(projectRoot, runId, artifactScope) {
  const runDir = artifactScope
    ? path.join(projectRoot, RESULT_DIR, "runs", runId, artifactScope)
    : path.join(projectRoot, RESULT_DIR, "runs", runId);
  logStep("artifacts:create:start", { runDir });
  await ensureCodeboltFolder(path.join(projectRoot, RESULT_DIR));
  await ensureCodeboltFolder(path.join(projectRoot, RESULT_DIR, "runs"));
  await ensureCodeboltFolder(path.join(projectRoot, RESULT_DIR, "runs", runId));
  await ensureCodeboltFolder(runDir);
  logStep("artifacts:create:complete", { runDir });
  return {
    runDir,
    async writeJson(name, value) {
      return writeCodeboltFile(runDir, name, `${JSON.stringify(value, null, 2)}\n`);
    },
    async appendJsonl(name, value) {
      const filePath = path.join(runDir, name);
      let existing = "";
      const current = await safeCall(() => codebolt.fs.readFile(filePath));
      if (current) {
        existing = extractFileContent(current) || "";
      }
      return writeCodeboltFile(runDir, name, `${existing}${JSON.stringify(value)}\n`);
    },
    async writeText(name, value) {
      return writeCodeboltFile(runDir, name, String(value || ""));
    },
    async writeBase64(name, base64) {
      const cleaned = String(base64).replace(/^data:image\/\w+;base64,/, "");
      const artifactName = name.replace(/\.[^.]+$/, ".base64.txt");
      return writeCodeboltFile(runDir, artifactName, cleaned);
    }
  };
}

async function ensureCodeboltFolder(folderPath) {
  const parent = path.dirname(folderPath);
  const name = path.basename(folderPath);
  const response = await safeCall(() => codebolt.fs.createFolder(name, parent));
  if (response?.success === false && !String(response?.message || response?.error || "").toLowerCase().includes("exist")) {
    throw new Error(`codebolt.fs.createFolder failed for ${folderPath}: ${response?.message || response?.error || "unknown error"}`);
  }
}

async function writeCodeboltFile(dirPath, fileName, content) {
  const filePath = path.join(dirPath, fileName);
  const response = await codebolt.fs.createFile(fileName, content, dirPath);
  if (response?.success === false) {
    const updateResponse = await codebolt.fs.updateFile(fileName, filePath, content);
    if (updateResponse?.success === false) {
      throw new Error(`codebolt.fs write failed for ${filePath}: ${updateResponse?.message || updateResponse?.error || response?.message || response?.error || "unknown error"}`);
    }
  }
  return filePath;
}

function payloadOf(response) {
  return response?.payload || response || {};
}

function runOf(response) {
  const payload = payloadOf(response);
  return payload.run
    || response?.run
    || payload.data?.run
    || response?.data?.run
    || payload.result?.run
    || response?.result?.run
    || payload.result?.payload?.run
    || response?.result?.payload?.run
    || payload.message?.run
    || response?.message?.run;
}

function responseError(response) {
  const payload = payloadOf(response);
  return payload.error
    || response?.error
    || payload.message?.error
    || response?.message?.error
    || payload.data?.error
    || response?.data?.error
    || payload.result?.error
    || response?.result?.error
    || payload.result?.payload?.error
    || response?.result?.payload?.error;
}

function artifactOf(response) {
  const payload = payloadOf(response);
  return payload.artifact
    || response?.artifact
    || payload.data?.artifact
    || response?.data?.artifact
    || payload.result?.artifact
    || response?.result?.artifact
    || payload.result?.payload?.artifact
    || response?.result?.payload?.artifact;
}

function artifactError(response) {
  const error = responseError(response) || response?.message || payloadOf(response)?.message;
  if (error === undefined || error === null) return undefined;
  return typeof error === "string" ? error : JSON.stringify(error);
}

function findStringDeep(value, keys) {
  if (!value || typeof value !== "object") return undefined;
  for (const key of keys) {
    const item = value[key];
    if (typeof item === "string" && item.trim()) return item;
  }
  for (const item of Object.values(value)) {
    if (item && typeof item === "object") {
      const found = findStringDeep(item, keys);
      if (found) return found;
    }
  }
  return undefined;
}

function cleanBase64Data(value) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return undefined;
  return text.replace(/^data:[^;]+;base64,/, "");
}

function buildBrowserEvidenceArtifactInput({ sourcePath, planId, runId, status, startedAt, finishedAt, autoTesting, evidence, scope }) {
  const metadata = {
    source: "checkagent",
    scope: scope || "run",
    runId,
    suiteId: autoTesting?.suiteId,
    caseId: autoTesting?.caseId,
    planId,
    status,
    startedAt,
    finishedAt,
    evidenceType: "browser",
    sourcePath
  };
  const recordResponse = evidence?.recording?.stopResponse;
  const recordingUrl = findStringDeep(recordResponse, ["externalUrl", "external_url", "previewUrl", "preview_url", "url"]);
  const recordingPath = findStringDeep(recordResponse, ["sourcePath", "source_path", "filePath", "filepath", "path", "storagePath", "storage_path"]);
  const recordingBase64 = cleanBase64Data(findStringDeep(recordResponse, ["videoBase64", "video_base64", "video", "recording", "data", "content"]));

  if (recordingUrl) {
    return {
      type: "video",
      title: `Check Agent Browser Recording - ${planId} ${runId}`,
      description: `Browser recording for Check Agent ${scope === "suite" ? "suite" : "run"} ${planId}.`,
      externalUrl: recordingUrl,
      metadata: { ...metadata, evidenceKind: "video", source: "checkagent", recordingSource: "url" }
    };
  }

  if (recordingPath) {
    return {
      type: "video",
      title: `Check Agent Browser Recording - ${planId} ${runId}`,
      description: `Browser recording for Check Agent ${scope === "suite" ? "suite" : "run"} ${planId}.`,
      sourcePath: recordingPath,
      metadata: { ...metadata, evidenceKind: "video", recordingSource: "path", recordingPath }
    };
  }

  if (recordingBase64 && recordingBase64.length > 100) {
    return {
      type: "video",
      title: `Check Agent Browser Recording - ${planId} ${runId}`,
      description: `Browser recording for Check Agent ${scope === "suite" ? "suite" : "run"} ${planId}.`,
      files: [{ path: "recording.webm", content: recordingBase64, encoding: "base64" }],
      metadata: { ...metadata, evidenceKind: "video", recordingSource: "base64" }
    };
  }

  const screenshot = evidence?.screenshots?.[evidence.screenshots.length - 1];
  if (screenshot?.base64) {
    return {
      type: "image",
      title: `Check Agent Browser Snapshot - ${planId} ${runId}`,
      description: `Latest browser screenshot for Check Agent ${scope === "suite" ? "suite" : "run"} ${planId}.`,
      files: [{ path: "snapshot.png", content: screenshot.base64, encoding: "base64" }],
      metadata: { ...metadata, evidenceKind: "snapshot", snapshotPath: screenshot.path, stepId: screenshot.stepId }
    };
  }

  const snapshot = evidence?.snapshots?.[evidence.snapshots.length - 1];
  if (snapshot?.content) {
    return {
      type: "file",
      title: `Check Agent Browser Snapshot - ${planId} ${runId}`,
      description: `Latest browser snapshot for Check Agent ${scope === "suite" ? "suite" : "run"} ${planId}.`,
      files: [{ path: "snapshot.json", content: snapshot.content, encoding: "utf8" }],
      metadata: { ...metadata, evidenceKind: "snapshot", snapshotPath: snapshot.path, stepId: snapshot.stepId }
    };
  }

  return undefined;
}

async function createBrowserEvidenceArtifact({ sourcePath, planId, runId, autoTesting, status, startedAt, finishedAt, scope, evidence }) {
  const artifactInput = buildBrowserEvidenceArtifactInput({
    sourcePath,
    planId,
    runId,
    status,
    startedAt,
    finishedAt,
    autoTesting,
    evidence,
    scope
  });

  if (!artifactInput) {
    const error = "No browser video, screenshot, or snapshot evidence was captured for this test.";
    logStep("artifact-publish:no-browser-evidence", { sourcePath, runId, planId, scope, error });
    send(`Check Agent: browser evidence artifact was not created for ${planId}: ${error}`);
    return { success: false, sourcePath, evidenceKind: "none", error };
  }

  logStep("artifact-publish:start", { sourcePath, runId, planId, scope, type: artifactInput.type, evidenceKind: artifactInput.metadata?.evidenceKind });
  try {
    const response = await codebolt.artifact.create(artifactInput);
    const artifact = artifactOf(response);
    if (!artifact?.id) {
      const error = artifactError(response) || "Artifact creation response did not include an artifact id.";
      logStep("artifact-publish:missing-artifact", { runId, planId, error, response });
      send(`Check Agent: evidence artifact was not created for ${planId}: ${error}`);
      return { success: false, sourcePath, error };
    }

    const published = {
      success: true,
      artifactId: artifact.id,
      title: artifact.title,
      type: artifact.type || artifactInput.type,
      evidenceKind: artifactInput.metadata?.evidenceKind,
      previewUrl: artifact.previewUrl,
      externalUrl: artifact.externalUrl,
      sourcePath: artifactInput.sourcePath || sourcePath
    };
    logStep("artifact-publish:complete", published);
    send(`Check Agent: evidence artifact created for ${planId}: ${artifact.id}`);
    return published;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("artifact-publish:failed", { runId, planId, sourcePath, message });
    send(`Check Agent: evidence artifact creation failed for ${planId}: ${message}`);
    return { success: false, sourcePath, error: message };
  }
}

function extractRequestedSuiteId(reqMessage) {
  return firstString(reqMessage, ["testSuiteId", "suiteId"]);
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

async function updateAutoTestingRunStatus(autoTesting, status) {
  if (!autoTesting?.run?.id) return;
  await safeAutoTestingCall("autotesting:update-run-status", () => codebolt.autoTesting.updateRunStatus({
    runId: autoTesting.run.id,
    status
  }));
}

async function updateAutoTestingCaseStatus(autoTesting, status, userOverride) {
  if (!autoTesting?.run?.id || !autoTesting?.caseId) return;
  await safeAutoTestingCall("autotesting:update-run-case", () => codebolt.autoTesting.updateRunCaseStatus({
    runId: autoTesting.run.id,
    caseId: autoTesting.caseId,
    status,
    userOverride
  }));
}

async function updateAutoTestingStepStatus(autoTesting, stepId, status, logs, userOverride) {
  if (!autoTesting?.run?.id || !autoTesting?.caseId || !stepId) return;
  await safeAutoTestingCall("autotesting:update-run-step", () => codebolt.autoTesting.updateRunStepStatus({
    runId: autoTesting.run.id,
    caseId: autoTesting.caseId,
    stepId,
    status,
    logs,
    userOverride
  }));
}

async function runTestingPlan(inputPlan, options) {
  const startedAt = nowIso();
  const autoTesting = await createAutoTestingRun(inputPlan, options);
  const runId = autoTesting.run.id;
  logStep("run-plan:start", { runId, planId: inputPlan.metadata?.id });
  const { plan } = materializePlan(inputPlan, runId);
  const artifacts = await makeArtifacts(options.projectRoot, runId, options.artifactScope);
  const resultArtifacts = [artifacts.runDir];
  const trace = [];
  const llmTrace = [];
  const suggestedRefinements = [];
  const provider = createCodeboltWebProvider({ artifacts, resultArtifacts });

  await updateAutoTestingRunStatus(autoTesting, "running");
  send(`Check Agent: running ${plan.metadata.id} (${plan.flow.length} steps).`);

  async function finish(partial) {
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
      await updateAutoTestingStepStatus(autoTesting, partial.failedStep, "failed", partial.message);
      await updateAutoTestingCaseStatus(autoTesting, "failed");
    } else if (partial.status === "passed") {
      await updateAutoTestingCaseStatus(autoTesting, "passed");
    }
    await provider.cleanup();
    if (options.completeRunOnFinish !== false) {
      await updateAutoTestingRunStatus(autoTesting, "completed");
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
    return result;
  }

  try {
    if (plan.target.surface !== WEB_SURFACE) {
      logStep("run-plan:unsupported-surface", { surface: plan.target.surface });
      return finish({
        status: "failed",
        failedStep: plan.flow[0]?.id,
        failureClass: "environment",
        failureConfidence: 1,
        message: `This CodeBolt check agent currently implements the web provider only. Plan surface was ${plan.target.surface}.`
      });
    }

    for (const step of plan.flow) {
      logStep("step:start", { stepId: step.id, goal: step.goal, operationType: step.operation?.type });
      send(`Check Agent: step ${step.id} - ${step.goal || step.operation?.type || "operation"}`);
      await updateAutoTestingStepStatus(autoTesting, step.id, "running");
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
      await updateAutoTestingStepStatus(autoTesting, step.id, "passed", stepResult.message);
    }

    return finish({ status: "passed" });
  } catch (error) {
    await provider.cleanup();
    throw error;
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

  input.llmTrace.push({
    stepId: input.step.id,
    kind: "candidate_resolution",
    status: "unavailable",
    sourceCandidate: input.sourceCandidate,
    message: "LLM did not return a resolvedCandidate."
  });
  return [{ candidate: input.sourceCandidate }];
}

function createCodeboltWebProvider({ artifacts, resultArtifacts }) {
  let browserStarted = false;
  let browserInstanceId;
  const evidence = {
    recording: {
      started: false,
      startResponse: undefined,
      stopResponse: undefined
    },
    screenshots: [],
    snapshots: []
  };
  return {
    id: "codebolt-browser",
    evidence,

    async ensure(plan) {
      if (browserStarted) return;
      if (typeof codebolt.browser.openNewBrowserInstance === "function") {
        const opened = await codebolt.browser.openNewBrowserInstance({ setActive: true });
        browserInstanceId = opened?.instanceId;
      } else {
        await codebolt.browser.newPage();
      }
      browserStarted = true;
      const viewport = plan.target?.viewport;
      if (viewport?.width && viewport?.height && typeof codebolt.browser.setViewport === "function") {
        await safeCall(() => codebolt.browser.setViewport(viewport.width, viewport.height));
      }
      if (plan.target?.baseUrl) {
        await codebolt.browser.goToPage(plan.target.baseUrl);
      }
      if (typeof codebolt.browser.record === "function") {
        const recordStart = await safeCall(() => codebolt.browser.record("start", { intervalMs: 500, maxFrames: 600 }));
        if (recordStart) {
          evidence.recording.started = true;
          evidence.recording.startResponse = recordStart;
          logStep("browser-record:start", { instanceId: browserInstanceId });
        } else {
          logStep("browser-record:start-unavailable", { instanceId: browserInstanceId });
        }
      }
    },

    async observe({ plan, step }) {
      await this.ensure(plan);
      const [urlRes, markdownRes, textRes, htmlRes, actionableRes, snapshotRes] = await Promise.all([
        safeCall(() => codebolt.browser.getUrl()),
        safeCall(() => codebolt.browser.getMarkdown()),
        safeCall(() => codebolt.browser.extractText()),
        safeCall(() => codebolt.browser.getHTML()),
        safeCall(() => codebolt.browser.getActionableElements()),
        typeof codebolt.browser.getSnapShot === "function"
          ? safeCall(() => codebolt.browser.getSnapShot())
          : undefined
      ]);

      const url = firstString(urlRes, ["url", "currentUrl", "content"]);
      const markdown = firstString(markdownRes, ["markdown", "content", "text"]);
      const extractedText = firstString(textRes, ["text", "content"]);
      const html = firstString(htmlRes, ["html", "content"]);
      const visibleText = lines(extractedText || markdown || htmlToText(html));
      const elements = normalizeElements(actionableRes).concat(extractElementsFromHtml(html)).slice(0, 120);
      const title = extractTitle(html) || "";
      const htmlPath = html ? await artifacts.writeText(`${step.id}-${Date.now()}.html`, html) : undefined;
      const observation = {
        providerId: this.id,
        timestamp: nowIso(),
        url,
        summary: title,
        visibleText,
        data: {
          title,
          elements,
          markdown: markdown ? markdown.slice(0, 8000) : undefined
        },
        artifacts: htmlPath ? [{ kind: "snapshot", path: htmlPath, label: `${step.id} html` }] : []
      };

      const screenshot = await safeCall(() => codebolt.browser.screenshot({ fullPage: true, format: "png" }));
      const screenshotBase64 = firstString(screenshot, ["screenshot", "content", "data"]);
      if (screenshotBase64 && screenshotBase64.length > 100) {
        const cleanedScreenshot = cleanBase64Data(screenshotBase64);
        const screenshotPath = await artifacts.writeBase64(`${step.id}-${Date.now()}.png`, cleanedScreenshot);
        observation.artifacts.push({ kind: "screenshot", path: screenshotPath, label: step.id });
        resultArtifacts.push(screenshotPath);
        evidence.screenshots.push({
          stepId: step.id,
          path: screenshotPath,
          base64: cleanedScreenshot,
          timestamp: nowIso()
        });
      }
      if (snapshotRes) {
        const snapshotContent = JSON.stringify(payloadOf(snapshotRes), null, 2);
        const snapshotPath = await artifacts.writeText(`${step.id}-${Date.now()}-snapshot.json`, `${snapshotContent}\n`);
        observation.artifacts.push({ kind: "snapshot", path: snapshotPath, label: `${step.id} browser snapshot` });
        resultArtifacts.push(snapshotPath);
        evidence.snapshots.push({
          stepId: step.id,
          path: snapshotPath,
          content: snapshotContent,
          timestamp: nowIso()
        });
      }
      if (htmlPath) resultArtifacts.push(htmlPath);
      return observation;
    },

    async execute({ plan, step, candidate }) {
      await this.ensure(plan);
      const operation = step.operation || {};
      if (operation.type === "navigate") {
        const targetUrl = resolveNavigationUrl(plan, operation);
        await codebolt.browser.goToPage(targetUrl);
        await waitAfterAction(plan);
        return { status: "passed", message: `Navigated to ${targetUrl}`, observation: await this.observe({ plan, step, candidate }) };
      }

      if (operation.type === "wait") {
        await runWait(plan, operation);
        return { status: "passed", message: "Wait completed.", observation: await this.observe({ plan, step, candidate }) };
      }

      if (["assert", "observe"].includes(operation.type)) {
        return { status: "passed", message: "Observation-only step.", observation: await this.observe({ plan, step, candidate }) };
      }

      if (operation.type === "input") {
        const value = String(operation.value ?? "");
        const resolved = await resolveBrowserTarget(candidate);
        if (resolved.elementId) {
          await browserInput(resolved.elementId, value);
        } else if (resolved.locator) {
          await browserInputByLocator(resolved.locator, value);
        } else {
          throw new Error("Could not resolve input target.");
        }
        await waitAfterAction(plan);
        return { status: "passed", message: "Input completed.", observation: await this.observe({ plan, step, candidate }) };
      }

      if (operation.type === "interact") {
        const resolved = await resolveBrowserTarget(candidate);
        if (resolved.elementId) {
          await browserClick(resolved.elementId);
        } else if (resolved.locator) {
          const found = await findElementIdForLocator(resolved.locator);
          if (!found) {
            throw new Error("Resolved locator did not return a clickable element id.");
          }
          await browserClick(found);
        } else {
          throw new Error("Could not resolve interaction target.");
        }
        await waitAfterAction(plan);
        return { status: "passed", message: "Interaction completed.", observation: await this.observe({ plan, step, candidate }) };
      }

      throw new Error(`Unsupported web operation type: ${operation.type}`);
    },

    async cleanup() {
      if (!browserStarted) return;
      logStep("browser:cleanup:start", { instanceId: browserInstanceId });
      if (evidence.recording.started && typeof codebolt.browser.record === "function") {
        evidence.recording.stopResponse = await safeCall(() => codebolt.browser.record("stop"));
        logStep("browser-record:stop", { instanceId: browserInstanceId, stopped: Boolean(evidence.recording.stopResponse) });
      }
      const closed = browserInstanceId && typeof codebolt.browser.closeBrowserInstance === "function"
        ? await safeCall(() => codebolt.browser.closeBrowserInstance(browserInstanceId))
        : undefined;
      if (!closed && typeof codebolt.browser.close === "function") {
        if (browserInstanceId) {
          await safeCall(() => codebolt.browser.close({ instanceId: browserInstanceId }));
        } else {
          await safeCall(() => codebolt.browser.close());
        }
      }
      browserStarted = false;
      browserInstanceId = undefined;
      logStep("browser:cleanup:complete");
    }
  };
}

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

function resolveNavigationUrl(plan, operation) {
  const target = operation.target || {};
  const raw = target.url || target.href || target.routeHint || target.route || plan.target?.baseUrl;
  if (!raw) throw new Error("Navigate operation requires a target url or target.baseUrl.");
  if (/^(https?:|file:|data:|about:)/i.test(String(raw))) return String(raw);
  if (!plan.target?.baseUrl) throw new Error(`Relative route needs target.baseUrl: ${raw}`);
  return new URL(String(raw), plan.target.baseUrl).toString();
}

async function runWait(plan, operation) {
  const target = operation.target || {};
  if (target.visibleText) {
    await codebolt.browser.wait({ text: String(target.visibleText), timeout: plan.target?.timeoutMs || 10000 });
    return;
  }
  if (target.timeoutMs) {
    await delay(Number(target.timeoutMs));
    return;
  }
  await delay(500);
}

async function waitAfterAction(plan) {
  await delay(Math.min(Number(plan.target?.settleMs || 350), 2000));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveBrowserTarget(candidate) {
  const locator = candidateToLocator(candidate);
  const direct = directElementId(candidate);
  if (direct) return { elementId: direct, locator };
  if (!locator) return {};
  const findInput = locatorToFind(locator);
  if (findInput) {
    const found = await safeCall(() => codebolt.browser.find(findInput.kind, findInput.value, { exact: findInput.exact !== false }));
    const elementId = extractElementId(found);
    if (elementId) return { elementId, locator };
  }
  return { locator };
}

async function browserInput(elementId, value) {
  if (typeof codebolt.browser.inputText === "function") {
    return codebolt.browser.inputText(elementId, value);
  }
  return codebolt.browser.type(elementId, value);
}

async function browserInputByLocator(locator, value) {
  const elementId = await findElementIdForLocator(locator);
  if (elementId) {
    return browserInput(elementId, value);
  }
  if (typeof codebolt.browser.focus === "function" && typeof codebolt.browser.sendKeys === "function") {
    await codebolt.browser.focus(locator);
    return codebolt.browser.sendKeys(value);
  }
  throw new Error("Resolved locator did not return an input element id.");
}

async function browserClick(elementId) {
  if (typeof codebolt.browser.clickElement === "function") {
    return codebolt.browser.clickElement(elementId);
  }
  return codebolt.browser.click(elementId);
}

async function findElementIdForLocator(locator) {
  const findInput = locatorToFind(locator);
  if (!findInput) return undefined;
  const found = await safeCall(() => codebolt.browser.find(findInput.kind, findInput.value, { exact: findInput.exact !== false }));
  return extractElementId(found);
}

function directElementId(candidate) {
  const exact = flattenSurface(candidate?.exact);
  return firstDefined(exact?.elementId, exact?.elementid, exact?.ref);
}

function candidateToLocator(candidate) {
  if (!candidate) return undefined;
  const exact = flattenSurface(candidate.exact);
  const exactLocator = targetToLocator(exact);
  if (exactLocator) return exactLocator;
  const structural = flattenSurface(candidate.structural);
  const structuralLocator = targetToLocator(structural);
  if (structuralLocator) return structuralLocator;
  const hint = candidate.providerHint || {};
  if (hint.kind && hint.value) return { kind: hint.kind, value: String(hint.value), exact: hint.exact !== false };
  if (hint.selector) return String(hint.selector);
  return undefined;
}

function targetToLocator(target) {
  if (!target || typeof target !== "object") return undefined;
  if (target.stableId) return { kind: "testid", value: String(target.stableId), exact: true };
  if (target.testId) return { kind: "testid", value: String(target.testId), exact: true };
  if (target.id) return { kind: "id", value: String(target.id), exact: true };
  if (target.selector) return String(target.selector);
  if (target.label) return { kind: "label", value: String(target.label), exact: true };
  if (target.placeholder) return { kind: "placeholder", value: String(target.placeholder), exact: true };
  if (target.text) return { kind: "text", value: matcherFirstText(target.text), exact: false };
  if (target.name) return { kind: "text", value: matcherFirstText(target.name), exact: false };
  if (target.role && target.name) return { kind: "text", value: matcherFirstText(target.name), exact: false };
  return undefined;
}

function locatorToFind(locator) {
  if (!locator) return undefined;
  if (typeof locator === "string") return { kind: "css", value: locator, exact: true };
  if (!locator.value) return undefined;
  return {
    kind: locator.kind || locator.type || "text",
    value: String(locator.value),
    exact: locator.exact
  };
}

function flattenSurface(value) {
  if (!value || typeof value !== "object") return undefined;
  const web = value.web && typeof value.web === "object" ? value.web : {};
  return { ...web, ...value };
}

function extractElementId(value) {
  if (!value) return undefined;
  if (typeof value === "string") {
    const match = value.match(/@e\d+|[A-Za-z0-9_-]+/);
    return match ? match[0] : undefined;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractElementId(item);
      if (found) return found;
    }
    return undefined;
  }
  if (typeof value === "object") {
    for (const key of ["elementId", "elementid", "id", "ref", "nodeId", "targetId"]) {
      if (typeof value[key] === "string" || typeof value[key] === "number") {
        return String(value[key]);
      }
    }
    for (const key of ["data", "payload", "element", "elements", "result", "matches"]) {
      const found = extractElementId(value[key]);
      if (found) return found;
    }
  }
  return undefined;
}

function normalizeElements(actionableResponse) {
  const raw = firstDefined(
    actionableResponse?.elements,
    actionableResponse?.data?.elements,
    actionableResponse?.payload?.elements,
    actionableResponse?.result?.elements,
    actionableResponse?.content
  );
  if (!raw) return [];
  const parsed = typeof raw === "string" ? parseJsonObject(raw) || raw : raw;
  if (Array.isArray(parsed)) return parsed.map(normalizeElement).filter(Boolean);
  if (typeof parsed === "object" && Array.isArray(parsed.elements)) {
    return parsed.elements.map(normalizeElement).filter(Boolean);
  }
  return [];
}

function normalizeElement(element) {
  if (!element || typeof element !== "object") return undefined;
  return {
    tag: element.tag || element.tagName || element.type,
    text: element.text || element.name || element.label || element.innerText,
    id: element.id || element.elementId || element.ref,
    testId: element.testId || element["data-testid"],
    ariaLabel: element.ariaLabel || element["aria-label"],
    placeholder: element.placeholder,
    role: element.role
  };
}

function extractElementsFromHtml(html) {
  if (!html) return [];
  const elements = [];
  const tagRegex = /<(input|textarea|select|button|a|label)\b([^>]*)>([\s\S]*?)<\/\1>|<(input)\b([^>]*)\/?>/gi;
  let match;
  while ((match = tagRegex.exec(html)) && elements.length < 100) {
    const tag = (match[1] || match[4] || "").toLowerCase();
    const attrs = parseAttrs(match[2] || match[5] || "");
    const text = htmlToText(match[3] || "");
    elements.push({
      tag,
      text,
      id: attrs.id,
      name: attrs.name,
      testId: attrs["data-testid"],
      ariaLabel: attrs["aria-label"],
      placeholder: attrs.placeholder,
      role: attrs.role
    });
  }
  return elements;
}

function parseAttrs(source) {
  const attrs = {};
  const regex = /([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>/]+)))?/g;
  let match;
  while ((match = regex.exec(source || ""))) {
    attrs[match[1]] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attrs;
}

function extractTitle(html) {
  return html?.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
}

function htmlToText(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function lines(text) {
  return String(text || "")
    .split(/\r?\n|(?<=\.)\s+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 200);
}

function matcherTextOptions(value) {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value.anyOf)) return value.anyOf.filter((item) => typeof item === "string");
  if (typeof value.contains === "string") return [value.contains];
  if (typeof value.equals === "string") return [value.equals];
  return [];
}

function matcherFirstText(value) {
  return matcherTextOptions(value)[0] || (typeof value === "string" ? value : undefined);
}

function compactObservation(observation) {
  if (!observation) return undefined;
  return {
    providerId: observation.providerId,
    url: observation.url,
    summary: observation.summary,
    visibleText: (observation.visibleText || []).slice(0, 80),
    data: {
      title: observation.data?.title,
      elements: (observation.data?.elements || []).slice(0, 80),
      markdown: observation.data?.markdown ? String(observation.data.markdown).slice(0, 4000) : undefined
    }
  };
}

function collectArtifactPaths(observation) {
  return (observation?.artifacts || []).map((artifact) => artifact.path).filter(Boolean);
}

async function safeCall(fn) {
  try {
    return await fn();
  } catch {
    return undefined;
  }
}

function firstString(object, keys) {
  if (!object) return undefined;
  if (typeof object === "string") return object;
  for (const key of keys) {
    const value = object[key];
    if (typeof value === "string") return value;
  }
  for (const key of ["data", "payload", "message", "response"]) {
    const nested = object[key];
    const found = firstString(nested, keys);
    if (found) return found;
  }
  return undefined;
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function responseTruthy(value) {
  if (value === true) return true;
  if (!value) return false;
  if (value.success === false) return false;
  if (typeof value.visible === "boolean") return value.visible;
  if (typeof value.checked === "boolean") return value.checked;
  if (typeof value.enabled === "boolean") return value.enabled;
  if (typeof value.value === "boolean") return value.value;
  if (value.data) return responseTruthy(value.data);
  if (value.payload) return responseTruthy(value.payload);
  return Boolean(value.success);
}

function numberOr(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

codebolt.onMessage(async (reqMessage) => {
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
      await updateAutoTestingRunStatus(suiteAutoTesting, "running");
    }

    for (let index = 0; index < loadedPlans.length; index += 1) {
      const loaded = loadedPlans[index];
      send(`Check Agent: running plan ${index + 1}/${loadedPlans.length} from ${loaded.source}.`);
      const autoTesting = suiteAutoTesting
        ? { suiteId: suiteAutoTesting.suiteId, caseId: loaded.caseId, run: suiteAutoTesting.run }
        : undefined;
      const result = await runTestingPlan(loaded.plan, {
        projectRoot,
        requestMessage: reqMessage,
        suiteId: loaded.suiteId,
        caseId: loaded.caseId,
        autoTesting,
        artifactScope: suiteAutoTesting ? loaded.caseId : undefined,
        completeRunOnFinish: !suiteAutoTesting,
        publishArtifact: true
      });
      const resultPath = path.join(result.artifacts?.[0] || path.join(projectRoot, RESULT_DIR, "runs", result.runId), "result.json");
      results.push({ ...result, source: loaded.source, caseId: loaded.caseId, resultPath });
      if (result.status === "passed") {
        send(`Check Agent: passed ${loaded.plan.metadata.id}. Result: ${resultPath}`);
      } else {
        send(`Check Agent: failed ${loaded.plan.metadata.id} at ${result.failedStep}. Class: ${result.failureClass}. Result: ${resultPath}`);
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
      await updateAutoTestingRunStatus(suiteAutoTesting, "completed");
      const suiteRunDir = path.join(projectRoot, RESULT_DIR, "runs", suiteAutoTesting.run.id);
      await writeCodeboltFile(
        suiteRunDir,
        "suite-result.json",
        `${JSON.stringify(summary, null, 2)}\n`
      );
    }
    send(`Check Agent: suite complete. Passed ${summary.passed}/${summary.total}, failed ${summary.failed}/${summary.total}.`);
    return JSON.stringify(summary, null, 2);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    send(`Check Agent: error - ${message}`);
    return message;
  }
});
