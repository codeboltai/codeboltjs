import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface MessageContextProps extends BaseComponentProps {
  /** Context description */
  description?: string;
  /** Context metadata */
  metadata?: Record<string, any>;
}

export function MessageContext(props: MessageContextProps): Component {
  const {
    description,
    metadata = {},
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
      return generateMarkdownMessageContext(description, metadata, content, className, speaker);
    
    case 'html':
      return generateHtmlMessageContext(description, metadata, content, className, speaker);
    
    case 'json':
      return generateJsonMessageContext(description, metadata, content, className, speaker);
    
    case 'yaml':
      return generateYamlMessageContext(description, metadata, content, className, speaker);
    
    case 'xml':
      return generateXmlMessageContext(description, metadata, content, className, speaker);
    
    case 'text':
    default:
      return generateTextMessageContext(description, metadata, content, className, speaker);
  }
}

function generateMarkdownMessageContext(
  description: string | undefined,
  metadata: Record<string, any>,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  if (description) {
    result += `**Context**: ${description}\n\n`;
  }
  
  if (Object.keys(metadata).length > 0) {
    result += '**Metadata**:\n';
    for (const [key, value] of Object.entries(metadata)) {
      result += `- ${key}: ${JSON.stringify(value)}\n`;
    }
    result += '\n';
  }
  
  if (content) {
    result += `**Content**: ${content}\n`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlMessageContext(
  description: string | undefined,
  metadata: Record<string, any>,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let html = '<div class="message-context"';
  if (className) {
    html += ` class="${className}"`;
  }
  if (speaker) {
    html += ` data-speaker="${speaker}"`;
  }
  html += '>';
  
  if (description) {
    html += `<h4>Context: ${description.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h4>`;
  }
  
  if (Object.keys(metadata).length > 0) {
    html += '<h5>Metadata</h5><ul>';
    for (const [key, value] of Object.entries(metadata)) {
      html += `<li><strong>${key.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}:</strong> ${JSON.stringify(value)}</li>`;
    }
    html += '</ul>';
  }
  
  if (content) {
    html += `<p><strong>Content:</strong> ${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
  }
  
  html += '</div>';
  
  return createElement('div', { className, 'data-speaker': speaker }, html);
}

function generateJsonMessageContext(
  description: string | undefined,
  metadata: Record<string, any>,
  content: string,
  className?: string,
  speaker?: string
): Component {
  const obj: any = { type: 'message-context' };
  
  if (description) {
    obj.description = description;
  }
  
  if (Object.keys(metadata).length > 0) {
    obj.metadata = metadata;
  }
  
  if (content) {
    obj.content = content;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlMessageContext(
  description: string | undefined,
  metadata: Record<string, any>,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let yaml = 'type: message-context\n';
  
  if (description) {
    yaml += `description: ${JSON.stringify(description)}\n`;
  }
  
  if (Object.keys(metadata).length > 0) {
    yaml += 'metadata:\n';
    for (const [key, value] of Object.entries(metadata)) {
      yaml += `  ${key}: ${JSON.stringify(value)}\n`;
    }
  }
  
  if (content) {
    yaml += `content: ${JSON.stringify(content)}\n`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlMessageContext(
  description: string | undefined,
  metadata: Record<string, any>,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let xml = '<message-context';
  
  if (description) {
    xml += ` description="${description.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  }
  
  xml += '>';
  
  if (Object.keys(metadata).length > 0) {
    xml += '<metadata>';
    for (const [key, value] of Object.entries(metadata)) {
      xml += `<${key.replace(/[^a-zA-Z0-9]/g, '')}>${JSON.stringify(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</${key.replace(/[^a-zA-Z0-9]/g, '')}>`;
    }
    xml += '</metadata>';
  }
  
  if (content) {
    xml += `<content>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</content>`;
  }
  
  xml += '</message-context>';
  
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextMessageContext(
  description: string | undefined,
  metadata: Record<string, any>,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let result = 'MESSAGE CONTEXT\n===============\n';
  
  if (description) {
    result += `Description: ${description}\n\n`;
  }
  
  if (Object.keys(metadata).length > 0) {
    result += 'Metadata:\n---------\n';
    for (const [key, value] of Object.entries(metadata)) {
      result += `${key}: ${JSON.stringify(value)}\n`;
    }
    result += '\n';
  }
  
  if (content) {
    result += `Content: ${content}\n`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}