import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface ToolResponseProps extends BaseComponentProps {
  /** Tool name */
  tool: string;
  /** Response status */
  status?: 'success' | 'error' | 'pending';
  /** Response data */
  data?: any;
  /** Response error message */
  error?: string;
}

export function ToolResponse(props: ToolResponseProps): Component {
  const {
    tool,
    status = 'success',
    data,
    error,
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
      return generateMarkdownToolResponse(tool, status, data, error, content, className, speaker);
    
    case 'html':
      return generateHtmlToolResponse(tool, status, data, error, content, className, speaker);
    
    case 'json':
      return generateJsonToolResponse(tool, status, data, error, content, className, speaker);
    
    case 'yaml':
      return generateYamlToolResponse(tool, status, data, error, content, className, speaker);
    
    case 'xml':
      return generateXmlToolResponse(tool, status, data, error, content, className, speaker);
    
    case 'text':
    default:
      return generateTextToolResponse(tool, status, data, error, content, className, speaker);
  }
}

function generateMarkdownToolResponse(
  tool: string,
  status: 'success' | 'error' | 'pending',
  data: any,
  error: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  const statusEmoji = {
    success: '✅',
    error: '❌',
    pending: '⏳'
  }[status];
  
  let result = `**${statusEmoji} Tool Response**\n\n`;
  result += `- **Tool**: ${tool}\n`;
  result += `- **Status**: ${status}\n`;
  
  if (data !== undefined) {
    result += `- **Data**: ${JSON.stringify(data, null, 2)}\n`;
  }
  
  if (error) {
    result += `- **Error**: ${error}\n`;
  }
  
  if (content) {
    result += `\n**Details**: ${content}\n`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlToolResponse(
  tool: string,
  status: 'success' | 'error' | 'pending',
  data: any,
  error: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  const statusEmoji = {
    success: '✅',
    error: '❌',
    pending: '⏳'
  }[status];
  
  let html = '<div class="tool-response"';
  if (className) {
    html += ` class="${className}"`;
  }
  if (speaker) {
    html += ` data-speaker="${speaker}"`;
  }
  html += '>';
  
  html += `<h4>${statusEmoji} Tool Response</h4>`;
  html += '<ul>';
  html += `<li><strong>Tool:</strong> ${tool.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</li>`;
  html += `<li><strong>Status:</strong> ${status}</li>`;
  
  if (data !== undefined) {
    html += `<li><strong>Data:</strong> <pre>${JSON.stringify(data, null, 2).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></li>`;
  }
  
  if (error) {
    html += `<li><strong>Error:</strong> ${error.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</li>`;
  }
  
  html += '</ul>';
  
  if (content) {
    html += `<p><strong>Details:</strong> ${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
  }
  
  html += '</div>';
  
  return createElement('div', { className, 'data-speaker': speaker }, html);
}

function generateJsonToolResponse(
  tool: string,
  status: 'success' | 'error' | 'pending',
  data: any,
  error: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  const obj: any = { type: 'tool-response', tool, status };
  
  if (data !== undefined) {
    obj.data = data;
  }
  
  if (error) {
    obj.error = error;
  }
  
  if (content) {
    obj.content = content;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlToolResponse(
  tool: string,
  status: 'success' | 'error' | 'pending',
  data: any,
  error: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let yaml = `type: tool-response\ntool: ${JSON.stringify(tool)}\nstatus: ${JSON.stringify(status)}\n`;
  
  if (data !== undefined) {
    yaml += `data: ${JSON.stringify(data)}\n`;
  }
  
  if (error) {
    yaml += `error: ${JSON.stringify(error)}\n`;
  }
  
  if (content) {
    yaml += `content: ${JSON.stringify(content)}\n`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlToolResponse(
  tool: string,
  status: 'success' | 'error' | 'pending',
  data: any,
  error: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  const statusEmoji = {
    success: '✅',
    error: '❌',
    pending: '⏳'
  }[status];
  
  let xml = `<tool-response tool="${tool.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" status="${status}">`;
  
  if (data !== undefined) {
    xml += `<data>${JSON.stringify(data).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</data>`;
  }
  
  if (error) {
    xml += `<error>${error.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</error>`;
  }
  
  if (content) {
    xml += `<content>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</content>`;
  }
  
  xml += '</tool-response>';
  
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextToolResponse(
  tool: string,
  status: 'success' | 'error' | 'pending',
  data: any,
  error: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  const statusText = {
    success: 'SUCCESS',
    error: 'ERROR',
    pending: 'PENDING'
  }[status];
  
  let result = `TOOL RESPONSE (${statusText})\n=====================\n`;
  result += `Tool: ${tool}\n`;
  result += `Status: ${status}\n`;
  
  if (data !== undefined) {
    result += `Data: ${JSON.stringify(data, null, 2)}\n`;
  }
  
  if (error) {
    result += `Error: ${error}\n`;
  }
  
  if (content) {
    result += `\nDetails: ${content}\n`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}