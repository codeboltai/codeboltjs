import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';
import { processTemplateVars } from '../utils';

export interface CodeboltToolServerProps extends BaseComponentProps {
  /** List of tool server names */
  toolServerNames?: string[];
  /** Template variables for dynamic content */
  templateVars?: Record<string, any>;
}

export function CodeboltToolServer(props: CodeboltToolServerProps): Component {
  const {
    toolServerNames = [],
    templateVars = {},
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  // Process template variables
  const processedToolServerNames = toolServerNames.map(name => {
    // Process template variables in each name
    return processTemplateVars(name, templateVars);
  });

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownCodeboltToolServer(processedToolServerNames, children, className, speaker, templateVars);
    
    case 'html':
      return generateHtmlCodeboltToolServer(processedToolServerNames, children, className, speaker, templateVars);
    
    case 'json':
      return generateJsonCodeboltToolServer(processedToolServerNames, children, className, speaker, templateVars);
    
    case 'yaml':
      return generateYamlCodeboltToolServer(processedToolServerNames, children, className, speaker, templateVars);
    
    case 'xml':
      return generateXmlCodeboltToolServer(processedToolServerNames, children, className, speaker, templateVars);
    
    case 'text':
    default:
      return generateTextCodeboltToolServer(processedToolServerNames, children, className, speaker, templateVars);
  }
}

function generateMarkdownCodeboltToolServer(
  toolServerNames: string[],
  children: (Component | string)[],
  className?: string,
  speaker?: string,
  context?: Record<string, any>
): Component {
  let result = `## 🛠️ Codebolt Tool Servers\n\n`;
  
  if (toolServerNames.length > 0) {
    result += `### Available Tool Servers:\n\n`;
    toolServerNames.forEach((serverName, index) => {
      // Process template variables in server names
      const processedName = processTemplateVars(serverName, context || {});
      result += `${index + 1}. **${processedName}**\n`;
    });
    result += '\n';
  }
  
  // Process children (for foreach/for loop support)
  if (children.length > 0) {
    result += `### Tool Calls:\n\n`;
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    // Process template variables in children content
    const processedContent = processTemplateVars(childrenContent, context || {});
    result += processedContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlCodeboltToolServer(
  toolServerNames: string[],
  children: (Component | string)[],
  className?: string,
  speaker?: string,
  context?: Record<string, any>
): Component {
  let html = `<div class="codebolt-tool-server"`;
  if (className) {
    html += ` class="${className}"`;
  }
  if (speaker) {
    html += ` data-speaker="${speaker}"`;
  }
  html += '>';
  
  html += `<h2>🛠️ Codebolt Tool Servers</h2>`;
  
  if (toolServerNames.length > 0) {
    html += `<h3>Available Tool Servers:</h3>`;
    html += `<ul>`;
    toolServerNames.forEach(serverName => {
      // Process template variables in server names
      const processedName = processTemplateVars(serverName, context || {});
      html += `<li><strong>${processedName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</strong></li>`;
    });
    html += `</ul>`;
  }
  
  // Process children (for foreach/for loop support)
  if (children.length > 0) {
    html += `<h3>Tool Calls:</h3>`;
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    // Process template variables in children content
    const processedContent = processTemplateVars(childrenContent, context || {});
    html += `<div class="tool-calls">${processedContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
  }
  
  html += `</div>`;
  
  return createElement('div', { className, 'data-speaker': speaker }, html);
}

function generateJsonCodeboltToolServer(
  toolServerNames: string[],
  children: (Component | string)[],
  className?: string,
  speaker?: string,
  context?: Record<string, any>
): Component {
  const obj: any = {
    type: 'codebolt-tool-server',
    toolServers: toolServerNames.map(name => processTemplateVars(name, context || {}))
  };
  
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    // Process template variables in children content
    const processedContent = processTemplateVars(childrenContent, context || {});
    obj.toolCalls = processedContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlCodeboltToolServer(
  toolServerNames: string[],
  children: (Component | string)[],
  className?: string,
  speaker?: string,
  context?: Record<string, any>
): Component {
  let yaml = `type: codebolt-tool-server\ntoolServers:\n`;
  toolServerNames.forEach(serverName => {
    // Process template variables in server names
    const processedName = processTemplateVars(serverName, context || {});
    yaml += `  - ${JSON.stringify(processedName)}\n`;
  });
  
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    // Process template variables in children content
    const processedContent = processTemplateVars(childrenContent, context || {});
    yaml += `toolCalls: ${JSON.stringify(processedContent)}\n`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlCodeboltToolServer(
  toolServerNames: string[],
  children: (Component | string)[],
  className?: string,
  speaker?: string,
  context?: Record<string, any>
): Component {
  let xml = `<codebolt-tool-server>`;
  
  if (toolServerNames.length > 0) {
    xml += `<tool-servers>`;
    toolServerNames.forEach(serverName => {
      // Process template variables in server names
      const processedName = processTemplateVars(serverName, context || {});
      xml += `<server name="${processedName.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" />`;
    });
    xml += `</tool-servers>`;
  }
  
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    // Process template variables in children content
    const processedContent = processTemplateVars(childrenContent, context || {});
    xml += `<tool-calls>${processedContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</tool-calls>`;
  }
  
  xml += `</codebolt-tool-server>`;
  
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextCodeboltToolServer(
  toolServerNames: string[],
  children: (Component | string)[],
  className?: string,
  speaker?: string,
  context?: Record<string, any>
): Component {
  let result = 'CODEBOLT TOOL SERVERS\n====================\n\n';
  
  if (toolServerNames.length > 0) {
    result += 'Available Tool Servers:\n';
    toolServerNames.forEach((serverName, index) => {
      // Process template variables in server names
      const processedName = processTemplateVars(serverName, context || {});
      result += `${index + 1}. ${processedName}\n`;
    });
    result += '\n';
  }
  
  // Process children (for foreach/for loop support)
  if (children.length > 0) {
    result += 'Tool Calls:\n-----------\n';
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    // Process template variables in children content
    const processedContent = processTemplateVars(childrenContent, context || {});
    result += processedContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}