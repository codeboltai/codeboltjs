const {
  codebolt,
  firstDefined,
  safeCall,
  delay
} = require("./runtime");

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
  const parsed = typeof raw === "string" ? safeParseJson(raw) || raw : raw;
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

function safeParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

module.exports = {
  resolveNavigationUrl,
  runWait,
  waitAfterAction,
  resolveBrowserTarget,
  browserInput,
  browserInputByLocator,
  browserClick,
  findElementIdForLocator,
  targetToLocator,
  normalizeElements,
  extractElementsFromHtml,
  extractTitle,
  htmlToText,
  lines,
  matcherTextOptions
};
