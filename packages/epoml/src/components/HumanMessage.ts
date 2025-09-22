import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface HumanMessageProps extends BaseComponentProps {
  /** Name of the human user */
  name?: string;
  /** User ID */
  userId?: string;
}

export function HumanMessage(props: HumanMessageProps): Component {
  const {
    name = 'Human',
    userId,
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
      return generateMarkdownHumanMessage(name, userId, content, className, speaker);
    
    case 'html':
      return generateHtmlHumanMessage(name, userId, content, className, speaker);
    
    case 'json':
      return generateJsonHumanMessage(name, userId, content, className, speaker);
    
    case 'yaml':
      return generateYamlHumanMessage(name, userId, content, className, speaker);
    
    case 'xml':
      return generateXmlHumanMessage(name, userId, content, className, speaker);
    
    case 'text':
    default:
      return generateTextHumanMessage(name, userId, content, className, speaker);
  }
}

function generateMarkdownHumanMessage(
  name: string,
  userId: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let prefix = `**${name}**`;
  if (userId) {
    prefix += ` (${userId})`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, `${prefix}: ${content}`);
}

function generateHtmlHumanMessage(
  name: string,
  userId: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let html = '<div class="human-message"';
  if (className) {
    html += ` class="${className}"`;
  }
  if (speaker) {
    html += ` data-speaker="${speaker}"`;
  }
  html += '>';
  
  html += `<strong>${name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</strong>`;
  if (userId) {
    html += ` <em>(${userId.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')})</em>`;
  }
  
  html += `: ${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}`;
  html += '</div>';
  
  return createElement('div', { className, 'data-speaker': speaker }, html);
}

function generateJsonHumanMessage(
  name: string,
  userId: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  const obj: any = { type: 'human-message', name, content };
  
  if (userId) {
    obj.userId = userId;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlHumanMessage(
  name: string,
  userId: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let yaml = `type: human-message\nname: ${JSON.stringify(name)}\ncontent: ${JSON.stringify(content)}\n`;
  
  if (userId) {
    yaml += `userId: ${JSON.stringify(userId)}\n`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlHumanMessage(
  name: string,
  userId: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let xml = '<human-message';
  
  xml += ` name="${name.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  
  if (userId) {
    xml += ` userId="${userId.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  }
  
  xml += `>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</human-message>`;
  
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextHumanMessage(
  name: string,
  userId: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let prefix = name;
  if (userId) {
    prefix += ` (${userId})`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, `${prefix}: ${content}`);
}