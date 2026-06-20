process.env.WS_NO_BUFFER_UTIL = "1";
process.env.WS_NO_UTF_8_VALIDATE = "1";
process.env.CODEBOLT_URL = process.env.CODEBOLT_URL || "ws://localhost:3000/codebolt";
process.env.CODEBOLT_ID = process.env.CODEBOLT_ID || "checkagent";

const codebolt = require("@codebolt/codeboltjs");

const PLAN_KIND = "TestingPlan";
const WEB_SURFACE = "web";

function send(message, payload) {
  try {
    codebolt.chat.sendMessage(message, payload);
  } catch {
    console.log(message, payload || "");
  }
}

function resultFailureReason(result) {
  return String(result?.message || result?.error || "").trim();
}

function formatFailedResultLine(result) {
  const planId = result?.planId || result?.metadata?.id || "unknown plan";
  const caseText = result?.caseId ? ` case ${result.caseId}` : "";
  const stepText = result?.failedStep ? ` at ${result.failedStep}` : "";
  const classText = result?.failureClass ? ` [${result.failureClass}]` : "";
  const reason = resultFailureReason(result);
  return `- ${planId}${caseText}${stepText}${classText}${reason ? `: ${reason}` : ""}`;
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

function cleanBase64Data(value) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return undefined;
  return text.replace(/^data:[^;]+;base64,/, "");
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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  codebolt,
  PLAN_KIND,
  WEB_SURFACE,
  send,
  resultFailureReason,
  formatFailedResultLine,
  logStep,
  nowIso,
  parseJsonObject,
  payloadOf,
  runOf,
  responseError,
  cleanBase64Data,
  safeCall,
  firstString,
  firstDefined,
  responseTruthy,
  numberOr,
  delay
};
