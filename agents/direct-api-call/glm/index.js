#!/usr/bin/env node
'use strict';

const DEFAULT_API_URL = 'https://api.z.ai/api/coding/paas/v4/chat/completions';
const DEFAULT_MODEL = 'glm-5.2';

function readNumberEnv(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${name} must be a number, received: ${value}`);
  }

  return parsed;
}

function readIntegerEnv(name) {
  const value = process.env[name];
  if (value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) {
    throw new Error(`${name} must be an integer, received: ${value}`);
  }

  return parsed;
}

function printUsage() {
  console.error([
    'Missing ZAI_API_KEY.',
    '',
    'Usage:',
    '  ZAI_API_KEY=your_key node agents/direct-api-call/call-glm.js "Write a haiku about APIs"',
    '',
    'Optional environment variables:',
    `  ZAI_API_URL       Defaults to ${DEFAULT_API_URL}`,
    `  ZAI_MODEL         Defaults to ${DEFAULT_MODEL}`,
    '  SYSTEM_PROMPT     Defaults to "You are a helpful coding assistant."',
    '  TEMPERATURE       Defaults to 1',
    '  MAX_TOKENS        Optional integer output limit',
    '  ZAI_THINKING      Optional: enabled or disabled',
    '  SHOW_REASONING    Set to 1 to print reasoning_content when returned',
  ].join('\n'));
}

async function callGlm(prompt) {
  const apiKey = "" //process.env.ZAI_API_KEY;
  if (!apiKey) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const maxTokens = readIntegerEnv('MAX_TOKENS');
  const body = {
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful coding assistant.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    stream: false,
  };

  if (maxTokens !== undefined) {
    body.max_tokens = maxTokens;
  }

  if (process.env.ZAI_THINKING) {
    body.thinking = { type: process.env.ZAI_THINKING };
  }

  const response = await fetch(process.env.ZAI_API_URL || DEFAULT_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept-Language': 'en-US,en',
    },
    body: JSON.stringify(body),
  });

  const rawResponse = await response.text();
  let data;
  try {
    data = JSON.parse(rawResponse);
  } catch {
    data = rawResponse;
  }

  if (!response.ok) {
    console.error(`GLM request failed with HTTP ${response.status}`);
    console.error(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    process.exitCode = 1;
    return;
  }

  const message = data?.choices?.[0]?.message;
  if (!message) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (process.env.SHOW_REASONING === '1' && message.reasoning_content) {
    console.error('\nReasoning:\n');
    console.error(message.reasoning_content);
    console.error('\nAnswer:\n');
  }

  console.log(message.content || '');

  if (data.usage) {
    console.error('\nUsage:', JSON.stringify(data.usage));
  }
}

const prompt = 'Hello, please introduce yourself in one short paragraph.';

callGlm(prompt).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
