import { createElement } from '../core/createElement';
import { Component } from '../types';

export interface HeaderProps {
  /** Whether to add one more blank line (2 in total) before and after the paragraph. */
  blankLine?: boolean;
  /** The syntax of the content. */
  syntax?: 'markdown' | 'html' | 'json' | 'yaml' | 'xml' | 'text';
  /** A class name for quickly styling the current block with stylesheets. */
  className?: string;
  /** The speaker of the content. */
  speaker?: 'human' | 'ai' | 'system';
  /** The name of the content, used in serialization. */
  name?: string;
  /** The type of the content, used in serialization. */
  type?: string;
  /** Experimental. Optional JSON string to customize the format of markdown headers, JSON indents, etc. */
  writerOptions?: object;
  /** Experimental. Controls how whitespace is handled in text content. */
  whiteSpace?: 'pre' | 'filter' | 'trim';
  /** Experimental. Soft character limit before truncation is applied. */
  charLimit?: number;
  /** Experimental. Soft token limit before truncation is applied. */
  tokenLimit?: number;
  /** Experimental. Priority used when truncating globally. */
  priority?: number;
  /** Header level (1-6), will be computed based on context if not provided */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children?: (Component | string)[];
}

export function Header(props: HeaderProps): Component {
  const {
    blankLine = false,
    syntax = 'markdown',
    className,
    speaker,
    name,
    type,
    writerOptions,
    whiteSpace = 'filter',
    charLimit,
    tokenLimit,
    priority,
    level = 1, // Default to h1, in real implementation this would be computed from context
    children = []
  } = props;

  // Process children content
  let content = children.map(child => typeof child === 'string' ? child : '').join('');
  content = applyWhitespaceHandling(content, whiteSpace);
  content = applyLimits(content, charLimit, tokenLimit);

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownHeader(content, level, blankLine, className, speaker, writerOptions);
    
    case 'html':
      return generateHtmlHeader(content, level, blankLine, className, speaker);
    
    case 'json':
      return generateJsonHeader(content, level, name, type, className, speaker);
    
    case 'yaml':
      return generateYamlHeader(content, level, name, className, speaker);
    
    case 'xml':
      return generateXmlHeader(content, level, name, type, className, speaker);
    
    case 'text':
    default:
      return generateTextHeader(content, level, blankLine, className, speaker);
  }
}

function generateMarkdownHeader(
  content: string,
  level: number,
  blankLine: boolean,
  className?: string,
  speaker?: string,
  writerOptions?: object
): Component {
  let result = '';
  
  if (blankLine) result += '\n';
  
  // Generate markdown header based on level
  const hashes = '#'.repeat(Math.max(1, Math.min(6, level)));
  result += `${hashes} ${content}`;
  
  if (blankLine) result += '\n';
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlHeader(
  content: string,
  level: number,
  blankLine: boolean,
  className?: string,
  speaker?: string
): Component {
  const elements: (Component | string)[] = [];
  
  if (blankLine) elements.push('\n');
  
  // Clamp level between 1 and 6
  const headerLevel = Math.max(1, Math.min(6, level));
  const tagName = `h${headerLevel}`;
  
  const headerElement = createElement(tagName, { className, 'data-speaker': speaker }, content);
  elements.push(headerElement);
  
  if (blankLine) elements.push('\n');
  
  if (elements.length === 1) {
    return elements[0] as Component;
  }
  
  return createElement('div', { 'data-speaker': speaker }, ...elements);
}

function generateJsonHeader(
  content: string,
  level: number,
  name?: string,
  type?: string,
  className?: string,
  speaker?: string
): Component {
  const obj: any = {
    [name || 'header']: content,
    level: level
  };
  
  if (type) obj.type = type;
  
  return createElement('pre', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlHeader(
  content: string,
  level: number,
  name?: string,
  className?: string,
  speaker?: string
): Component {
  const key = name || 'header';
  const yamlContent = `${key}: ${JSON.stringify(content)}\nlevel: ${level}`;
  
  return createElement('pre', { className, 'data-speaker': speaker }, yamlContent);
}

function generateXmlHeader(
  content: string,
  level: number,
  name?: string,
  type?: string,
  className?: string,
  speaker?: string
): Component {
  const tagName = name || 'header';
  const levelAttr = ` level="${level}"`;
  const typeAttr = type ? ` type="${type}"` : '';
  
  // Escape content for XML
  const escapedContent = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  const xmlContent = `<${tagName}${levelAttr}${typeAttr}>${escapedContent}</${tagName}>`;
  
  return createElement('pre', { className, 'data-speaker': speaker }, xmlContent);
}

function generateTextHeader(
  content: string,
  level: number,
  blankLine: boolean,
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  if (blankLine) result += '\n';
  
  // For text format, we can use different decorative styles based on level
  switch (level) {
    case 1:
      result += `${content}\n${'='.repeat(content.length)}`;
      break;
    case 2:
      result += `${content}\n${'-'.repeat(content.length)}`;
      break;
    case 3:
      result += `### ${content} ###`;
      break;
    case 4:
      result += `** ${content} **`;
      break;
    case 5:
      result += `* ${content} *`;
      break;
    case 6:
    default:
      result += `- ${content} -`;
      break;
  }
  
  if (blankLine) result += '\n';
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function applyWhitespaceHandling(content: string, whiteSpace: string): string {
  switch (whiteSpace) {
    case 'pre':
      return content;
    case 'filter':
      return content.trim().replace(/\s+/g, ' ');
    case 'trim':
      return content.trim();
    default:
      return content;
  }
}

function applyLimits(content: string, charLimit?: number, tokenLimit?: number): string {
  let result = content;

  if (charLimit && result.length > charLimit) {
    result = result.substring(0, charLimit - 3) + '...';
  }

  if (tokenLimit) {
    const tokens = result.split(/\s+/);
    if (tokens.length > tokenLimit) {
      result = tokens.slice(0, tokenLimit).join(' ') + '...';
    }
  }

  return result;
}