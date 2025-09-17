import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface ConversationProps extends BaseComponentProps {
  /** Title of the conversation */
  title?: string;
  /** Participants in the conversation */
  participants?: string[];
}

export function Conversation(props: ConversationProps): Component {
  const {
    title,
    participants = [],
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
      return generateMarkdownConversation(title, participants, content, className, speaker);
    
    case 'html':
      return generateHtmlConversation(title, participants, content, className, speaker);
    
    case 'json':
      return generateJsonConversation(title, participants, content, className, speaker);
    
    case 'yaml':
      return generateYamlConversation(title, participants, content, className, speaker);
    
    case 'xml':
      return generateXmlConversation(title, participants, content, className, speaker);
    
    case 'text':
    default:
      return generateTextConversation(title, participants, content, className, speaker);
  }
}

function generateMarkdownConversation(
  title: string | undefined,
  participants: string[],
  content: string,
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  if (title) {
    result += `### ${title}\n\n`;
  }
  
  if (participants.length > 0) {
    result += `**Participants:** ${participants.join(', ')}\n\n`;
  }
  
  result += `---\n${content}\n---\n`;
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlConversation(
  title: string | undefined,
  participants: string[],
  content: string,
  className?: string,
  speaker?: string
): Component {
  let html = '<div class="conversation">';
  
  if (title) {
    html += `<h3>${title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h3>`;
  }
  
  if (participants.length > 0) {
    html += `<p><strong>Participants:</strong> ${participants.map(p => p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')).join(', ')}</p>`;
  }
  
  html += `<div class="conversation-content">${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
  html += '</div>';
  
  return createElement('div', { className, 'data-speaker': speaker }, html);
}

function generateJsonConversation(
  title: string | undefined,
  participants: string[],
  content: string,
  className?: string,
  speaker?: string
): Component {
  const obj: any = { type: 'conversation', content };
  
  if (title) {
    obj.title = title;
  }
  
  if (participants.length > 0) {
    obj.participants = participants;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlConversation(
  title: string | undefined,
  participants: string[],
  content: string,
  className?: string,
  speaker?: string
): Component {
  let yaml = 'type: conversation\n';
  
  if (title) {
    yaml += `title: ${JSON.stringify(title)}\n`;
  }
  
  if (participants.length > 0) {
    yaml += `participants:\n${participants.map(p => `  - ${JSON.stringify(p)}`).join('\n')}\n`;
  }
  
  yaml += `content: ${JSON.stringify(content)}`;
  
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlConversation(
  title: string | undefined,
  participants: string[],
  content: string,
  className?: string,
  speaker?: string
): Component {
  let xml = '<conversation';
  
  if (title) {
    xml += ` title="${title.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  }
  
  xml += '>';
  
  if (participants.length > 0) {
    xml += `<participants>${participants.map(p => `<participant>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</participant>`).join('')}</participants>`;
  }
  
  xml += `<content>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</content>`;
  xml += '</conversation>';
  
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextConversation(
  title: string | undefined,
  participants: string[],
  content: string,
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  if (title) {
    result += `CONVERSATION: ${title}\n${'='.repeat(Math.max(12, title.length + 12))}\n\n`;
  } else {
    result += 'CONVERSATION\n============\n\n';
  }
  
  if (participants.length > 0) {
    result += `Participants: ${participants.join(', ')}\n\n`;
  }
  
  result += `${content}\n`;
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}