import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface ToolRequestProps extends BaseComponentProps {
  /** Tool name */
  tool: string;
  /** Tool parameters */
  parameters?: Record<string, any>;
  /** Request ID */
  requestId?: string;
}

export function ToolRequest(props: ToolRequestProps): Component {
  const {
    tool,
    parameters = {},
    requestId,
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  // Process children content
  const content = children.map(child => typeof child === 'string' ? child : '').join('');

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownToolRequest(tool, parameters, requestId, content, className, speaker);
    
    case 'html':
      return generateHtmlToolRequest(tool, parameters, requestId, content, className, speaker);
    
    case 'json':
      return generateJsonToolRequest(tool, parameters, requestId, content, className, speaker);
    
    case 'yaml':
      return generateYamlToolRequest(tool, parameters, requestId, content, className, speaker);
    
    case 'xml':
      return generateXmlToolRequest(tool, parameters, requestId, content, className, speaker);
    
    case 'text':
    default:
      return generateTextToolRequest(tool, parameters, requestId, content, className, speaker);
  }
}

function generateMarkdownToolRequest(
  tool: string,
  parameters: Record<string, any>,
  requestId: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let result = `**🔧 Tool Request**\n\n`;
  result += `- **Tool**: ${tool}\n`;
  
  if (requestId) {
    result += `- **Request ID**: ${requestId}\n`;
  }
  
  if (Object.keys(parameters).length > 0) {
    result += `- **Parameters**:\n`;
    for (const [key, value] of Object.entries(parameters)) {
      result += `  - ${key}: ${JSON.stringify(value)}\n`;
    }
  }
  
  if (content) {
    result += `\n**Details**: ${content}\n`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlToolRequest(
  tool: string,
  parameters: Record<string, any>,
  requestId: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let html = '<div class="tool-request"';
  if (className) {
    html += ` class="${className}"`;
  }
  if (speaker) {
    html += ` data-speaker="${speaker}"`;
  }
  html += '>';
  
  html += '<h4>🔧 Tool Request</h4>';
  html += '<ul>';
  html += `<li><strong>Tool:</strong> ${tool.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</li>`;
  
  if (requestId) {
    html += `<li><strong>Request ID:</strong> ${requestId.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</li>`;
  }
  
  if (Object.keys(parameters).length > 0) {
    html += '<li><strong>Parameters:</strong><ul>';
    for (const [key, value] of Object.entries(parameters)) {
      html += `<li>${key.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}: ${JSON.stringify(value)}</li>`;
    }
    html += '</ul></li>';
  }
  
  html += '</ul>';
  
  if (content) {
    html += `<p><strong>Details:</strong> ${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
  }
  
  html += '</div>';
  
  return createElement('div', { className, 'data-speaker': speaker }, html);
}

function generateJsonToolRequest(
  tool: string,
  parameters: Record<string, any>,
  requestId: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  const obj: any = { type: 'tool-request', tool };
  
  if (requestId) {
    obj.requestId = requestId;
  }
  
  if (Object.keys(parameters).length > 0) {
    obj.parameters = parameters;
  }
  
  if (content) {
    obj.content = content;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlToolRequest(
  tool: string,
  parameters: Record<string, any>,
  requestId: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let yaml = `type: tool-request\ntool: ${JSON.stringify(tool)}\n`;
  
  if (requestId) {
    yaml += `requestId: ${JSON.stringify(requestId)}\n`;
  }
  
  if (Object.keys(parameters).length > 0) {
    yaml += 'parameters:\n';
    for (const [key, value] of Object.entries(parameters)) {
      yaml += `  ${key}: ${JSON.stringify(value)}\n`;
    }
  }
  
  if (content) {
    yaml += `content: ${JSON.stringify(content)}\n`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlToolRequest(
  tool: string,
  parameters: Record<string, any>,
  requestId: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let xml = '<tool-request';
  xml += ` tool="${tool.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  
  if (requestId) {
    xml += ` requestId="${requestId.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  }
  
  xml += '>';
  
  if (Object.keys(parameters).length > 0) {
    xml += '<parameters>';
    for (const [key, value] of Object.entries(parameters)) {
      xml += `<${key.replace(/[^a-zA-Z0-9]/g, '')}>${JSON.stringify(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</${key.replace(/[^a-zA-Z0-9]/g, '')}>`;
    }
    xml += '</parameters>';
  }
  
  if (content) {
    xml += `<content>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</content>`;
  }
  
  xml += '</tool-request>';
  
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextToolRequest(
  tool: string,
  parameters: Record<string, any>,
  requestId: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let result = 'TOOL REQUEST\n============\n';
  result += `Tool: ${tool}\n`;
  
  if (requestId) {
    result += `Request ID: ${requestId}\n`;
  }
  
  if (Object.keys(parameters).length > 0) {
    result += 'Parameters:\n-----------\n';
    for (const [key, value] of Object.entries(parameters)) {
      result += `${key}: ${JSON.stringify(value)}\n`;
    }
  }
  
  if (content) {
    result += `\nDetails: ${content}\n`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}