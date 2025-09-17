import { createElement } from '../core/createElement';
import { Component, LimitedComponentProps } from '../types';
import { evaluateCondition, parseLoopExpression, evaluateArrayExpression, createLoopContext } from '../utils/conditionalUtils';
import { processTemplateVars } from '../utils';
import { Fragment } from '../core/Fragment';

export interface ParagraphProps extends LimitedComponentProps {
  // Add conditional and loop props
  if?: boolean | string | ((context: Record<string, any>) => boolean);
  for?: string;
}

export function Paragraph(props: ParagraphProps): Component {
  const {
    syntax = 'markdown',
    className,
    speaker,
    charLimit,
    tokenLimit,
    priority,
    writerOptions,
    whiteSpace = 'filter',
    children = [],
    // Extract conditional and loop props
    if: condition,
    for: loopExpression
  } = props;

  // Handle conditional rendering
  if (condition !== undefined) {
    // Get the evaluation context from a global or passed context
    const evaluationContext = (props as any).context || {};
    const shouldRender = evaluateCondition(condition, evaluationContext);
    if (!shouldRender) {
      // Return an empty fragment
      return Fragment({ children: [] }) as unknown as Component;
    }
  }

  // Handle loop rendering
  if (loopExpression) {
    const evaluationContext = (props as any).context || {};
    const loopParts = parseLoopExpression(loopExpression);
    if (loopParts) {
      const array = evaluateArrayExpression(loopParts.arrayExpression, evaluationContext);
      const loopChildren: (Component | string)[] = [];
      
      for (let i = 0; i < array.length; i++) {
        const item = array[i];
        // Create a new context with loop variables
        const loopContext = createLoopContext(evaluationContext, loopParts.itemName, item, i, array.length);
        
        // Create a new component instance for this iteration with the loop context
        const loopProps = {
          ...props,
          for: undefined, // Remove the for prop to prevent infinite recursion
          context: loopContext // Pass the loop context
        };
        
        loopChildren.push(Paragraph(loopProps));
      }
      
      // Return a fragment with all loop children
      return Fragment({ children: loopChildren }) as unknown as Component;
    }
  }

  // Process children content - automatically process template variables
  let content = children.map(child => {
    if (typeof child === 'string') {
      // Automatically process template variables in string children
      const context = (props as any).context || {};
      return processTemplateVars(child, context);
    }
    return child;
  }).join('');

  // Apply whitespace handling
  content = applyWhitespaceHandling(content, whiteSpace);

  // Apply character/token limits if specified
  content = applyLimits(content, charLimit, tokenLimit, writerOptions);

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownParagraph(content, className, speaker);
    
    case 'html':
      return generateHtmlParagraph(content, className, speaker);
    
    case 'json':
      return generateJsonParagraph(content, className, speaker);
    
    case 'yaml':
      return generateYamlParagraph(content, className, speaker);
    
    case 'xml':
      return generateXmlParagraph(content, className, speaker);
    
    case 'text':
    default:
      return generateTextParagraph(content, className, speaker);
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

function applyLimits(
  content: string, 
  charLimit?: number, 
  tokenLimit?: number,
  writerOptions?: {
    truncateMarker?: string;
    truncateDirection?: 'start' | 'end' | 'middle';
    tokenEncodingModel?: string;
  }
): string {
  const options = {
    truncateMarker: '(...truncated)',
    truncateDirection: 'end',
    tokenEncodingModel: 'gpt-4o',
    ...writerOptions
  };
  
  let result = content;

  // Apply character limit
  if (charLimit && result.length > charLimit) {
    const marker = options.truncateMarker;
    const availableLength = charLimit - marker.length;
    
    if (availableLength <= 0) {
      // If the marker itself is longer than the limit, just return the marker
      return marker.substring(0, charLimit);
    }
    
    switch (options.truncateDirection) {
      case 'start':
        result = marker + result.substring(result.length - availableLength);
        break;
      case 'middle':
        const startLength = Math.floor(availableLength / 2);
        const endLength = availableLength - startLength;
        result = result.substring(0, startLength) + marker + 
                 result.substring(result.length - endLength);
        break;
      case 'end':
      default:
        result = result.substring(0, availableLength) + marker;
        break;
    }
  }

  // Apply token limit (approximate - split by spaces)
  if (tokenLimit) {
    const tokens = result.split(/\s+/);
    if (tokens.length > tokenLimit) {
      result = tokens.slice(0, tokenLimit).join(' ') + options.truncateMarker;
    }
  }

  return result;
}

function generateMarkdownParagraph(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('p', { className, 'data-speaker': speaker }, `${content}\n`);
}

function generateHtmlParagraph(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('p', { className, 'data-speaker': speaker }, content);
}

function generateJsonParagraph(
  content: string,
  className?: string,
  speaker?: string
): Component {
  const obj = { type: 'paragraph', content };
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlParagraph(
  content: string,
  className?: string,
  speaker?: string
): Component {
  const yaml = `type: paragraph\ncontent: ${JSON.stringify(content)}`;
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlParagraph(
  content: string,
  className?: string,
  speaker?: string
): Component {
  const xml = `<paragraph>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</paragraph>`;
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextParagraph(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('p', { className, 'data-speaker': speaker }, `${content}\n`);
}