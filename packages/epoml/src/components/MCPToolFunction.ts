import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface MCPToolFunctionProps extends BaseComponentProps {
  /** Name of the MCP tool */
  toolName?: string;
  /** Function signature or description */
  toolFunction?: string;
  /** Template variables for dynamic content */
  templateVars?: Record<string, any>;
}

export function MCPToolFunction(props: MCPToolFunctionProps): Component {
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
      return generateMarkdownMCPToolFunction(processedToolName, processedToolFunction, children, className, speaker);
    
    case 'html':
      return generateHtmlMCPToolFunction(processedToolName, processedToolFunction, children, className, speaker);
    
    case 'json':
      return generateJsonMCPToolFunction(processedToolName, processedToolFunction, children, className, speaker);
    
    case 'yaml':
      return generateYamlMCPToolFunction(processedToolName, processedToolFunction, children, className, speaker);
    
    case 'xml':
      return generateXmlMCPToolFunction(processedToolName, processedToolFunction, children, className, speaker);
    
    case 'text':
    default:
      return generateTextMCPToolFunction(processedToolName, processedToolFunction, children, className, speaker);
  }
}

function generateMarkdownMCPToolFunction(
  toolName: string,
  toolFunction: string,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let result = `### 🌐 ${toolName || 'MCP Tool Function'}\n\n`;
  
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

function generateHtmlMCPToolFunction(
  toolName: string,
  toolFunction: string,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let html = `<div class="mcp-tool-function"`;
  if (className) {
    html += ` class="${className}"`;
  }
  if (speaker) {
    html += ` data-speaker="${speaker}"`;
  }
  html += '>';
  
  html += `<h3>🌐 ${toolName || 'MCP Tool Function'}</h3>`;
  
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

function generateJsonMCPToolFunction(
  toolName: string,
  toolFunction: string,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  const obj: any = {
    type: 'mcp-tool-function',
    toolName: toolName || 'MCP Tool Function'
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

function generateYamlMCPToolFunction(
  toolName: string,
  toolFunction: string,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let yaml = `type: mcp-tool-function\ntoolName: ${JSON.stringify(toolName || 'MCP Tool Function')}\n`;
  
  if (toolFunction) {
    yaml += `function: ${JSON.stringify(toolFunction)}\n`;
  }
  
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    yaml += `details: ${JSON.stringify(childrenContent)}\n`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlMCPToolFunction(
  toolName: string,
  toolFunction: string,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let xml = `<mcp-tool-function name="${(toolName || 'MCP Tool Function').replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  
  if (toolFunction) {
    xml += ` function="${toolFunction.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  }
  
  xml += '>';
  
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    xml += `<details>${childrenContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</details>`;
  }
  
  xml += `</mcp-tool-function>`;
  
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextMCPToolFunction(
  toolName: string,
  toolFunction: string,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let result = `MCP TOOL FUNCTION\n================\n\n`;
  
  result += `Tool Name: ${toolName || 'MCP Tool Function'}\n\n`;
  
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