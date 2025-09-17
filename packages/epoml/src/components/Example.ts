import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';
import { escapeHtml, escapeXml, escapeXmlAttr, repeatChar, processTemplateVars } from '../utils';
import { render } from '../core/renderer';

export interface ExampleProps extends BaseComponentProps {
  /** Title for the example */
  title?: string;
  /** Description of the example */
  description?: string;
  /** Category or topic of the example */
  category?: string;
  /** Difficulty level */
  difficulty?: string;
  /** Whether this is a best practice example */
  bestPractice?: boolean;
}

export async function Example(props: ExampleProps): Promise<Component> {
  const {
    title,
    description,
    category,
    difficulty,
    bestPractice = false,
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return await generateMarkdownExample(title, description, category, difficulty, bestPractice, children, className, speaker);
    
    case 'html':
      return await generateHtmlExample(title, description, category, difficulty, bestPractice, children, className, speaker);
    
    case 'json':
      return await generateJsonExample(title, description, category, difficulty, bestPractice, children, className, speaker);
    
    case 'yaml':
      return await generateYamlExample(title, description, category, difficulty, bestPractice, children, className, speaker);
    
    case 'xml':
      return await generateXmlExample(title, description, category, difficulty, bestPractice, children, className, speaker);
    
    case 'text':
    default:
      return await generateTextExample(title, description, category, difficulty, bestPractice, children, className, speaker);
  }
}

async function generateMarkdownExample(
  title: string | undefined,
  description: string | undefined,
  category: string | undefined,
  difficulty: string | undefined,
  bestPractice: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  // Difficulty emoji
  const difficultyEmoji = difficulty ? {
    'beginner': '🟢',
    'intermediate': '🟡',
    'advanced': '🔴'
  }[difficulty] || '' : '';
  
  // Best practice marker
  const bestPracticeMarker = bestPractice ? ' ⭐' : '';
  
  let result = '';
  result += `**📝 Example${title ? `: ${title}` : ''}${bestPracticeMarker} ${difficultyEmoji}**\n\n`;
  
  if (description) {
    result += `**Description:** ${description}\n\n`;
  }
  
  if (category) {
    result += `**Category:** ${category}\n\n`;
  }
  if (difficulty) {
    result += `**Difficulty:** ${difficulty}\n\n`;
  }
  // Add children content (the example content)
  if (children.length > 0) {
    const childrenContent = (await Promise.all(children.map(render))).join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

async function generateHtmlExample(
  title: string | undefined,
  description: string | undefined,
  category: string | undefined,
  difficulty: string | undefined,
  bestPractice: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  // Difficulty emoji
  const difficultyEmoji = difficulty ? {
    'beginner': '🟢',
    'intermediate': '🟡',
    'advanced': '🔴'
  }[difficulty] || '' : '';
  
  // Best practice marker
  const bestPracticeMarker = bestPractice ? ' ⭐' : '';
  
  let html = `<div class="example${className ? ` ${className}` : ''}"${speaker ? ` data-speaker="${speaker}"` : ''}>\n`;
  html += `  <h2>📝 Example${title ? `: ${escapeHtml(title)}` : ''}${bestPracticeMarker} ${difficultyEmoji}</h2>\n`;
  
  if (description) {
    html += `  <p class="example-description"><strong>Description:</strong> ${escapeHtml(description)}</p>\n`;
  }
  
  if (category) {
    html += `  <p class="example-category"><strong>Category:</strong> ${escapeHtml(category)}</p>\n`;
  }
  
  if (difficulty) {
    html += `  <p class="example-difficulty"><strong>Difficulty:</strong> ${difficulty}</p>\n`;
  }
  
  // Add children content (the example content)
  if (children.length > 0) {
    html += '  <div class="example-content">\n';
    const childrenContent = (await Promise.all(children.map(render))).join('');
    html += `    ${childrenContent}\n`;
    html += '  </div>\n';
  }
  
  html += '</div>';
  
  return createElement('div', { 'data-speaker': speaker }, html);
}

async function generateJsonExample(
  title: string | undefined,
  description: string | undefined,
  category: string | undefined,
  difficulty: string | undefined,
  bestPractice: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  const childrenContent = (await Promise.all(children.map(render))).join('');
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify({
    type: 'example',
    title,
    description,
    category,
    difficulty,
    bestPractice,
    content: childrenContent
  }, null, 2));
}

async function generateYamlExample(
  title: string | undefined,
  description: string | undefined,
  category: string | undefined,
  difficulty: string | undefined,
  bestPractice: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  const childrenContent = (await Promise.all(children.map(render))).join('');
  let yaml = `type: example\ntitle: ${title ? JSON.stringify(title) : 'null'}\n`;
  if (description) yaml += `description: ${JSON.stringify(description)}\n`;
  if (category) yaml += `category: ${JSON.stringify(category)}\n`;
  if (difficulty) yaml += `difficulty: ${difficulty}\n`;
  yaml += `bestPractice: ${bestPractice}\n`;
  yaml += `content: ${JSON.stringify(childrenContent)}\n`;
  
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

async function generateXmlExample(
  title: string | undefined,
  description: string | undefined,
  category: string | undefined,
  difficulty: string | undefined,
  bestPractice: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  const childrenContent = (await Promise.all(children.map(render))).join('');
  let xml = `<example${className ? ` class="${escapeXmlAttr(className)}"` : ''}${speaker ? ` data-speaker="${escapeXmlAttr(speaker)}"` : ''}>\n`;
  if (title) xml += `  <title>${escapeXml(title)}</title>\n`;
  if (description) xml += `  <description>${escapeXml(description)}</description>\n`;
  if (category) xml += `  <category>${escapeXml(category)}</category>\n`;
  if (difficulty) xml += `  <difficulty>${escapeXml(difficulty)}</difficulty>\n`;
  xml += `  <bestPractice>${bestPractice}</bestPractice>\n`;
  xml += `  <content>${escapeXml(childrenContent)}</content>\n`;
  xml += `</example>`;
  
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

async function generateTextExample(
  title: string | undefined,
  description: string | undefined,
  category: string | undefined,
  difficulty: string | undefined,
  bestPractice: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  let result = '';
  result += `EXAMPLE: 📝${title ? ` ${title}` : ''}${bestPractice ? ' ⭐' : ''}\n`;
  result += repeatChar('=', Math.max(20, title ? title.length + 15 : 20)) + '\n\n';
  
  if (description) {
    result += `Description: ${description}\n\n`;
  }
  
  if (category) {
    result += `Category: ${category}\n\n`;
  }
  
  result += `Difficulty: ${difficulty}\n\n`;
  
  if (children.length > 0) {
    result += 'Content:\n';
    result += '-------\n';
    const childrenContent = (await Promise.all(children.map(render))).join('');
    result += childrenContent;
    result += '\n';
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}