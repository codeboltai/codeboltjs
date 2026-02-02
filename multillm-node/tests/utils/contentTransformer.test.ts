/**
 * Unit Tests for Content Transformer Utilities
 *
 * Tests multimodal content transformation for different providers
 */

import { describe, it, expect, vi } from 'vitest';
import {
  isMultimodalContent,
  isStringContent,
  extractTextContent,
  imageToBase64,
  transformContentForOpenAI,
  transformContentForAnthropic,
  transformContentForGemini,
  transformContentForOllama
} from '../../utils/contentTransformer';
import type { ContentPart, MessageContent } from '../../types';

describe('Content Type Detection', () => {
  describe('isMultimodalContent', () => {
    it('should return true for array of content parts', () => {
      const content: ContentPart[] = [
        { type: 'text', text: 'Hello' },
        { type: 'image', image: 'https://example.com/image.jpg' }
      ];
      expect(isMultimodalContent(content)).toBe(true);
    });

    it('should return false for string content', () => {
      expect(isMultimodalContent('Hello world')).toBe(false);
    });

    it('should return false for null content', () => {
      expect(isMultimodalContent(null)).toBe(false);
    });
  });

  describe('isStringContent', () => {
    it('should return true for string', () => {
      expect(isStringContent('Hello world')).toBe(true);
    });

    it('should return false for array', () => {
      const content: ContentPart[] = [{ type: 'text', text: 'Hello' }];
      expect(isStringContent(content)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isStringContent(null)).toBe(false);
    });
  });
});

describe('extractTextContent', () => {
  it('should return empty string for null', () => {
    expect(extractTextContent(null)).toBe('');
  });

  it('should return the string for string content', () => {
    expect(extractTextContent('Hello world')).toBe('Hello world');
  });

  it('should extract text from multimodal content', () => {
    const content: ContentPart[] = [
      { type: 'text', text: 'Hello ' },
      { type: 'image', image: 'https://example.com/image.jpg' },
      { type: 'text', text: 'world' }
    ];
    expect(extractTextContent(content)).toBe('Hello world');
  });

  it('should return empty string for multimodal content with no text', () => {
    const content: ContentPart[] = [
      { type: 'image', image: 'https://example.com/image.jpg' }
    ];
    expect(extractTextContent(content)).toBe('');
  });
});

