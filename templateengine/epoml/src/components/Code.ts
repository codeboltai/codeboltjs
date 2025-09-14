import { createElement } from '../core/createElement';
import { Component } from '../types';

export interface CodeProps {
  /** Whether to render code inline or as a block. Default is true. */
  inline?: boolean;
  /** The language of the code snippet. */
  lang?: string;
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
  children?: (Component | string)[];
}

export function Code(props: CodeProps): Component {
  const {
    inline = true,
    lang,
    blankLine = false,
    syntax = 'markdown',
    className,
    speaker,
    name,
    type,
    writerOptions,
    whiteSpace = 'pre', // For code, we typically want to preserve whitespace
    charLimit,
    tokenLimit,
    priority,
    children = []
  } = props;

  // Process children content
  let content = children.map(child => typeof child === 'string' ? child : '').join('');
  content = applyWhitespaceHandling(content, whiteSpace);
  content = applyLimits(content, charLimit, tokenLimit);

  // Generate the component based on syntax and inline setting
  switch (syntax) {
    case 'markdown':
      return generateMarkdownCode(content, lang, inline, blankLine, className, speaker);
    
    case 'html':
      return generateHtmlCode(content, lang, inline, blankLine, className, speaker);
    
    case 'json':
      return generateJsonCode(content, lang, name, type, className, speaker);
    
    case 'yaml':
      return generateYamlCode(content, lang, name, className, speaker);
    
    case 'xml':
      return generateXmlCode(content, lang, name, type, className, speaker);
    
    case 'text':
    default:
      return generateTextCode(content, inline, blankLine, className, speaker);
  }
}

function generateMarkdownCode(
  content: string,
  lang?: string,
  inline?: boolean,
  blankLine?: boolean,
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  if (blankLine && !inline) result += '\n';
  
  if (inline) {
    result = `\`\`\`${content}\`\`\``;
  } else {
    const language = lang || '';
    result += `\`\`\`${language}\n${content}\n\`\`\``;
  }
  
  if (blankLine && !inline) result += '\n';
  
  return createElement(inline ? 'span' : 'div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlCode(
  content: string,
  lang?: string,
  inline?: boolean,
  blankLine?: boolean,
  className?: string,
  speaker?: string
): Component {
  const codeProps: any = { className, 'data-speaker': speaker };
  
  if (lang) {
    codeProps['data-language'] = lang;
    codeProps.className = `${className || ''} language-${lang}`.trim();
  }
  
  if (inline) {
    return createElement('code', codeProps, content);
  } else {
    const elements: (Component | string)[] = [];
    
    if (blankLine) elements.push('\n');
    elements.push(createElement('code', codeProps, content));
    if (blankLine) elements.push('\n');
    
    return createElement('pre', { 'data-speaker': speaker }, ...elements);
  }
}

function generateJsonCode(
  content: string,
  lang?: string,
  name?: string,
  type?: string,
  className?: string,
  speaker?: string
): Component {
  const obj: any = {
    code: content
  };
  
  if (lang) obj.language = lang;
  if (name) obj.name = name;
  if (type) obj.type = type;
  
  return createElement('pre', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlCode(
  content: string,
  lang?: string,
  name?: string,
  className?: string,
  speaker?: string
): Component {
  const key = name || 'code';
  let yamlContent = `${key}: ${JSON.stringify(content)}`;
  
  if (lang) {
    yamlContent += `\nlanguage: ${JSON.stringify(lang)}`;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, yamlContent);
}

function generateXmlCode(
  content: string,
  lang?: string,
  name?: string,
  type?: string,
  className?: string,
  speaker?: string
): Component {
  const tagName = name || 'code';
  const langAttr = lang ? ` language="${lang}"` : '';
  const typeAttr = type ? ` type="${type}"` : '';
  
  // Escape content for XML
  const escapedContent = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  const xmlContent = `<${tagName}${langAttr}${typeAttr}>${escapedContent}</${tagName}>`;
  
  return createElement('pre', { className, 'data-speaker': speaker }, xmlContent);
}

function generateTextCode(
  content: string,
  inline?: boolean,
  blankLine?: boolean,
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  if (blankLine && !inline) result += '\n';
  
  if (inline) {
    result = content;
  } else {
    // For text syntax, we might want to indent the code to distinguish it
    const indentedContent = content.split('\n').map(line => `    ${line}`).join('\n');
    result += indentedContent;
  }
  
  if (blankLine && !inline) result += '\n';
  
  return createElement(inline ? 'span' : 'div', { className, 'data-speaker': speaker }, result);
}

function applyWhitespaceHandling(content: string, whiteSpace: string): string {
  switch (whiteSpace) {
    case 'pre':
      return content;
    case 'filter':
      // For code, we might want to be more careful about filtering
      return content.replace(/^\s+|\s+$/g, ''); // Only trim start/end
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