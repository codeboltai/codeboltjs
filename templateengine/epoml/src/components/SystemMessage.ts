import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface SystemMessageProps extends BaseComponentProps {
  /** System message type */
  messageType?: string;
  /** Priority level */
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export function SystemMessage(props: SystemMessageProps): Component {
  const {
    messageType,
    priority,
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
      return generateMarkdownSystemMessage(messageType, priority, content, className, speaker);
    
    case 'html':
      return generateHtmlSystemMessage(messageType, priority, content, className, speaker);
    
    case 'json':
      return generateJsonSystemMessage(messageType, priority, content, className, speaker);
    
    case 'yaml':
      return generateYamlSystemMessage(messageType, priority, content, className, speaker);
    
    case 'xml':
      return generateXmlSystemMessage(messageType, priority, content, className, speaker);
    
    case 'text':
    default:
      return generateTextSystemMessage(messageType, priority, content, className, speaker);
  }
}

function generateMarkdownSystemMessage(
  messageType: string | undefined,
  priority: 'low' | 'medium' | 'high' | 'critical' | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let prefix = '**System**';
  if (messageType) {
    prefix += ` [${messageType}]`;
  }
  if (priority) {
    prefix += ` (${priority})`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, `${prefix}: ${content}`);
}

function generateHtmlSystemMessage(
  messageType: string | undefined,
  priority: 'low' | 'medium' | 'high' | 'critical' | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let html = '<div class="system-message"';
  if (className) {
    html += ` class="${className}"`;
  }
  if (speaker) {
    html += ` data-speaker="${speaker}"`;
  }
  html += '>';
  
  html += '<strong>System</strong>';
  if (messageType) {
    html += ` <em>[${messageType.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}]</em>`;
  }
  if (priority) {
    const priorityClass = `priority-${priority}`;
    html += ` <span class="${priorityClass}">(${priority})</span>`;
  }
  
  html += `: ${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}`;
  html += '</div>';
  
  return createElement('div', { className, 'data-speaker': speaker }, html);
}

function generateJsonSystemMessage(
  messageType: string | undefined,
  priority: 'low' | 'medium' | 'high' | 'critical' | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  const obj: any = { type: 'system-message', content };
  
  if (messageType) {
    obj.messageType = messageType;
  }
  
  if (priority) {
    obj.priority = priority;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlSystemMessage(
  messageType: string | undefined,
  priority: 'low' | 'medium' | 'high' | 'critical' | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let yaml = 'type: system-message\ncontent: ${JSON.stringify(content)}\n';
  
  if (messageType) {
    yaml += `messageType: ${JSON.stringify(messageType)}\n`;
  }
  
  if (priority) {
    yaml += `priority: ${JSON.stringify(priority)}\n`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlSystemMessage(
  messageType: string | undefined,
  priority: 'low' | 'medium' | 'high' | 'critical' | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let xml = '<system-message';
  
  if (messageType) {
    xml += ` messageType="${messageType.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  }
  
  if (priority) {
    xml += ` priority="${priority}"`;
  }
  
  xml += `>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</system-message>`;
  
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextSystemMessage(
  messageType: string | undefined,
  priority: 'low' | 'medium' | 'high' | 'critical' | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let prefix = 'System';
  if (messageType) {
    prefix += ` [${messageType}]`;
  }
  if (priority) {
    prefix += ` (${priority})`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, `${prefix}: ${content}`);
}