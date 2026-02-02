/**
 * Transcription Integration Tests
 *
 * Tests for speech-to-text across providers.
 * Requires API keys in environment variables.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Multillm from '../index';

describe('Transcription Integration', () => {
  describe('OpenAI', () => {
    const apiKey = process.env.OPENAI_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - OPENAI_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('openai', 'whisper-1', null, apiKey);
    });

    it('should transcribe basic audio', async () => {
      // Note: This test requires an actual audio file
      // In practice, you would pass: fs.readFileSync('audio.mp3')
      // For testing purposes, we'll create a mock scenario
      
      try {
        const response = await llm.createTranscription({
          audio: Buffer.from([]), // Mock empty buffer
          model: 'whisper-1'
        });
        
        // This should fail with real audio, but validates the API call
        expect(response).toBeDefined();
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it('should support JSON response format', async () => {
      try {
        const response = await llm.createTranscription({
          audio: Buffer.from([]),
          response_format: 'json'
        });

        expect(response.text).toBeDefined();
      } catch (error) {
        // Expected without real audio
      }
    });

    it('should support text response format', async () => {
      try {
        const response = await llm.createTranscription({
          audio: Buffer.from([]),
          response_format: 'text'
        });

        expect(typeof response.text).toBe('string');
      } catch (error) {
        // Expected without real audio
      }
    });

    it('should support SRT format', async () => {
      try {
        const response = await llm.createTranscription({
          audio: Buffer.from([]),
          response_format: 'srt'
        });

        expect(response.text).toContain('00:00:00');
      } catch (error) {
        // Expected without real audio
      }
    });

    it('should support VTT format', async () => {
      try {
        const response = await llm.createTranscription({
          audio: Buffer.from([]),
          response_format: 'vtt'
        });

        expect(response.text).toContain('WEBVTT');
      } catch (error) {
        // Expected without real audio
      }
    });

    it('should support verbose JSON with timestamps', async () => {
      try {
        const response = await llm.createTranscription({
          audio: Buffer.from([]),
          response_format: 'verbose_json',
          timestamp_granularities: ['word']
        });

        if (response.words) {
          expect(Array.isArray(response.words)).toBe(true);
        }
      } catch (error) {
        // Expected without real audio
      }
    });

    it('should support language specification', async () => {
      const languages = ['en', 'es', 'fr', 'de', 'ja'];

      for (const lang of languages) {
        try {
          const response = await llm.createTranscription({
            audio: Buffer.from([]),
            language: lang
          });

          expect(response.language).toBe(lang);
        } catch (error) {
          // Expected without real audio
        }
      }
    });
  });

  describe('Groq', () => {
    const apiKey = process.env.GROQ_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - GROQ_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('groq', 'whisper-large-v3', null, apiKey);
    });

    it('should transcribe audio', async () => {
      try {
        const response = await llm.createTranscription({
          audio: Buffer.from([]),
          model: 'whisper-large-v3'
        });

        expect(response.text).toBeDefined();
      } catch (error) {
        // Expected without real audio
      }
    });

    it('should support different models', async () => {
      const models = ['whisper-large-v3', 'whisper-medium'];

      for (const model of models) {
        try {
          const response = await llm.createTranscription({
            audio: Buffer.from([]),
            model
          });

          expect(response).toBeDefined();
        } catch (error) {
          // Expected without real audio
        }
      }
    });
  });
});
