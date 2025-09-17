import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';
import { escapeHtml, escapeXml, processTemplateVars, repeatChar } from '../utils';

export interface TaskProps extends BaseComponentProps {
  /** Task ID */
  id?: string;
  /** Task title */
  title?: string;
  /** Task description */
  description?: string;
  /** Task status */
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  /** Task priority */
  priority?: 'low' | 'medium' | 'high' | 'critical';
  /** Task assignee */
  assignee?: string;
  /** Task due date */
  dueDate?: string;
  /** Whether the task is blocked */
  blocked?: boolean;
  /** Template variables for dynamic content */
  templateVars?: Record<string, any>;
}

export function Task(props: TaskProps): Component {
  const {
    id,
    title,
    description,
    status = 'pending',
    priority = 'medium',
    assignee,
    dueDate,
    blocked = false,
    templateVars = {},
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  // Process template variables in text content
  const processedTitle = title ? processTemplateVars(title, templateVars) : title;
  const processedDescription = description ? processTemplateVars(description, templateVars) : description;
  const processedAssignee = assignee ? processTemplateVars(assignee, templateVars) : assignee;

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownTask(id, processedTitle, processedDescription, status, priority, processedAssignee, dueDate, blocked, children, className, speaker);
    
    case 'html':
      return generateHtmlTask(id, processedTitle, processedDescription, status, priority, processedAssignee, dueDate, blocked, children, className, speaker);
    
    case 'json':
      return generateJsonTask(id, processedTitle, processedDescription, status, priority, processedAssignee, dueDate, blocked, children, className, speaker);
    
    case 'yaml':
      return generateYamlTask(id, processedTitle, processedDescription, status, priority, processedAssignee, dueDate, blocked, children, className, speaker);
    
    case 'xml':
      return generateXmlTask(id, processedTitle, processedDescription, status, priority, processedAssignee, dueDate, blocked, children, className, speaker);
    
    case 'text':
    default:
      return generateTextTask(id, processedTitle, processedDescription, status, priority, processedAssignee, dueDate, blocked, children, className, speaker);
  }
}

