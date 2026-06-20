const {
  codebolt,
  send,
  logStep,
  payloadOf,
  responseError,
  cleanBase64Data
} = require("./runtime");

class InMemoryRunArtifacts {
  constructor(runId, artifactScope) {
    this.runId = runId;
    this.artifactScope = artifactScope;
    this.runDir = artifactScope
      ? `autotesting://${runId}/${artifactScope}`
      : `autotesting://${runId}`;
    this.entries = new Map();
  }

  pathFor(name) {
    return `${this.runDir}/${name}`;
  }

  async writeJson(name, value) {
    this.entries.set(name, JSON.stringify(value, null, 2));
    return this.pathFor(name);
  }

  async appendJsonl(name, value) {
    const existing = this.entries.get(name) || "";
    this.entries.set(name, `${existing}${JSON.stringify(value)}\n`);
    return this.pathFor(name);
  }

  async writeText(name, value) {
    this.entries.set(name, String(value || ""));
    return this.pathFor(name);
  }

  async writeBase64(name, base64) {
    const cleaned = String(base64).replace(/^data:image\/\w+;base64,/, "");
    const artifactName = name.replace(/\.[^.]+$/, ".base64.txt");
    this.entries.set(artifactName, cleaned);
    return this.pathFor(artifactName);
  }

  getText(name) {
    return this.entries.get(name);
  }
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

module.exports = {
  InMemoryRunArtifacts,
  createBrowserEvidenceArtifact
};
