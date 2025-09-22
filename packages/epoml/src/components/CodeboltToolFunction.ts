import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface CodeboltToolFunctionProps extends BaseComponentProps {
  /** Name of the tool */
  toolName?: string;
  /** Function signature or description */
  toolFunction?: string;
  /** Template variables for dynamic content */
  templateVars?: Record<string, any>;
}

export function CodeboltToolFunction(props: CodeboltToolFunctionProps): Component {
  const {
    toolName = '',
    toolFunction = '',
    templateVars = {},
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  // Process template variables
  const processedToolName = toolName; // In a real implementation, this would process template variables
  const processedToolFunction = toolFunction; // In a real implementation, this would process template variables

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownCodeboltToolFunction(processedToolName, processedToolFunction, children, className, speaker);
    
    case 'html':
      return generateHtmlCodeboltToolFunction(processedToolName, processedToolFunction, children, className, speaker);
    
    case 'json':
      return generateJsonCodeboltToolFunction(processedToolName, processedToolFunction, children, className, speaker);
    
    case 'yaml':
      return generateYamlCodeboltToolFunction(processedToolName, processedToolFunction, children, className, speaker);
    
    case 'xml':
      return generateXmlCodeboltToolFunction(processedToolName, processedToolFunction, children, className, speaker);
    
    case 'text':
    default:
      return generateTextCodeboltToolFunction(processedToolName, processedToolFunction, children, className, speaker);
  }
}

function generateMarkdownCodeboltToolFunction(
  toolName: string,
  toolFunction: string,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let result = `### 🔧 ${toolName || 'Codebolt Tool Function'}\n\n`;
  
  if (toolFunction) {
    result += `**Function:** ${toolFunction}\n\n`;
  }
  
  // Process children (for foreach/for loop support)
  if (children.length > 0) {
    result += `**Details:**\n\n`;
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlCodeboltToolFunction(
  toolName: string,
  toolFunction: string,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let html = `<div class="codebolt-tool-function"`;
  if (className) {
    html += ` class="${className}"`;
  }
  if (speaker) {
    html += ` data-speaker="${speaker}"`;
  }
  html += '>';
  
  html += `<h3>🔧 ${toolName || 'Codebolt Tool Function'}</h3>`;
  
  if (toolFunction) {
    html += `<p><strong>Function:</strong> ${toolFunction.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
  }
  
  // Process children (for foreach/for loop support)
  if (children.length > 0) {
    html += `<h4>Details:</h4>`;
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    html += `<div class="details">${childrenContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
  }
  
  html += `</div>`;
  
  return createElement('div', { className, 'data-speaker': speaker }, html);
}

function generateJsonCodeboltToolFunction(
  toolName: string,
  toolFunction: string,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  const obj: any = {
    type: 'codebolt-tool-function',
    toolName: toolName || 'Codebolt Tool Function'
  };
  
  if (toolFunction) {
    obj.function = toolFunction;
  }
  
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    obj.details = childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlCodeboltToolFunction(
  toolName: string,
  toolFunction: string,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let yaml = `type: codebolt-tool-function\ntoolName: ${JSON.stringify(toolName || 'Codebolt Tool Function')}\n`;
  
  if (toolFunction) {
    yaml += `function: ${JSON.stringify(toolFunction)}\n`;
  }
  
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    yaml += `details: ${JSON.stringify(childrenContent)}\n`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlCodeboltToolFunction(
  toolName: string,
  toolFunction: string,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let xml = `<codebolt-tool-function name="${(toolName || 'Codebolt Tool Function').replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  
  if (toolFunction) {
    xml += ` function="${toolFunction.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  }
  
  xml += '>';
  
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    xml += `<details>${childrenContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</details>`;
  }
  
  xml += `</codebolt-tool-function>`;
  
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextCodeboltToolFunction(
  toolName: string,
  toolFunction: string,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let result = `CODEBOLT TOOL FUNCTION\n=====================\n\n`;
  
  result += `Tool Name: ${toolName || 'Codebolt Tool Function'}\n\n`;
  
  if (toolFunction) {
    result += `Function: ${toolFunction}\n\n`;
  }
  
  // Process children (for foreach/for loop support)
  if (children.length > 0) {
    result += `Details:\n--------\n`;
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}