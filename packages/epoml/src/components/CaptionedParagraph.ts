import { createElement } from '../core/createElement';
import { Component } from '../types';

export interface CaptionedParagraphProps {
  /** The title or label for the paragraph. Required. */
  caption: string;
  /** The serialized version of the caption when using "serializer" syntaxes. */
  captionSerialized?: string;
  /** Determines the style of the caption, applicable only for "markup" syntaxes. */
  captionStyle?: 'header' | 'bold' | 'plain' | 'hidden';
  /** Specifies text transformation for the caption, applicable only for "markup" syntaxes. */
  captionTextTransform?: 'upper' | 'level' | 'capitalize' | 'none';
  /** A caption can ends with a colon, a newline or simply nothing. */
  captionEnding?: 'colon' | 'newline' | 'colon-newline' | 'none';
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

export function CaptionedParagraph(props: CaptionedParagraphProps): Component {
  const {
    caption,
    captionSerialized,
    captionStyle = 'header',
    captionTextTransform = 'none',
    captionEnding,
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
    children = []
  } = props;

  // Determine caption ending based on style if not explicitly set
  let ending = captionEnding;
  if (!ending) {
    ending = (captionStyle === 'bold' || captionStyle === 'plain') ? 'colon' : 'none';
  }

  // Process children content
  let content = children.map(child => typeof child === 'string' ? child : '').join('');
  content = applyWhitespaceHandling(content, whiteSpace);
  content = applyLimits(content, charLimit, tokenLimit);

  // Process caption
  const displayCaption = captionSerialized && isSerializerSyntax(syntax) ? captionSerialized : caption;
  const processedCaption = applyTextTransform(displayCaption, captionTextTransform);

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownCaptionedParagraph(processedCaption, content, captionStyle, ending, blankLine, className, speaker);
    
    case 'html':
      return generateHtmlCaptionedParagraph(processedCaption, content, captionStyle, ending, blankLine, className, speaker);
    
    case 'json':
      return generateJsonCaptionedParagraph(processedCaption, content, name, type, className, speaker);
    
    case 'yaml':
      return generateYamlCaptionedParagraph(processedCaption, content, name, className, speaker);
    
    case 'xml':
      return generateXmlCaptionedParagraph(processedCaption, content, name, type, className, speaker);
    
    case 'text':
    default:
      return generateTextCaptionedParagraph(processedCaption, content, ending, blankLine, className, speaker);
  }
}

function generateMarkdownCaptionedParagraph(
  caption: string, 
  content: string, 
  style: string, 
  ending: string, 
  blankLine: boolean,
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  if (blankLine) result += '\n';
  
  if (style !== 'hidden') {
    switch (style) {
      case 'header':
        result += `### ${caption}`;
        break;
      case 'bold':
        result += `**${caption}**`;
        break;
      case 'plain':
      default:
        result += caption;
        break;
    }
    
    // Add ending
    switch (ending) {
      case 'colon':
        result += ':';
        break;
      case 'newline':
        result += '\n';
        break;
      case 'colon-newline':
        result += ':\n';
        break;
    }
    
    if (ending !== 'newline' && ending !== 'colon-newline') {
      result += '\n';
    }
  }
  
  result += content;
  
  if (blankLine) result += '\n';
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlCaptionedParagraph(
  caption: string, 
  content: string, 
  style: string, 
  ending: string, 
  blankLine: boolean,
  className?: string,
  speaker?: string
): Component {
  const elements: (Component | string)[] = [];
  
  if (blankLine) elements.push('\n');
  
  if (style !== 'hidden') {
    let captionElement: Component;
    
    switch (style) {
      case 'header':
        captionElement = createElement('h3', {}, caption);
        break;
      case 'bold':
        captionElement = createElement('strong', {}, caption);
        break;
      case 'plain':
      default:
        captionElement = createElement('span', {}, caption);
        break;
    }
    
    elements.push(captionElement);
    
    // Add ending
    switch (ending) {
      case 'colon':
        elements.push(':');
        break;
      case 'newline':
        elements.push('\n');
        break;
      case 'colon-newline':
        elements.push(':\n');
        break;
    }
  }
  
  elements.push(content);
  
  if (blankLine) elements.push('\n');
  
  return createElement('div', { className, 'data-speaker': speaker }, ...elements);
}

function generateJsonCaptionedParagraph(
  caption: string, 
  content: string, 
  name?: string, 
  type?: string,
  className?: string,
  speaker?: string
): Component {
  const obj: any = {};
  
  if (name) obj[name] = content;
  else obj[caption] = content;
  
  if (type) obj._type = type;
  
  return createElement('pre', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlCaptionedParagraph(
  caption: string, 
  content: string, 
  name?: string,
  className?: string,
  speaker?: string
): Component {
  const key = name || caption.toLowerCase().replace(/\s+/g, '_');
  const yamlContent = `${key}: ${JSON.stringify(content)}`;
  
  return createElement('pre', { className, 'data-speaker': speaker }, yamlContent);
}

function generateXmlCaptionedParagraph(
  caption: string, 
  content: string, 
  name?: string, 
  type?: string,
  className?: string,
  speaker?: string
): Component {
  const tagName = name || caption.toLowerCase().replace(/\s+/g, '_');
  const typeAttr = type ? ` type="${type}"` : '';
  const xmlContent = `<${tagName}${typeAttr}>${content}</${tagName}>`;
  
  return createElement('pre', { className, 'data-speaker': speaker }, xmlContent);
}

function generateTextCaptionedParagraph(
  caption: string, 
  content: string, 
  ending: string, 
  blankLine: boolean,
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  if (blankLine) result += '\n';
  
  result += caption;
  
  // Add ending
  switch (ending) {
    case 'colon':
      result += ':';
      break;
    case 'newline':
      result += '\n';
      break;
    case 'colon-newline':
      result += ':\n';
      break;
  }
  
  if (ending !== 'newline' && ending !== 'colon-newline') {
    result += ' ';
  }
  
  result += content;
  
  if (blankLine) result += '\n';
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function applyTextTransform(text: string, transform: string): string {
  switch (transform) {
    case 'upper':
      return text.toUpperCase();
    case 'capitalize':
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    case 'level':
      // For level transformation, we'd need context about nesting level
      // For now, just return as-is
      return text;
    case 'none':
    default:
      return text;
  }
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

function isSerializerSyntax(syntax: string): boolean {
  return ['json', 'yaml', 'xml'].includes(syntax);
}