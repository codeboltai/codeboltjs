import * as fs from 'fs';
import * as path from 'path';
import { createElement } from '../core/createElement';
import { Component } from '../types';

export interface AudioProps {
  /** Path to the audio file. If provided, the file will be read and encoded as base64. */
  src?: string;
  /** Base64-encoded audio data. Cannot be used together with src. */
  base64?: string;
  /** The alternative text to show when the audio cannot be displayed. */
  alt?: string;
  /** The MIME type of the audio (e.g., audio/mpeg, audio/wav). If not specified, it will be inferred from the file extension. */
  type?: string;
  /** The position of the audio. Can be one of: top, bottom, here. Default is here. */
  position?: 'top' | 'bottom' | 'here';
  /** The syntax of the content. Can be one of: markdown, html, json, yaml, xml, multimedia. */
  syntax?: 'markdown' | 'html' | 'json' | 'yaml' | 'xml' | 'multimedia';
  children?: (Component | string)[];
}

export function Audio(props: AudioProps): Component {
  const { src, base64, alt, type, position = 'here', syntax = 'multimedia', children } = props;

  // Validate that only one of src or base64 is provided
  if (src && base64) {
    throw new Error('Audio component cannot have both src and base64 properties');
  }

  if (!src && !base64) {
    throw new Error('Audio component must have either src or base64 property');
  }

  let audioData = base64;
  let mimeType = type;

  // If src is provided, read the file and encode as base64
  if (src) {
    try {
      const audioBuffer = fs.readFileSync(src);
      audioData = audioBuffer.toString('base64');
      
      // Infer MIME type from file extension if not provided
      if (!mimeType) {
        const ext = path.extname(src).toLowerCase();
        switch (ext) {
          case '.mp3':
            mimeType = 'audio/mpeg';
            break;
          case '.wav':
            mimeType = 'audio/wav';
            break;
          case '.ogg':
            mimeType = 'audio/ogg';
            break;
          case '.m4a':
            mimeType = 'audio/mp4';
            break;
          case '.flac':
            mimeType = 'audio/flac';
            break;
          default:
            mimeType = 'audio/mpeg'; // Default fallback
        }
      }
    } catch (error) {
      if (alt) {
        return createElement('span', {}, alt);
      }
      throw new Error(`Failed to read audio file: ${src}`);
    }
  }

  // Ensure MIME type has audio/ prefix
  if (mimeType && !mimeType.startsWith('audio/')) {
    mimeType = `audio/${mimeType}`;
  }

  // Handle syntax-specific rendering
  if (syntax === 'multimedia') {
    // For multimedia syntax, create a data URL
    const dataUrl = `data:${mimeType || 'audio/mpeg'};base64,${audioData}`;
    // For multimedia, return descriptive text with base64 data since we can't actually play audio in text output
    const truncatedData = audioData && audioData.length > 50 ? `${audioData.substring(0, 50)}...` : audioData;
    return createElement('span', {}, `[Audio: ${mimeType || 'audio/mpeg'}, base64: ${truncatedData}]`);
  } else if (syntax === 'html') {
    const dataUrl = `data:${mimeType || 'audio/mpeg'};base64,${audioData}`;
    return createElement('audio', { 
      src: dataUrl, 
      controls: true,
      style: getPositionStyle(position)
    }, ...(children || []));
  } else if (syntax === 'markdown') {
    const dataUrl = `data:${mimeType || 'audio/mpeg'};base64,${audioData}`;
    // Markdown doesn't have native audio support, so use HTML
    return createElement('span', {}, `<audio src="${dataUrl}" controls></audio>`);
  } else {
    // For other syntaxes, show alt text or descriptive text
    if (alt) {
      return createElement('span', {}, alt);
    }
    return createElement('span', {}, `[Audio file: ${src || 'base64 data'}]`);
  }
}

function getPositionStyle(position: 'top' | 'bottom' | 'here'): string {
  switch (position) {
    case 'top':
      return 'vertical-align: top;';
    case 'bottom':
      return 'vertical-align: bottom;';
    case 'here':
    default:
      return 'vertical-align: middle;';
  }
}