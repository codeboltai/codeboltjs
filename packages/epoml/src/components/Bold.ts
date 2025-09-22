import { createElement } from '../core/createElement';
import { Component } from '../types';

export interface BoldProps {
  /** The syntax of the content. Can be one of: markdown, html, json, yaml, xml, text. */
  syntax?: 'markdown' | 'html' | 'json' | 'yaml' | 'xml' | 'text';
  /** A class name for quickly styling the current block with stylesheets. */
  className?: string;
  /** The speaker of the content. Can be one of: human, ai, system. */
  speaker?: 'human' | 'ai' | 'system';
  /** Experimental. Optional JSON string to customize the format of markdown headers, JSON indents, etc. */
  writerOptions?: object;
  /** Experimental. Controls how whitespace is handled in text content. */
  whiteSpace?: 'pre' | 'filter' | 'trim';
  /** Experimental. Soft character limit before truncation is applied. */
  charLimit?: number;
  /** Experimental. Soft token limit before truncation is applied. */
  tokenLimit?: number;
  /** Experimental. Priority used when truncating globally. Lower numbers are dropped first. */
  priority?: number;
  children?: (Component | string)[];
}

export function Bold(props: BoldProps): Component {
  const { 
    syntax = 'markdown', 
    className, 
    speaker, 
    writerOptions, 
    whiteSpace = 'filter', 
    charLimit, 
    tokenLimit, 
    priority, 
    children = [] 
  } = props;

  // Process children content
  let content = children.map(child => typeof child === 'string' ? child : '').join('');

  // Apply whitespace handling
  content = applyWhitespaceHandling(content, whiteSpace);

  // Apply character/token limits if specified
  content = applyLimits(content, charLimit, tokenLimit);

  // Apply syntax-specific formatting
  switch (syntax) {
    case 'markdown':
      return createElement('span', { className, 'data-speaker': speaker }, `**${content}**`);
    
    case 'html':
      return createElement('b', { className, 'data-speaker': speaker }, content);
    
    case 'json':
    case 'yaml':
    case 'xml':
      // For structured formats, return plain content since bold formatting isn't applicable
      return createElement('span', { className, 'data-speaker': speaker }, content);
    
    case 'text':
    default:
      // For plain text, we can use uppercase or other text transformation
      return createElement('span', { className, 'data-speaker': speaker }, content.toUpperCase());
  }
}

function applyWhitespaceHandling(content: string, whiteSpace: 'pre' | 'filter' | 'trim'): string {
  switch (whiteSpace) {
    case 'pre':
      // Preserve all whitespace as-is
      return content;
    
    case 'filter':
      // Remove leading/trailing whitespace and normalize internal whitespace
      return content.trim().replace(/\s+/g, ' ');
    
    case 'trim':
      // Trim whitespace from beginning and end
      return content.trim();
    
    default:
      return content;
  }
}

function applyLimits(content: string, charLimit?: number, tokenLimit?: number): string {
  let result = content;

  // Apply character limit
  if (charLimit && result.length > charLimit) {
    result = result.substring(0, charLimit - 3) + '...';
  }

  // Apply token limit (approximate - split by spaces)
  if (tokenLimit) {
    const tokens = result.split(/\s+/);
    if (tokens.length > tokenLimit) {
      result = tokens.slice(0, tokenLimit).join(' ') + '...';
    }
  }

  return result;
}