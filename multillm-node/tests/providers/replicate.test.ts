/**
 * Replicate Provider Integration Tests
 *
 * Tests for Replicate features.
 * Requires REPLICATE_API_TOKEN in environment variables.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Multillm from '../index';

describe('Replicate Provider Integration Tests', () => {
  const apiKey = process.env.REPLICATE_API_TOKEN;
  let llm: any;

  if (!apiKey) {
    it.skip('skipped - REPLICATE_API_TOKEN not set', () => {});
    return;
  }

  describe('Image Generation', () => {
    beforeEach(() => {
      llm = new Multillm('replicate', null, null, apiKey);
    });

    it('should generate image', async () => {
      const response = await llm.createImage({
        prompt: 'A futuristic robot',
        model: 'stabilityai/sdxl'
      });

      expect(response.data).toBeDefined();
      expect(response.data[0].url).toBeDefined();
    });

    it('should support different models', async () => {
      const models = ['stabilityai/sdxl', 'black-forest-labs/flux'];

      for (const model of models) {
        const response = await llm.createImage({
          prompt: 'Test image',
          model
        });

        expect(response.data[0].url).toBeDefined();
      }
    });

    it('should support base64 format', async () => {
      const response = await llm.createImage({
        prompt: 'A red circle',
        model: 'stabilityai/sdxl',
        response_format: 'b64_json'
      });

      expect(response.data[0].b64_json).toBeDefined();
    });
  });

  describe('Get Capabilities', () => {
    beforeEach(() => {
      llm = new Multillm('replicate', null, null, apiKey);
    });

    it('should return correct capabilities', () => {
      const caps = llm.getCapabilities();

      expect(caps.supportsStreaming).toBe(false);
      expect(caps.supportsTools).toBe(false);
      expect(caps.supportsVision).toBe(false);
      expect(caps.supportsEmbeddings).toBe(false);
      expect(caps.supportsCaching).toBe(false);
      expect(caps.supportsReasoning).toBe(false);
      expect(caps.supportsImageGeneration).toBe(true);
      expect(caps.supportsMultimodal).toBe(false);
    });
  });
});
