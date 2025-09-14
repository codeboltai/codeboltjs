import { createElement } from '../core/createElement';
import { Component } from '../types';

export interface InlineProps {
  /** The syntax of the content. */
  syntax?: 'markdown' | 'html' | 'json' | 'yaml' | 'xml' | 'text';
  /** A class name for quickly styling the current block with stylesheets. */
  className?: string;
  /** The speaker of the content. */
  speaker?: 'human' | 'ai' | 'system';
  /** Experimental. Optional JSON string to customize the format of markdown headers, JSON indents, etc. */
  writerOptions?: object;
  /** Experimental. Controls how whitespace is handled in text content. */
  whiteSpace?: 'pre' | 'filter' | 'trim';
  children?: (Component | string)[];
}

export function Inline(props: InlineProps): Component {
  const {
    syntax = 'markdown',
    className,
    speaker,
    writerOptions,
    whiteSpace = 'filter',
    children = []
  } = props;

  // Process children content
  let content = children.map(child => typeof child === 'string' ? child : '').join('');
  content = applyWhitespaceHandling(content, whiteSpace);

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownInline(content, className, speaker);
    
    case 'html':
      return generateHtmlInline(content, className, speaker);
    
    case 'json':
      return generateJsonInline(content, className, speaker);
    
    case 'yaml':
      return generateYamlInline(content, className, speaker);
    
    case 'xml':
      return generateXmlInline(content, className, speaker);
    
    case 'text':
    default:
      return generateTextInline(content, className, speaker);
  }
}

function generateMarkdownInline(
  content: string,
  className?: string,
  speaker?: string
): Component {
  // For markdown, inline content is rendered as-is without any markdown formatting
  // since it's meant to be inline text without preceding or following blank characters
  return createElement('span', { className, 'data-speaker': speaker }, content);
}

function generateHtmlInline(
  content: string,
  className?: string,
  speaker?: string
): Component {
  // Use HTML span element for inline content
  return createElement('span', { className, 'data-speaker': speaker }, content);
}

function generateJsonInline(
  content: string,
  className?: string,
  speaker?: string
): Component {
  // In serializer syntaxes, inline is treated as a generic value
  // Return the content as a JSON string value
  return createElement('span', { className, 'data-speaker': speaker }, JSON.stringify(content));
}

function generateYamlInline(
  content: string,
  className?: string,
  speaker?: string
): Component {
  // For YAML, return as a quoted string value
  return createElement('span', { className, 'data-speaker': speaker }, JSON.stringify(content));
}

function generateXmlInline(
  content: string,
  className?: string,
  speaker?: string
): Component {
  // For XML, escape the content and wrap in a generic span-like element
  const escapedContent = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  return createElement('span', { className, 'data-speaker': speaker }, `<span>${escapedContent}</span>`);
}

function generateTextInline(
  content: string,
  className?: string,
  speaker?: string
): Component {
  // For plain text, return content as-is
  return createElement('span', { className, 'data-speaker': speaker }, content);
}

function applyWhitespaceHandling(content: string, whiteSpace: string): string {
  switch (whiteSpace) {
    case 'pre':
      // Preserve all whitespace as-is
      return content;
    case 'filter':
      // Remove leading/trailing whitespace and normalize internal whitespace
      // This is the default for inline content to ensure clean inline rendering
      return content.trim().replace(/\s+/g, ' ');
    case 'trim':
      // Trim whitespace from beginning and end
      return content.trim();
    default:
      return content;
  }
}