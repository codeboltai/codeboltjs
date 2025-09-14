import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface RoleProps extends BaseComponentProps {
  /** Role name */
  name: string;
  /** Role description */
  description?: string;
  /** Role responsibilities */
  responsibilities?: string[];
  /** Role permissions */
  permissions?: string[];
  /** Whether this role is active */
  active?: boolean;
}

export function Role(props: RoleProps): Component {
  const {
    name,
    description,
    responsibilities = [],
    permissions = [],
    active = true,
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownRole(name, description, responsibilities, permissions, active, children, className, speaker);
    
    case 'html':
      return generateHtmlRole(name, description, responsibilities, permissions, active, children, className, speaker);
    
    case 'json':
      return generateJsonRole(name, description, responsibilities, permissions, active, children, className, speaker);
    
    case 'yaml':
      return generateYamlRole(name, description, responsibilities, permissions, active, children, className, speaker);
    
    case 'xml':
      return generateXmlRole(name, description, responsibilities, permissions, active, children, className, speaker);
    
    case 'text':
    default:
      return generateTextRole(name, description, responsibilities, permissions, active, children, className, speaker);
  }
}

function generateMarkdownRole(
  name: string,
  description: string | undefined,
  responsibilities: string[],
  permissions: string[],
  active: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  const statusEmoji = active ? '✅' : '❌';
  result += `# ${statusEmoji} Role: ${name}\n\n`;
  
  if (description) {
    result += `**Description:** ${description}\n\n`;
  }
  
  if (responsibilities.length > 0) {
    result += '## Responsibilities\n\n';
    responsibilities.forEach(resp => {
      result += `- ${resp}\n`;
    });
    result += '\n';
  }
  
  if (permissions.length > 0) {
    result += '## Permissions\n\n';
    permissions.forEach(perm => {
      result += `- ${perm}\n`;
    });
    result += '\n';
  }
  
  // Add children content
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlRole(
  name: string,
  description: string | undefined,
  responsibilities: string[],
  permissions: string[],
  active: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  const statusEmoji = active ? '✅' : '❌';
  
  let html = `<div class="role${className ? ` ${className}` : ''}"${speaker ? ` data-speaker="${speaker}"` : ''}>\n`;
  html += `  <h1>${statusEmoji} Role: ${escapeHtml(name)}</h1>\n`;
  
  if (description) {
    html += `  <p><strong>Description:</strong> ${escapeHtml(description)}</p>\n`;
  }
  
  if (responsibilities.length > 0) {
    html += '  <h2>Responsibilities</h2>\n';
    html += '  <ul>\n';
    responsibilities.forEach(resp => {
      html += `    <li>${escapeHtml(resp)}</li>\n`;
    });
    html += '  </ul>\n';
  }
  
  if (permissions.length > 0) {
    html += '  <h2>Permissions</h2>\n';
    html += '  <ul>\n';
    permissions.forEach(perm => {
      html += `    <li>${escapeHtml(perm)}</li>\n`;
    });
    html += '  </ul>\n';
  }
  
  // Add children content
  if (children.length > 0) {
    html += '  <div class="role-details">\n';
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    html += `    ${childrenContent}\n`;
    html += '  </div>\n';
  }
  
  html += '</div>';
  
  return createElement('div', { 'data-speaker': speaker }, html);
}

function generateJsonRole(
  name: string,
  description: string | undefined,
  responsibilities: string[],
  permissions: string[],
  active: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  const role: any = {
    name,
    active
  };
  
  if (description) {
    role.description = description;
  }
  
  if (responsibilities.length > 0) {
    role.responsibilities = responsibilities;
  }
  
  if (permissions.length > 0) {
    role.permissions = permissions;
  }
  
  // Add children content as a string
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    role.details = childrenContent;
  }
  
  if (className) {
    role.className = className;
  }
  
  if (speaker) {
    role.speaker = speaker;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, JSON.stringify(role, null, 2));
}

function generateYamlRole(
  name: string,
  description: string | undefined,
  responsibilities: string[],
  permissions: string[],
  active: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let yaml = `name: ${JSON.stringify(name)}\nactive: ${active}\n`;
  
  if (description) {
    yaml += `description: ${JSON.stringify(description)}\n`;
  }
  
  if (responsibilities.length > 0) {
    yaml += `responsibilities:\n${responsibilities.map(resp => `  - ${JSON.stringify(resp)}`).join('\n')}`;
  }
  
  if (permissions.length > 0) {
    yaml += `\npermissions:\n${permissions.map(perm => `  - ${JSON.stringify(perm)}`).join('\n')}`;
  }
  
  // Add children content as a string
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    yaml += `\ndetails: |\n${childrenContent.split('\n').map(line => `  ${line}`).join('\n')}`;
  }
  
  if (className) {
    yaml += `\nclassName: ${JSON.stringify(className)}`;
  }
  
  if (speaker) {
    yaml += `\nspeaker: ${JSON.stringify(speaker)}`;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlRole(
  name: string,
  description: string | undefined,
  responsibilities: string[],
  permissions: string[],
  active: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let xml = `<role name="${name}" active="${active}"`;
  
  if (className) {
    xml += ` class="${className}"`;
  }
  
  if (speaker) {
    xml += ` data-speaker="${speaker}"`;
  }
  
  xml += '>\n';
  
  if (description) {
    xml += `  <description>${escapeXml(description)}</description>\n`;
  }
  
  if (responsibilities.length > 0) {
    xml += '  <responsibilities>\n';
    responsibilities.forEach(resp => {
      xml += `    <responsibility>${escapeXml(resp)}</responsibility>\n`;
    });
    xml += '  </responsibilities>\n';
  }
  
  if (permissions.length > 0) {
    xml += '  <permissions>\n';
    permissions.forEach(perm => {
      xml += `    <permission>${escapeXml(perm)}</permission>\n`;
    });
    xml += '  </permissions>\n';
  }
  
  // Add children content
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    xml += `  <details>${escapeXml(childrenContent)}</details>\n`;
  }
  
  xml += '</role>';
  
  return createElement('pre', { className, 'data-speaker': speaker }, xml);
}

function generateTextRole(
  name: string,
  description: string | undefined,
  responsibilities: string[],
  permissions: string[],
  active: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  const statusEmoji = active ? '✅' : '❌';
  let result = `ROLE: ${statusEmoji} ${name}\n`;
  result += '='.repeat(Math.max(5, name.length + 7)) + '\n\n';
  
  if (description) {
    result += `Description: ${description}\n\n`;
  }
  
  if (responsibilities.length > 0) {
    result += 'Responsibilities:\n';
    result += '----------------\n';
    responsibilities.forEach(resp => {
      result += `- ${resp}\n`;
    });
    result += '\n';
  }
  
  if (permissions.length > 0) {
    result += 'Permissions:\n';
    result += '-----------\n';
    permissions.forEach(perm => {
      result += `- ${perm}\n`;
    });
    result += '\n';
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