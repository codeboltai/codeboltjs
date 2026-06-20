const {
  codebolt,
  nowIso,
  logStep,
  firstString,
  payloadOf,
  cleanBase64Data,
  safeCall
} = require("./runtime");
const {
  resolveNavigationUrl,
  runWait,
  waitAfterAction,
  resolveBrowserTarget,
  browserInput,
  browserInputByLocator,
  browserClick,
  findElementIdForLocator,
  normalizeElements,
  extractElementsFromHtml,
  extractTitle,
  htmlToText,
  lines
} = require("./browser-targets");

class CodeboltWebProvider {
  constructor({ artifacts, resultArtifacts }) {
    this.id = "codebolt-browser";
    this.artifacts = artifacts;
    this.resultArtifacts = resultArtifacts;
    this.browserStarted = false;
    this.browserInstanceId = undefined;
    this.evidence = {
      recording: {
        started: false,
        startResponse: undefined,
        stopResponse: undefined
      },
      screenshots: [],
      snapshots: []
    };
  }

  async ensure(plan) {
    if (this.browserStarted) return;
    if (typeof codebolt.browser.openNewBrowserInstance === "function") {
      const opened = await codebolt.browser.openNewBrowserInstance({ setActive: true });
      this.browserInstanceId = opened?.instanceId;
    } else {
      await codebolt.browser.newPage();
    }
    this.browserStarted = true;
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
        this.evidence.recording.started = true;
        this.evidence.recording.startResponse = recordStart;
        logStep("browser-record:start", { instanceId: this.browserInstanceId });
      } else {
        logStep("browser-record:start-unavailable", { instanceId: this.browserInstanceId });
      }
    }
  }

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
    const htmlPath = html ? await this.artifacts.writeText(`${step.id}-${Date.now()}.html`, html) : undefined;
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
      const screenshotPath = await this.artifacts.writeBase64(`${step.id}-${Date.now()}.png`, cleanedScreenshot);
      observation.artifacts.push({ kind: "screenshot", path: screenshotPath, label: step.id });
      this.resultArtifacts.push(screenshotPath);
      this.evidence.screenshots.push({
        stepId: step.id,
        path: screenshotPath,
        base64: cleanedScreenshot,
        timestamp: nowIso()
      });
    }
    if (snapshotRes) {
      const snapshotContent = JSON.stringify(payloadOf(snapshotRes), null, 2);
      const snapshotPath = await this.artifacts.writeText(`${step.id}-${Date.now()}-snapshot.json`, `${snapshotContent}\n`);
      observation.artifacts.push({ kind: "snapshot", path: snapshotPath, label: `${step.id} browser snapshot` });
      this.resultArtifacts.push(snapshotPath);
      this.evidence.snapshots.push({
        stepId: step.id,
        path: snapshotPath,
        content: snapshotContent,
        timestamp: nowIso()
      });
    }
    if (htmlPath) this.resultArtifacts.push(htmlPath);
    return observation;
  }

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
  }

  async cleanup() {
    if (!this.browserStarted) return;
    logStep("browser:cleanup:start", { instanceId: this.browserInstanceId });
    if (this.evidence.recording.started && typeof codebolt.browser.record === "function") {
      this.evidence.recording.stopResponse = await safeCall(() => codebolt.browser.record("stop"));
      logStep("browser-record:stop", { instanceId: this.browserInstanceId, stopped: Boolean(this.evidence.recording.stopResponse) });
    }
    const closed = this.browserInstanceId && typeof codebolt.browser.closeBrowserInstance === "function"
      ? await safeCall(() => codebolt.browser.closeBrowserInstance(this.browserInstanceId))
      : undefined;
    if (!closed && typeof codebolt.browser.close === "function") {
      if (this.browserInstanceId) {
        await safeCall(() => codebolt.browser.close({ instanceId: this.browserInstanceId }));
      } else {
        await safeCall(() => codebolt.browser.close());
      }
    }
    this.browserStarted = false;
    this.browserInstanceId = undefined;
    logStep("browser:cleanup:complete");
  }
}

module.exports = {
  CodeboltWebProvider
};
