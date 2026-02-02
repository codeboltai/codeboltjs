/**
 * Content Transformer Utilities
 *
 * Transforms multimodal content between multillm format and provider-specific formats.
 */

import type {
  ContentPart,
  MessageContent,
  ImageContentPart,
  FileContentPart
} from '../types';

/**
 * Check if content is multimodal (array of parts)
 */
export function isMultimodalContent(content: MessageContent): content is ContentPart[] {
  return Array.isArray(content);
}

/**
 * Check if content is a simple string
 */
export function isStringContent(content: MessageContent): content is string {
  return typeof content === 'string';
}

/**
 * Extract text content from multimodal or string content
 */
export function extractTextContent(content: MessageContent): string {
  if (content === null) return '';
  if (typeof content === 'string') return content;

  return content
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map(part => part.text)
    .join('');
}

/**
 * Convert various image input formats to base64 data
 * Returns the data and detected/provided mime type
 */
export async function imageToBase64(
  image: string | URL | ArrayBuffer | Uint8Array,
  providedMimeType?: string
): Promise<{ data: string; mimeType: string; isUrl: boolean }> {
  // URL string (http/https)
  if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
    return { data: image, mimeType: providedMimeType || 'image/jpeg', isUrl: true };
  }

  // Data URL (base64 encoded)
  if (typeof image === 'string' && image.startsWith('data:')) {
    const [header, data] = image.split(',');
    const mimeType = header.match(/data:([^;]+)/)?.[1] || providedMimeType || 'image/png';
    return { data, mimeType, isUrl: false };
  }

  // Raw base64 string
  if (typeof image === 'string') {
    return { data: image, mimeType: providedMimeType || 'image/png', isUrl: false };
  }

  // URL object
  if (image instanceof URL) {
    return { data: image.toString(), mimeType: providedMimeType || 'image/jpeg', isUrl: true };
  }

  // ArrayBuffer
  if (image instanceof ArrayBuffer) {
    const uint8 = new Uint8Array(image);
    const base64 = arrayBufferToBase64(uint8);
    return { data: base64, mimeType: providedMimeType || 'image/png', isUrl: false };
  }

  // Uint8Array
  if (image instanceof Uint8Array) {
    const base64 = arrayBufferToBase64(image);
    return { data: base64, mimeType: providedMimeType || 'image/png', isUrl: false };
  }

  throw new Error('Unsupported image format');
}

/**
 * Convert ArrayBuffer/Uint8Array to base64 string
 */
function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

/**
 * Fetch image from URL and convert to base64
 */
export async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const base64 = arrayBufferToBase64(new Uint8Array(buffer));
  const mimeType = response.headers.get('content-type') || 'image/png';
  return { data: base64, mimeType };
}

// ============================================
// OpenAI Content Transformation
// ============================================

export interface OpenAIContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'auto' | 'low' | 'high';
  };
}

/**
 * Transform content to OpenAI format
 * OpenAI accepts: string | Array<{ type: 'text', text } | { type: 'image_url', image_url: { url, detail } }>
 */
export async function transformContentForOpenAI(
  content: MessageContent
): Promise<string | OpenAIContentPart[]> {
  if (content === null) return '';
  if (typeof content === 'string') return content;

  const parts: OpenAIContentPart[] = [];

  for (const part of content) {
    if (part.type === 'text') {
      parts.push({ type: 'text', text: part.text });
    } else if (part.type === 'image') {
      const { data, mimeType, isUrl } = await imageToBase64(part.image, part.mimeType);
      const url = isUrl ? data : `data:${mimeType};base64,${data}`;
      parts.push({
        type: 'image_url',
        image_url: { url, detail: part.detail }
      });
    }
    // Note: OpenAI doesn't support file parts directly in chat messages
    // Files would need separate handling via assistants API
  }

  return parts;
}

// ============================================
// Anthropic Content Transformation
// ============================================

export interface AnthropicContentPart {
  type: 'text' | 'image' | 'document';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
}

/**
 * Transform content to Anthropic format
 * Anthropic accepts: string | Array<{ type: 'text', text } | { type: 'image', source: { type: 'base64', media_type, data } }>
 */
export async function transformContentForAnthropic(
  content: MessageContent
): Promise<string | AnthropicContentPart[]> {
  if (content === null) return '';
  if (typeof content === 'string') return content;

  const parts: AnthropicContentPart[] = [];

  for (const part of content) {
    if (part.type === 'text') {
      parts.push({ type: 'text', text: part.text });
    } else if (part.type === 'image') {
      const { data, mimeType, isUrl } = await imageToBase64(part.image, part.mimeType);

      // Anthropic requires base64 for images, fetch URL if needed
      if (isUrl) {
        const fetched = await fetchImageAsBase64(data);
        parts.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: fetched.mimeType,
            data: fetched.data
          }
        });
      } else {
        parts.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType,
            data
          }
        });
      }
    } else if (part.type === 'file' && part.mimeType === 'application/pdf') {
      // Anthropic supports PDF documents
      const { data, isUrl } = await imageToBase64(part.file, part.mimeType);

      if (isUrl) {
        const response = await fetch(data);
        const buffer = await response.arrayBuffer();
        const base64 = arrayBufferToBase64(new Uint8Array(buffer));
        parts.push({
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: base64
          }
        });
      } else {
        parts.push({
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data
          }
        });
      }
    }
  }

  return parts;
}

// ============================================
// Gemini Content Transformation
// ============================================

export interface GeminiContentPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

/**
 * Transform content to Gemini format
 * Gemini accepts: Array<{ text } | { inlineData: { mimeType, data } }>
 */
export async function transformContentForGemini(
  content: MessageContent
): Promise<GeminiContentPart[]> {
  if (content === null) return [{ text: '' }];
  if (typeof content === 'string') return [{ text: content }];

  const parts: GeminiContentPart[] = [];

  for (const part of content) {
    if (part.type === 'text') {
      parts.push({ text: part.text });
    } else if (part.type === 'image') {
      const { data, mimeType, isUrl } = await imageToBase64(part.image, part.mimeType);

      // Gemini requires inline data, fetch URL if needed
      if (isUrl) {
        const fetched = await fetchImageAsBase64(data);
        parts.push({
          inlineData: {
            mimeType: fetched.mimeType,
            data: fetched.data
          }
        });
      } else {
        parts.push({
          inlineData: {
            mimeType,
            data
          }
        });
      }
    }
  }

  return parts;
}

// ============================================
// Ollama Content Transformation
// ============================================

export interface OllamaContent {
  content: string;
  images?: string[];
}

/**
 * Transform content to Ollama format
 * Ollama accepts: { content: string, images?: string[] } where images are base64 strings
 */
export async function transformContentForOllama(
  content: MessageContent
): Promise<OllamaContent> {
  if (content === null) return { content: '' };
  if (typeof content === 'string') return { content };

  let textContent = '';
  const images: string[] = [];

  for (const part of content) {
    if (part.type === 'text') {
      textContent += part.text;
    } else if (part.type === 'image') {
      const { data, isUrl } = await imageToBase64(part.image, part.mimeType);

      // Ollama needs base64 images (without data URL prefix)
      if (isUrl) {
        const fetched = await fetchImageAsBase64(data);
        images.push(fetched.data);
      } else {
        images.push(data);
      }
    }
  }

  return {
    content: textContent,
    images: images.length > 0 ? images : undefined
  };
}
