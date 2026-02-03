/**
 * Telemetry Integration Tests
 *
 * Tests for automatic logging and telemetry features.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Multillm from '../index';
import fs from 'fs';

describe('Telemetry Integration Tests', () => {
  const apiKey = process.env.OPENAI_API_KEY;
  let llm: any;
  let logFilePath: string;

  if (!apiKey) {
    it.skip('skipped - OPENAI_API_KEY not set', () => {});
    return;
  }

  beforeEach(() => {
    logFilePath = './test-telemetry.ndjson';
    
    // Remove existing log file
    if (fs.existsSync(logFilePath)) {
      fs.unlinkSync(logFilePath);
    }

    llm = new Multillm('openai', 'gpt-4o', null, apiKey, null, {
      telemetry: {
        enabled: true,
        filePath: logFilePath,
        consoleLog: false,
        recordInputs: true,
        recordOutputs: true
      }
    });
  });

  afterEach(() => {
    // Clean up log file
    if (fs.existsSync(logFilePath)) {
      fs.unlinkSync(logFilePath);
    }
  });

  it('should log completion to file', async () => {
    await llm.createCompletion({
      messages: [{ role: 'user', content: 'Hello!' }]
    });

    expect(fs.existsSync(logFilePath)).toBe(true);

    const logContent = fs.readFileSync(logFilePath, 'utf-8');
    const logEntries = logContent.trim().split('\n').filter(line => line.trim());

    expect(logEntries.length).toBeGreaterThan(0);

    const lastEntry = JSON.parse(logEntries[logEntries.length - 1]);
    expect(lastEntry.operation).toBe('chat');
    expect(lastEntry.provider).toBe('openai');
    expect(lastEntry.model).toBe('gpt-4o');
    expect(lastEntry.status).toBe('OK');
  });

  it('should track token usage', async () => {
    await llm.createCompletion({
      messages: [{ role: 'user', content: 'Test' }]
    });

    const logContent = fs.readFileSync(logFilePath, 'utf-8');
    const lastEntry = JSON.parse(logContent.trim().split('\n').pop());

    expect(lastEntry.usage).toBeDefined();
    expect(lastEntry.usage.inputTokens).toBeGreaterThan(0);
    expect(lastEntry.usage.outputTokens).toBeGreaterThan(0);
    expect(lastEntry.usage.totalTokens).toBeGreaterThan(0);
  });

  it('should record inputs when enabled', async () => {
    await llm.createCompletion({
      messages: [{ role: 'user', content: 'Record this input' }]
    });

    const logContent = fs.readFileSync(logFilePath, 'utf-8');
    const lastEntry = JSON.parse(logContent.trim().split('\n').pop());

    expect(lastEntry.input).toContain('Record this input');
  });

  it('should record outputs when enabled', async () => {
    const response = await llm.createCompletion({
      messages: [{ role: 'user', content: 'Generate response' }]
    });

    const logContent = fs.readFileSync(logFilePath, 'utf-8');
    const lastEntry = JSON.parse(logContent.trim().split('\n').pop());

    expect(lastEntry.output).toBe(response.choices[0].message.content);
  });

  it('should track errors', async () => {
    const badLlm = new Multillm('openai', 'gpt-4o', null, 'invalid-api-key', null, {
      telemetry: {
        enabled: true,
        filePath: logFilePath
      }
    });

    try {
      await badLlm.createCompletion({
        messages: [{ role: 'user', content: 'Test' }]
      });
    } catch (error) {
      const logContent = fs.readFileSync(logFilePath, 'utf-8');
      const lastEntry = JSON.parse(logContent.trim().split('\n').pop());

      expect(lastEntry.status).toBe('ERROR');
      expect(lastEntry.error).toBeDefined();
    }
  });

  it('should log multiple operations', async () => {
    await llm.createCompletion({ messages: [{ role: 'user', content: 'Op1' }] });
    await llm.createCompletion({ messages: [{ role: 'user', content: 'Op2' }] });
    await llm.createCompletion({ messages: [{ role: 'user', content: 'Op3' }] });

    const logContent = fs.readFileSync(logFilePath, 'utf-8');
    const logEntries = logContent.trim().split('\n').filter(line => line.trim());

    expect(logEntries.length).toBe(3);
  });

  it('should include custom metadata', async () => {
    const llmWithMetadata = new Multillm('openai', 'gpt-4o', null, apiKey, null, {
      telemetry: {
        enabled: true,
        filePath: logFilePath,
        serviceName: 'test-app',
        serviceVersion: '1.0.0',
        metadata: {
          environment: 'test',
          feature: 'chat'
        }
      }
    });

    await llmWithMetadata.createCompletion({
      messages: [{ role: 'user', content: 'Test' }]
    });

    const logContent = fs.readFileSync(logFilePath, 'utf-8');
    const lastEntry = JSON.parse(logContent.trim().split('\n').pop());

    expect(lastEntry['service.name']).toBe('test-app');
    expect(lastEntry['service.version']).toBe('1.0.0');
    expect(lastEntry.environment).toBe('test');
    expect(lastEntry.feature).toBe('chat');
  });

  it('should support disabling telemetry', async () => {
    const llmNoTelemetry = new Multillm('openai', 'gpt-4o', null, apiKey, null, {
      telemetry: {
        enabled: false,
        filePath: logFilePath
      }
    });

    await llmNoTelemetry.createCompletion({
      messages: [{ role: 'user', content: 'Test' }]
    });

    // File should not exist (telemetry disabled)
    expect(fs.existsSync(logFilePath)).toBe(false);
  });

  it('should track reasoning tokens', async () => {
    const o1Llm = new Multillm('openai', 'o1', null, apiKey, null, {
      telemetry: {
        enabled: true,
        filePath: logFilePath
      }
    });

    await o1Llm.createCompletion({
      messages: [{ role: 'user', content: 'Solve: 1 + 1' }]
    });

    const logContent = fs.readFileSync(logFilePath, 'utf-8');
    const lastEntry = JSON.parse(logContent.trim().split('\n').pop());

    expect(lastEntry.usage).toBeDefined();
    expect(lastEntry.usage.reasoningTokens).toBeGreaterThan(0);
  });

  it('should track cached tokens', async () => {
    const anthropicLlm = new Multillm('anthropic', 'claude-3-5-sonnet-20241022', null, process.env.ANTHROPIC_API_KEY, null, {
      telemetry: {
        enabled: true,
        filePath: logFilePath
      }
    });

    await anthropicLlm.createCompletion({
      messages: [
        { role: 'system', content: 'You are an expert' },
        { role: 'user', content: 'Question' }
      ],
      enableCaching: true
    });

    const logContent = fs.readFileSync(logFilePath, 'utf-8');
    const lastEntry = JSON.parse(logContent.trim().split('\n').pop());

    expect(lastEntry.usage).toBeDefined();
    expect(lastEntry.usage.cacheCreationTokens).toBeGreaterThan(0);
  });
});
