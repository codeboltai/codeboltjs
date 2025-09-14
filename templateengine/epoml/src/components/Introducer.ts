import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface IntroducerProps extends BaseComponentProps {
      /** Introducer name or title */
      name?: string;
      /** Introducer role or position */
      role?: string;
      /** Introduction text */
      text: string;
      /** Introduction purpose */
      purpose?: string;
      /** Tone of the introduction */
      tone?: 'formal' | 'casual' | 'professional' | 'friendly' | 'enthusiastic';
    
}

export function Introducer(props: IntroducerProps): Component {
      const {
        name,
        role,
        text,
        purpose,
        tone = 'professional',
        syntax = 'markdown',
        className,
        speaker,
        children = []
    
  } = props;

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownIntroducer(name, role, text, purpose, tone, children, className, speaker);
    
    case 'html':
      return generateHtmlIntroducer(name, role, text, purpose, tone, children, className, speaker);
    
    case 'json':
      return generateJsonIntroducer(name, role, text, purpose, tone, children, className, speaker);
    
    case 'yaml':
      return generateYamlIntroducer(name, role, text, purpose, tone, children, className, speaker);
    
    case 'xml':
      return generateXmlIntroducer(name, role, text, purpose, tone, children, className, speaker);
    
    case 'text':
    default:
      return generateTextIntroducer(name, role, text, purpose, tone, children, className, speaker);
  }
}

function generateMarkdownIntroducer(
  name: string | undefined,
  role: string | undefined,
  text: string,
  purpose: string | undefined,
  tone: 'formal' | 'casual' | 'professional' | 'friendly' | 'enthusiastic',
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  // Tone emoji
  const toneEmoji = {
    'formal': '🎩',
    'casual': '😊',
    'professional': '💼',
    'friendly': '👋',
    'enthusiastic': '🎉'
  }[tone];
  
  result += `# ${toneEmoji} Introduction\n
`;
  
  if (name || role) {
    result += `**${name || 'Introducer'}${role ? `, ${role}` : ''}**\n
`;
  }
  
  if (purpose) {
    result += `*Purpose: ${purpose}*\n
`;
  }
  
  result += `${text}\n
`;
  
  // Add children content
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlIntroducer(
  name: string | undefined,
  role: string | undefined,
  text: string,
  purpose: string | undefined,
  tone: 'formal' | 'casual' | 'professional' | 'friendly' | 'enthusiastic',
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  // Tone emoji
  const toneEmoji = {
    'formal': '🎩',
    'casual': '😊',
    'professional': '💼',
    'friendly': '👋',
    'enthusiastic': '🎉'
  }[tone];
  
  let html = `<div class=\"introducer${className ? ` ${className}` : ''}\"${speaker ? ` data-speaker=\"${speaker}\"` : ''}>\
`;
  html += `  <h1>${toneEmoji} Introduction</h1>\
`;
  
  if (name || role) {
    html += `  <p class=\"introducer-info\"><strong>${escapeHtml(name || 'Introducer')}${role ? `, ${escapeHtml(role)}` : ''}</strong></p>\
`;
  }
  
  if (purpose) {
    html += `  <p class=\"introducer-purpose\"><em>Purpose: ${escapeHtml(purpose)}</em></p>\
`;
  }
  
  html += `  <p class=\"introducer-text\">${escapeHtml(text)}</p>\
`;
  
  // Add children content
  if (children.length > 0) {
    html += '  <div class=\"introducer-details\">\
';
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    html += `    ${childrenContent}\
`;
    html += '  </div>\
';
  }
  
  html += '</div>';
  
  return createElement('div', { 'data-speaker': speaker }, html);
}

function generateJsonIntroducer(
  name: string | undefined,
  role: string | undefined,
  text: string,
  purpose: string | undefined,
  tone: 'formal' | 'casual' | 'professional' | 'friendly' | 'enthusiastic',
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  const introducer: any = {
    text,
    tone
  };
  
  if (name) {
    introducer.name = name;
  }
  
  if (role) {
    introducer.role = role;
  }
  
  if (purpose) {
    introducer.purpose = purpose;
  }
  
  // Add children content as a string
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    introducer.details = childrenContent;
  }
  
  if (className) {
    introducer.className = className;
  }
  
  if (speaker) {
    introducer.speaker = speaker;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, JSON.stringify(introducer, null, 2));
}

function generateYamlIntroducer(
  name: string | undefined,
  role: string | undefined,
  text: string,
  purpose: string | undefined,
  tone: 'formal' | 'casual' | 'professional' | 'friendly' | 'enthusiastic',
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  // Tone emoji
  const toneEmoji = {
    'formal': '🎩',
    'casual': '😊',
    'professional': '💼',
    'friendly': '👋',
    'enthusiastic': '🎉'
  }[tone];
  
  let yaml = `text: ${JSON.stringify(text)}\
tone: ${tone}\
`;
  
  if (name) {
    yaml += `name: ${JSON.stringify(name)}\
`;
  }
  
  if (role) {
    yaml += `role: ${JSON.stringify(role)}\
`;
  }
  
  if (purpose) {
    yaml += `purpose: ${JSON.stringify(purpose)}\
`;
  }
  
  // Add children content as a string
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    yaml += `details: |\
${childrenContent.split('\
').map(line => `  ${line}`).join('\
')}`;
  }
  
  if (className) {
    yaml += `\
className: ${JSON.stringify(className)}`;
  }
  
  if (speaker) {
    yaml += `\
speaker: ${JSON.stringify(speaker)}`;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlIntroducer(
  name: string | undefined,
  role: string | undefined,
  text: string,
  purpose: string | undefined,
  tone: 'formal' | 'casual' | 'professional' | 'friendly' | 'enthusiastic',
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let xml = `<introducer tone=\"${tone}\"`;
  
  if (name) {
    xml += ` name=\"${escapeXmlAttr(name)}\"`;
  }
  
  if (role) {
    xml += ` role=\"${escapeXmlAttr(role)}\"`;
  }
  
  if (className) {
    xml += ` class=\"${className}\"`;
  }
  
  if (speaker) {
    xml += ` data-speaker=\"${speaker}\"`;
  }
  
  xml += '>\
';
  
  if (purpose) {
    xml += `  <purpose>${escapeXml(purpose)}</purpose>\
`;
  }
  
  xml += `  <text>${escapeXml(text)}</text>\
`;
  
  // Add children content
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    xml += `  <details>${escapeXml(childrenContent)}</details>\
`;
  }
  
  xml += '</introducer>';
  
  return createElement('pre', { className, 'data-speaker': speaker }, xml);
}

function generateTextIntroducer(
  name: string | undefined,
  role: string | undefined,
  text: string,
  purpose: string | undefined,
  tone: 'formal' | 'casual' | 'professional' | 'friendly' | 'enthusiastic',
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  // Tone emoji
  const toneEmoji = {
    'formal': '🎩',
    'casual': '😊',
    'professional': '💼',
    'friendly': '👋',
    'enthusiastic': '🎉'
  }[tone];
  
  let result = `INTRODUCTION: ${toneEmoji}\
`;
  result += '============\
\
';
  
  if (name || role) {
    result += `${name || 'Introducer'}${role ? `, ${role}` : ''}\
\
`;
  }
  
  if (purpose) {
    result += `Purpose: ${purpose}\
\
`;
  }
  
  result += `${text}\
\
`;
  
  // Add children content
  if (children.length > 0) {
    result += 'Details:\
';
    result += '-------\
';
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXmlAttr(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&apos;');
}