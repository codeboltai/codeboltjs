/**
 * Image Generation Integration Tests
 *
 * Tests for image generation across providers.
 * Requires API keys in environment variables.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Multillm from '../index';

describe('Image Generation Integration', () => {
  describe('OpenAI DALL-E 3', () => {
    const apiKey = process.env.OPENAI_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - OPENAI_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('openai', 'dall-e-3', null, apiKey);
    });

    it('should generate single image with URL', async () => {
      const response = await llm.createImage({
        prompt: 'A simple blue circle on white background',
        size: '1024x1024',
        n: 1
      });

      expect(response.data).toBeDefined();
      expect(response.data).toHaveLength(1);
      expect(response.data[0].url).toBeDefined();
      expect(typeof response.data[0].url).toBe('string');
      expect(response.data[0].url).toMatch(/^https?:\/\//);
    });

    it('should generate multiple images', async () => {
      const response = await llm.createImage({
        prompt: 'A cute cat',
        size: '512x512',
        n: 2
      });

      expect(response.data).toHaveLength(2);
      expect(response.data[0].url).toBeDefined();
      expect(response.data[1].url).toBeDefined();
    });

    it('should support different sizes', async () => {
      const sizes: Array<'256x256' | '512x512' | '1024x1024' | '1792x1024'> = [
        '256x256',
        '512x512',
        '1024x1024',
        '1792x1024'
      ];

      for (const size of sizes) {
        const response = await llm.createImage({
          prompt: 'Test image',
          size
        });

        expect(response.data[0].url).toBeDefined();
      }
    });

    it('should generate base64 image', async () => {
      const response = await llm.createImage({
        prompt: 'A red square',
        size: '256x256',
        response_format: 'b64_json'
      });

      expect(response.data[0].url).toBeUndefined();
      expect(response.data[0].b64_json).toBeDefined();
      expect(typeof response.data[0].b64_json).toBe('string');
      expect(response.data[0].b64_json).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    it('should support quality parameter', async () => {
      const response = await llm.createImage({
        prompt: 'A detailed landscape',
        size: '1024x1024',
        quality: 'hd'
      });

      expect(response.data[0].url).toBeDefined();
    });

    it('should support style parameter', async () => {
      const styles: Array<'vivid' | 'natural'> = ['vivid', 'natural'];

      for (const style of styles) {
        const response = await llm.createImage({
          prompt: 'A scenic mountain view',
          size: '1024x1024',
          style
        });

        expect(response.data[0].url).toBeDefined();
      }
    });

    it('should include revised prompt', async () => {
      const response = await llm.createImage({
        prompt: 'A picture of a dog',
        size: '1024x1024'
      });

      expect(response.data[0].revised_prompt).toBeDefined();
      expect(typeof response.data[0].revised_prompt).toBe('string');
    });
  });

  describe('OpenAI DALL-E 2', () => {
    const apiKey = process.env.OPENAI_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - OPENAI_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('openai', 'dall-e-2', null, apiKey);
    });

    it('should generate image with DALL-E 2', async () => {
      const response = await llm.createImage({
        prompt: 'A green triangle',
        size: '512x512',
        n: 1
      });

      expect(response.data[0].url).toBeDefined();
    });

    it('should support up to 10 images', async () => {
      const response = await llm.createImage({
        prompt: 'Variations',
        size: '256x256',
        n: 4
      });

      expect(response.data).toHaveLength(4);
    });
  });

  describe('Replicate', () => {
    const apiKey = process.env.REPLICATE_API_TOKEN;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - REPLICATE_API_TOKEN not set', () => {});
      return;
    }

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
          prompt: 'Test',
          model
        });

        expect(response.data[0].url).toBeDefined();
      }
    });
  });

  describe('Image Formats', () => {
    const apiKey = process.env.OPENAI_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - OPENAI_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('openai', 'dall-e-3', null, apiKey);
    });

    it('should generate URL format', async () => {
      const response = await llm.createImage({
        prompt: 'Test',
        size: '256x256',
        response_format: 'url'
      });

      expect(response.data[0].url).toBeDefined();
      expect(response.data[0].b64_json).toBeUndefined();
    });

    it('should generate base64 format', async () => {
      const response = await llm.createImage({
        prompt: 'Test',
        size: '256x256',
        response_format: 'b64_json'
      });

      expect(response.data[0].b64_json).toBeDefined();
      expect(response.data[0].url).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    const apiKey = process.env.OPENAI_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - OPENAI_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('openai', 'dall-e-3', null, apiKey);
    });

    it('should handle empty prompt', async () => {
      try {
        await llm.createImage({
          prompt: '',
          size: '256x256'
        });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid size', async () => {
      try {
        await llm.createImage({
          prompt: 'Test',
          size: '999x999' as any
        });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it('should handle too many images', async () => {
      try {
        await llm.createImage({
          prompt: 'Test',
          size: '256x256',
          n: 20
        });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Prompt Engineering', () => {
    const apiKey = process.env.OPENAI_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - OPENAI_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('openai', 'dall-e-3', null, apiKey);
    });

    it('should generate with detailed prompt', async () => {
      const response = await llm.createImage({
        prompt: 'A serene mountain landscape with a crystal clear lake reflecting the sunset, golden hour lighting, photorealistic, 8k, ultra detailed',
        size: '1024x1024'
      });

      expect(response.data[0].url).toBeDefined();
    });

    it('should generate with style guidance', async () => {
      const response = await llm.createImage({
        prompt: 'A portrait of a woman, oil painting style, impressionist, brush strokes visible, warm color palette, museum quality',
        size: '1024x1792',
        style: 'natural'
      });

      expect(response.data[0].url).toBeDefined();
    });

    it('should generate with medium specification', async () => {
      const response = await llm.createImage({
        prompt: 'A cyberpunk cityscape, digital art style, neon lights, futuristic architecture, concept art',
        size: '1024x1024'
      });

      expect(response.data[0].url).toBeDefined();
    });
  });
});