function generateMarkdownTask(
  id: string | undefined,
  title: string | undefined,
  description: string | undefined,
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled',
  priority: 'low' | 'medium' | 'high' | 'critical',
  assignee: string | undefined,
  dueDate: string | undefined,
  blocked: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  // Status emoji
  const statusEmoji = {
    'pending': '⏳',
    'in-progress': '🔄',
    'completed': '✅',
    'cancelled': '❌'
  }[status];
  
  // Priority emoji
  const priorityEmoji = {
    'low': '🔽',
    'medium': '🔸',
    'high': '🔺',
    'critical': '🔴'
  }[priority];
  
  result += `## ${statusEmoji} ${priorityEmoji} ${title || 'Untitled Task'}${id ? ` (${id})` : ''}
`;
  
  if (description) {
    result += `**Description:** ${description}

`;
  }
  
  result += `**Status:** ${status}
`;
  result += `**Priority:** ${priority}
`;
  
  if (assignee) {
    result += `**Assignee:** ${assignee}
`;
  }
  
  if (dueDate) {
    result += `**Due Date:** ${dueDate}
`;
  }
  
  if (blocked) {
    result += `**Blocked:** Yes
`;
  }
  
  // Add children content
  if (children.length > 0) {
    result += `
**Details:**
`;
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlTask(
  id: string | undefined,
  title: string | undefined,
  description: string | undefined,
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled',
  priority: 'low' | 'medium' | 'high' | 'critical',
  assignee: string | undefined,
  dueDate: string | undefined,
  blocked: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  // Status emoji
  const statusEmoji = {
    'pending': '⏳',
    'in-progress': '🔄',
    'completed': '✅',
    'cancelled': '❌'
  }[status];
  
  // Priority emoji
  const priorityEmoji = {
    'low': '🔽',
    'medium': '🔸',
    'high': '🔺',
    'critical': '🔴'
  }[priority];
  
  let html = `<div class="task${className ? ` ${className}` : ''}"${speaker ? ` data-speaker="${speaker}"` : ''}>
`;
  html += `  <h2>${statusEmoji} ${priorityEmoji} ${escapeHtml(title || 'Untitled Task')}${id ? ` <small>(${id})</small>` : ''}</h2>
`;
  
  if (description) {
    html += `  <p><strong>Description:</strong> ${escapeHtml(description)}</p>
`;
  }
  
  html += '  <ul>\n';
  html += `    <li><strong>Status:</strong> ${status}</li>\n`;
  html += `    <li><strong>Priority:</strong> ${priority}</li>\n`;
  
  if (assignee) {
    html += `    <li><strong>Assignee:</strong> ${escapeHtml(assignee)}</li>\n`;
  }
  
  if (dueDate) {
    html += `    <li><strong>Due Date:</strong> ${escapeHtml(dueDate)}</li>\n`;
  }
  
  if (blocked) {
    html += `    <li><strong>Blocked:</strong> Yes</li>\n`;
  }
  
  html += '  </ul>\n';
  
  // Add children content
  if (children.length > 0) {
    html += '  <div class="task-details">\n';
    html += '    <h3>Details</h3>\n';
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    html += `    ${childrenContent}\n`;
    html += '  </div>\n';
  }
  
  html += '</div>';
  
  return createElement('div', { 'data-speaker': speaker }, html);
}

function generateJsonTask(
  id: string | undefined,
  title: string | undefined,
  description: string | undefined,
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled',
  priority: 'low' | 'medium' | 'high' | 'critical',
  assignee: string | undefined,
  dueDate: string | undefined,
  blocked: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  const task: any = {
    status,
    priority
  };
  
  if (id) {
    task.id = id;
  }
  
  if (title) {
    task.title = title;
  }
  
  if (description) {
    task.description = description;
  }
  
  if (assignee) {
    task.assignee = assignee;
  }
  
  if (dueDate) {
    task.dueDate = dueDate;
  }
  
  task.blocked = blocked;
  
  // Add children content as a string
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    task.details = childrenContent;
  }
  
  if (className) {
    task.className = className;
  }
  
  if (speaker) {
    task.speaker = speaker;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, JSON.stringify(task, null, 2));
}

function generateYamlTask(
  id: string | undefined,
  title: string | undefined,
  description: string | undefined,
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled',
  priority: 'low' | 'medium' | 'high' | 'critical',
  assignee: string | undefined,
  dueDate: string | undefined,
  blocked: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let yaml = `status: ${status}
priority: ${priority}
`;
  
  if (id) {
    yaml += `id: ${JSON.stringify(id)}
`;
  }
  
  if (title) {
    yaml += `title: ${JSON.stringify(title)}
`;
  }
  
  if (description) {
    yaml += `description: ${JSON.stringify(description)}
`;
  }
  
  if (assignee) {
    yaml += `assignee: ${JSON.stringify(assignee)}
`;
  }
  
  if (dueDate) {
    yaml += `dueDate: ${JSON.stringify(dueDate)}
`;
  }
  
  yaml += `blocked: ${blocked}
`;
  
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

function generateXmlTask(
  id: string | undefined,
  title: string | undefined,
  description: string | undefined,
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled',
  priority: 'low' | 'medium' | 'high' | 'critical',
  assignee: string | undefined,
  dueDate: string | undefined,
  blocked: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let xml = `<task status="${status}" priority="${priority}"`;
  
  if (id) {
    xml += ` id="${id}"`;
  }
  
  if (className) {
    xml += ` class="${className}"`;
  }
  
  if (speaker) {
    xml += ` data-speaker="${speaker}"`;
  }
  
  xml += '>\n';
  
  if (title) {
    xml += `  <title>${escapeXml(title)}</title>\n`;
  }
  
  if (description) {
    xml += `  <description>${escapeXml(description)}</description>\n`;
  }
  
  if (assignee) {
    xml += `  <assignee>${escapeXml(assignee)}</assignee>\n`;
  }
  
  if (dueDate) {
    xml += `  <dueDate>${escapeXml(dueDate)}</dueDate>\n`;
  }
  
  xml += `  <blocked>${blocked}</blocked>\n`;
  
  // Add children content
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    xml += `  <details>${escapeXml(childrenContent)}</details>\n`;
  }
  
  xml += '</task>';
  
  return createElement('pre', { className, 'data-speaker': speaker }, xml);
}

function generateTextTask(
  id: string | undefined,
  title: string | undefined,
  description: string | undefined,
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled',
  priority: 'low' | 'medium' | 'high' | 'critical',
  assignee: string | undefined,
  dueDate: string | undefined,
  blocked: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  // Status emoji
  const statusEmoji = {
    'pending': '⏳',
    'in-progress': '🔄',
    'completed': '✅',
    'cancelled': '❌'
  }[status];
  
  // Priority emoji
  const priorityEmoji = {
    'low': '🔽',
    'medium': '🔸',
    'high': '🔺',
    'critical': '🔴'
  }[priority];
  
  let result = `TASK: ${statusEmoji} ${priorityEmoji} ${title || 'Untitled Task'}${id ? ` (${id})` : ''}\n`;
  result += repeatChar('-', Math.max(5, (title?.length || 12) + 10)) + '\n\n';
  
  if (description) {
    result += `Description: ${description}\n\n`;
  }
  
  result += `Status: ${status}\n`;
  result += `Priority: ${priority}\n`;
  
  if (assignee) {
    result += `Assignee: ${assignee}\n`;
  }
  
  if (dueDate) {
    result += `Due Date: ${dueDate}\n`;
  }
  
  if (blocked) {
    result += `Blocked: Yes\n`;
  }
  
  // Add children content
  if (children.length > 0) {
    result += `\nDetails:\n`;
    result += '-------\n';
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