describe('imageToBase64', () => {
  it('should return URL unchanged for http:// URLs', async () => {
    const result = await imageToBase64('http://example.com/image.jpg');
    expect(result).toEqual({
      data: 'http://example.com/image.jpg',
      mimeType: 'image/jpeg',
      isUrl: true
    });
  });

  it('should return URL unchanged for https:// URLs', async () => {
    const result = await imageToBase64('https://example.com/image.png', 'image/png');
    expect(result).toEqual({
      data: 'https://example.com/image.png',
      mimeType: 'image/png',
      isUrl: true
    });
  });

  it('should extract data and mimeType from data URL', async () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const result = await imageToBase64(dataUrl);
    expect(result.mimeType).toBe('image/png');
    expect(result.isUrl).toBe(false);
    expect(result.data).toBe('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  });

  it('should handle raw base64 string', async () => {
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const result = await imageToBase64(base64, 'image/png');
    expect(result).toEqual({
      data: base64,
      mimeType: 'image/png',
      isUrl: false
    });
  });

  it('should handle URL object', async () => {
    const url = new URL('https://example.com/image.jpg');
    const result = await imageToBase64(url);
    expect(result).toEqual({
      data: 'https://example.com/image.jpg',
      mimeType: 'image/jpeg',
      isUrl: true
    });
  });

  it('should convert Uint8Array to base64', async () => {
    const bytes = new Uint8Array([137, 80, 78, 71]); // PNG magic bytes
    const result = await imageToBase64(bytes, 'image/png');
    expect(result.isUrl).toBe(false);
    expect(result.mimeType).toBe('image/png');
    expect(typeof result.data).toBe('string');
  });

  it('should convert ArrayBuffer to base64', async () => {
    const buffer = new ArrayBuffer(4);
    const view = new Uint8Array(buffer);
    view.set([137, 80, 78, 71]); // PNG magic bytes
    const result = await imageToBase64(buffer, 'image/png');
    expect(result.isUrl).toBe(false);
    expect(result.mimeType).toBe('image/png');
    expect(typeof result.data).toBe('string');
  });
});

describe('transformContentForOpenAI', () => {
  it('should return empty string for null', async () => {
    const result = await transformContentForOpenAI(null);
    expect(result).toBe('');
  });

  it('should return string unchanged', async () => {
    const result = await transformContentForOpenAI('Hello world');
    expect(result).toBe('Hello world');
  });

  it('should transform text content parts', async () => {
    const content: ContentPart[] = [
      { type: 'text', text: 'Hello' },
      { type: 'text', text: ' world' }
    ];
    const result = await transformContentForOpenAI(content);
    expect(result).toEqual([
      { type: 'text', text: 'Hello' },
      { type: 'text', text: ' world' }
    ]);
  });

  it('should transform image URL to image_url format', async () => {
    const content: ContentPart[] = [
      { type: 'text', text: 'What is in this image?' },
      { type: 'image', image: 'https://example.com/image.jpg' }
    ];
    const result = await transformContentForOpenAI(content);
    expect(result).toEqual([
      { type: 'text', text: 'What is in this image?' },
      {
        type: 'image_url',
        image_url: {
          url: 'https://example.com/image.jpg',
          detail: undefined
        }
      }
    ]);
  });

  it('should include detail level when specified', async () => {
    const content: ContentPart[] = [
      { type: 'image', image: 'https://example.com/image.jpg', detail: 'high' }
    ];
    const result = await transformContentForOpenAI(content);
    expect(result).toEqual([
      {
        type: 'image_url',
        image_url: {
          url: 'https://example.com/image.jpg',
          detail: 'high'
        }
      }
    ]);
  });

  it('should convert base64 image to data URL', async () => {
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const content: ContentPart[] = [
      { type: 'image', image: base64, mimeType: 'image/png' }
    ];
    const result = await transformContentForOpenAI(content);
    expect(Array.isArray(result)).toBe(true);
    const imageResult = (result as any[])[0];
    expect(imageResult.type).toBe('image_url');
    expect(imageResult.image_url.url).toContain('data:image/png;base64,');
  });
});

describe('transformContentForAnthropic', () => {
  it('should return empty string for null', async () => {
    const result = await transformContentForAnthropic(null);
    expect(result).toBe('');
  });

  it('should return string unchanged', async () => {
    const result = await transformContentForAnthropic('Hello world');
    expect(result).toBe('Hello world');
  });

  it('should transform text content parts', async () => {
    const content: ContentPart[] = [
      { type: 'text', text: 'Hello' }
    ];
    const result = await transformContentForAnthropic(content);
    expect(result).toEqual([
      { type: 'text', text: 'Hello' }
    ]);
  });

  it('should transform base64 image to Anthropic format', async () => {
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const content: ContentPart[] = [
      { type: 'image', image: base64, mimeType: 'image/png' }
    ];
    const result = await transformContentForAnthropic(content);
    expect(Array.isArray(result)).toBe(true);
    const imageResult = (result as any[])[0];
    expect(imageResult.type).toBe('image');
    expect(imageResult.source).toEqual({
      type: 'base64',
      media_type: 'image/png',
      data: base64
    });
  });

  it('should transform PDF file content', async () => {
    const base64Pdf = 'JVBERi0xLjQK'; // PDF header in base64
    const content: ContentPart[] = [
      { type: 'file', file: base64Pdf, mimeType: 'application/pdf' }
    ];
    const result = await transformContentForAnthropic(content);
    expect(Array.isArray(result)).toBe(true);
    const docResult = (result as any[])[0];
    expect(docResult.type).toBe('document');
    expect(docResult.source.media_type).toBe('application/pdf');
  });
});

describe('transformContentForGemini', () => {
  it('should return text array for null', async () => {
    const result = await transformContentForGemini(null);
    expect(result).toEqual([{ text: '' }]);
  });

  it('should wrap string in text object', async () => {
    const result = await transformContentForGemini('Hello world');
    expect(result).toEqual([{ text: 'Hello world' }]);
  });

  it('should transform text content parts', async () => {
    const content: ContentPart[] = [
      { type: 'text', text: 'Hello' },
      { type: 'text', text: ' world' }
    ];
    const result = await transformContentForGemini(content);
    expect(result).toEqual([
      { text: 'Hello' },
      { text: ' world' }
    ]);
  });

  it('should transform base64 image to inlineData format', async () => {
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const content: ContentPart[] = [
      { type: 'image', image: base64, mimeType: 'image/png' }
    ];
    const result = await transformContentForGemini(content);
    expect(Array.isArray(result)).toBe(true);
    const imageResult = result[0];
    expect(imageResult.inlineData).toEqual({
      mimeType: 'image/png',
      data: base64
    });
  });
});

describe('transformContentForOllama', () => {
  it('should return content string for null', async () => {
    const result = await transformContentForOllama(null);
    expect(result).toEqual({ content: '' });
  });

  it('should return content object for string', async () => {
    const result = await transformContentForOllama('Hello world');
    expect(result).toEqual({ content: 'Hello world' });
  });

  it('should extract text and images from multimodal content', async () => {
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const content: ContentPart[] = [
      { type: 'text', text: 'What is in this image?' },
      { type: 'image', image: base64, mimeType: 'image/png' }
    ];
    const result = await transformContentForOllama(content);
    expect(result.content).toBe('What is in this image?');
    expect(result.images).toBeDefined();
    expect(result.images?.length).toBe(1);
    expect(result.images?.[0]).toBe(base64);
  });

  it('should not include images array when no images present', async () => {
    const content: ContentPart[] = [
      { type: 'text', text: 'Hello world' }
    ];
    const result = await transformContentForOllama(content);
    expect(result.content).toBe('Hello world');
    expect(result.images).toBeUndefined();
  });
});
