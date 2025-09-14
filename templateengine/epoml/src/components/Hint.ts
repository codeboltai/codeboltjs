import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface HintProps extends BaseComponentProps {
  /** Hint text */
  text: string;
  /** Hint type or category */
  type?: 'tip' | 'warning' | 'note' | 'important' | 'caution';
  /** Hint title */
  title?: string;
  /** Related topic or concept */
  topic?: string;
  /** Difficulty level */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export function Hint(props: HintProps): Component {
  const {
    text,
    type = 'tip',
    title,
    topic,
    difficulty = 'beginner',
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownHint(text, type, title, topic, difficulty, children, className, speaker);
    
    case 'html':
      return generateHtmlHint(text, type, title, topic, difficulty, children, className, speaker);
    
    case 'json':
      return generateJsonHint(text, type, title, topic, difficulty, children, className, speaker);
    
    case 'yaml':
      return generateYamlHint(text, type, title, topic, difficulty, children, className, speaker);
    
    case 'xml':
      return generateXmlHint(text, type, title, topic, difficulty, children, className, speaker);
    
    case 'text':
    default:
      return generateTextHint(text, type, title, topic, difficulty, children, className, speaker);
  }
}

function generateMarkdownHint(
  text: string,
  type: 'tip' | 'warning' | 'note' | 'important' | 'caution',
  title: string | undefined,
  topic: string | undefined,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  // Type emoji and style
  const typeConfig = {
    'tip': { emoji: '💡', style: 'tip' },
    'warning': { emoji: '⚠️', style: 'warning' },
    'note': { emoji: '📝', style: 'note' },
    'important': { emoji: '❗', style: 'important' },
    'caution': { emoji: '⛔', style: 'caution' }
  }[type];
  
  // Difficulty emoji
  const difficultyEmoji = {
    'beginner': '🟢',
    'intermediate': '🟡',
    'advanced': '🔴'
  }[difficulty];
  
  let result = '';
  result += `> ${typeConfig.emoji} **${title || type.charAt(0).toUpperCase() + type.slice(1)}** ${difficultyEmoji}\n`;
  result += `> \n`;
  result += `> ${text}\n`;
  
  if (topic) {
    result += `> \n`;
    result += `> *Topic: ${topic}*\n`;
  }
  
  result += '\n';
  
  // Add children content
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlHint(
  text: string,
  type: 'tip' | 'warning' | 'note' | 'important' | 'caution',
  title: string | undefined,
  topic: string | undefined,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  // Type emoji and style
  const typeConfig = {
    'tip': { emoji: '💡', style: 'tip' },
    'warning': { emoji: '⚠️', style: 'warning' },
    'note': { emoji: '📝', style: 'note' },
    'important': { emoji: '❗', style: 'important' },
    'caution': { emoji: '⛔', style: 'caution' }
  }[type];
  
  // Difficulty emoji
  const difficultyEmoji = {
    'beginner': '🟢',
    'intermediate': '🟡',
    'advanced': '🔴'
  }[difficulty];
  
  let html = `<div class="hint hint--${typeConfig.style}${className ? ` ${className}` : ''}"${speaker ? ` data-speaker="${speaker}"` : ''}>\n`;
  html += `  <div class="hint-header">\n`;
  html += `    <span class="hint-icon">${typeConfig.emoji}</span>\n`;
  html += `    <strong class="hint-title">${escapeHtml(title || type.charAt(0).toUpperCase() + type.slice(1))}</strong>\n`;
  html += `    <span class="hint-difficulty">${difficultyEmoji}</span>\n`;
  html += `  </div>\n`;
  html += `  <div class="hint-content">\n`;
  html += `    <p class="hint-text">${escapeHtml(text)}</p>\n`;
  
  if (topic) {
    html += `    <p class="hint-topic"><em>Topic: ${escapeHtml(topic)}</em></p>\n`;
  }
  
  html += `  </div>\n`;
  
  // Add children content
  if (children.length > 0) {
    html += '  <div class="hint-details">\n';
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    html += `    ${childrenContent}\n`;
    html += '  </div>\n';
  }
  
  html += '</div>';
  
  return createElement('div', { 'data-speaker': speaker }, html);
}

function generateJsonHint(
  text: string,
  type: 'tip' | 'warning' | 'note' | 'important' | 'caution',
  title: string | undefined,
  topic: string | undefined,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  const hint: any = {
    text,
    type,
    difficulty
  };
  
  if (title) {
    hint.title = title;
  }
  
  if (topic) {
    hint.topic = topic;
  }
  
  // Add children content as a string
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    hint.details = childrenContent;
  }
  
  if (className) {
    hint.className = className;
  }
  
  if (speaker) {
    hint.speaker = speaker;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, JSON.stringify(hint, null, 2));
}

function generateYamlHint(
  text: string,
  type: 'tip' | 'warning' | 'note' | 'important' | 'caution',
  title: string | undefined,
  topic: string | undefined,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  // Type emoji
  const typeConfig = {
    'tip': { emoji: '💡' },
    'warning': { emoji: '⚠️' },
    'note': { emoji: '📝' },
    'important': { emoji: '❗' },
    'caution': { emoji: '⛔' }
  }[type];
  
  // Difficulty emoji
  const difficultyEmoji = {
    'beginner': '🟢',
    'intermediate': '🟡',
    'advanced': '🔴'
  }[difficulty];
  
  let yaml = `text: ${JSON.stringify(text)}\ntype: ${type}\ndifficulty: ${difficulty}\n`;
  
  if (title) {
    yaml += `title: ${JSON.stringify(title)}\n`;
  }
  
  if (topic) {
    yaml += `topic: ${JSON.stringify(topic)}\n`;
  }
  
  // Add children content as a string
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    yaml += `details: |\n${childrenContent.split('\n').map(line => `  ${line}`).join('\n')}`;
  }
  
  if (className) {
    yaml += `\nclassName: ${JSON.stringify(className)}`;
  }
  
  if (speaker) {
    yaml += `\nspeaker: ${JSON.stringify(speaker)}`;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlHint(
  text: string,
  type: 'tip' | 'warning' | 'note' | 'important' | 'caution',
  title: string | undefined,
  topic: string | undefined,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let xml = `<hint text="${escapeXmlAttr(text)}" type="${type}" difficulty="${difficulty}"`;
  
  if (title) {
    xml += ` title="${escapeXmlAttr(title)}"`;
  }
  
  if (topic) {
    xml += ` topic="${escapeXmlAttr(topic)}"`;
  }
  
  if (className) {
    xml += ` class="${className}"`;
  }
  
  if (speaker) {
    xml += ` data-speaker="${speaker}"`;
  }
  
  xml += '>\n';
  
  // Add children content
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    xml += `  <details>${escapeXml(childrenContent)}</details>\n`;
  }
  
  xml += '</hint>';
  
  return createElement('pre', { className, 'data-speaker': speaker }, xml);
}

function generateTextHint(
  text: string,
  type: 'tip' | 'warning' | 'note' | 'important' | 'caution',
  title: string | undefined,
  topic: string | undefined,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  // Type emoji
  const typeConfig = {
    'tip': { emoji: '💡' },
    'warning': { emoji: '⚠️' },
    'note': { emoji: '📝' },
    'important': { emoji: '❗' },
    'caution': { emoji: '⛔' }
  }[type];
  
  // Difficulty emoji
  const difficultyEmoji = {
    'beginner': '🟢',
    'intermediate': '🟡',
    'advanced': '🔴'
  }[difficulty];
  
  let result = `${typeConfig.emoji} ${title || type.charAt(0).toUpperCase() + type.slice(1)} ${difficultyEmoji}\n`;
  result += '-'.repeat(Math.max(5, (title?.length || type.length) + 5)) + '\n';
  result += `${text}\n\n`;
  
  if (topic) {
    result += `Topic: ${topic}\n\n`;
  }
  
  // Add children content
  if (children.length > 0) {
    result += 'Details:\n';
    result += '-------\n';
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
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXmlAttr(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}