/**
 * Speech Generation Integration Tests
 *
 * Tests for text-to-speech across providers.
 * Requires API keys in environment variables.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Multillm from '../index';

describe('Speech Integration', () => {
  describe('OpenAI', () => {
    const apiKey = process.env.OPENAI_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - OPENAI_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('openai', 'tts-1', null, apiKey);
    });

    it('should generate speech with default voice', async () => {
      const response = await llm.createSpeech({
        input: 'Hello, world!',
        voice: 'alloy'
      });

      expect(response.audio).toBeInstanceOf(ArrayBuffer);
      expect(response.contentType).toBe('audio/mpeg');
      expect(response.audio.byteLength).toBeGreaterThan(0);
    });

    it('should support all voices', async () => {
      const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

      for (const voice of voices) {
        const response = await llm.createSpeech({
          input: 'Test',
          voice: voice as any
        });

        expect(response.audio).toBeDefined();
        expect(response.audio.byteLength).toBeGreaterThan(0);
      }
    });

    it('should support MP3 format', async () => {
      const response = await llm.createSpeech({
        input: 'Test',
        voice: 'alloy',
        response_format: 'mp3'
      });

      expect(response.contentType).toBe('audio/mpeg');
    });

    it('should support OPUS format', async () => {
      const response = await llm.createSpeech({
        input: 'Test',
        voice: 'alloy',
        response_format: 'opus'
      });

      expect(response.contentType).toBe('audio/opus');
    });

    it('should support WAV format', async () => {
      const response = await llm.createSpeech({
        input: 'Test',
        voice: 'alloy',
        response_format: 'wav'
      });

      expect(response.contentType).toBe('audio/wav');
    });

    it('should support speed control', async () => {
      const speeds = [0.5, 1.0, 1.5, 2.0];

      for (const speed of speeds) {
        const response = await llm.createSpeech({
          input: 'Test speech speed',
          voice: 'alloy',
          speed
        });

        expect(response.audio).toBeDefined();
      }
    });
  });

  describe('OpenAI TTS-HD', () => {
    const apiKey = process.env.OPENAI_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - OPENAI_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('openai', 'tts-1-hd', null, apiKey);
    });

    it('should generate high quality speech', async () => {
      const response = await llm.createSpeech({
        input: 'Welcome to our premium service.',
        voice: 'nova'
      });

      expect(response.audio).toBeDefined();
      expect(response.audio.byteLength).toBeGreaterThan(0);
      expect(response.contentType).toBe('audio/mpeg');
    });
  });
});
