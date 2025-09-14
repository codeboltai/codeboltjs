import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface MCPToolServerProps extends BaseComponentProps {
  /** List of MCP server names */
  mcpServerNames?: string[];
  /** Template variables for dynamic content */
  templateVars?: Record<string, any>;
}

export function MCPToolServer(props: MCPToolServerProps): Component {
  const {
    mcpServerNames = [],
    templateVars = {},
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  // Process template variables
  const processedMCPServerNames = mcpServerNames.map(name => {
    // In a real implementation, this would process template variables in the name
    return name;
  });

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownMCPToolServer(processedMCPServerNames, children, className, speaker);
    
    case 'html':
      return generateHtmlMCPToolServer(processedMCPServerNames, children, className, speaker);
    
    case 'json':
      return generateJsonMCPToolServer(processedMCPServerNames, children, className, speaker);
    
    case 'yaml':
      return generateYamlMCPToolServer(processedMCPServerNames, children, className, speaker);
    
    case 'xml':
      return generateXmlMCPToolServer(processedMCPServerNames, children, className, speaker);
    
    case 'text':
    default:
      return generateTextMCPToolServer(processedMCPServerNames, children, className, speaker);
  }
}

function generateMarkdownMCPToolServer(
  mcpServerNames: string[],
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let result = `## 🌐 MCP Tool Servers\n\n`;
  
  if (mcpServerNames.length > 0) {
    result += `### Available MCP Servers:\n\n`;
    mcpServerNames.forEach((serverName, index) => {
      result += `${index + 1}. **${serverName}**\n`;
    });
    result += '\n';
  }
  
  // Process children (for foreach/for loop support)
  if (children.length > 0) {
    result += `### Tools:\n\n`;
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlMCPToolServer(
  mcpServerNames: string[],
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let html = `<div class="mcp-tool-server"`;
  if (className) {
    html += ` class="${className}"`;
  }
  if (speaker) {
    html += ` data-speaker="${speaker}"`;
  }
  html += '>';
  
  html += `<h2>🌐 MCP Tool Servers</h2>`;
  
  if (mcpServerNames.length > 0) {
    html += `<h3>Available MCP Servers:</h3>`;
    html += `<ul>`;
    mcpServerNames.forEach(serverName => {
      html += `<li><strong>${serverName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</strong></li>`;
    });
    html += `</ul>`;
  }
  
  // Process children (for foreach/for loop support)
  if (children.length > 0) {
    html += `<h3>Tools:</h3>`;
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    html += `<div class="tools">${childrenContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
  }
  
  html += `</div>`;
  
  return createElement('div', { className, 'data-speaker': speaker }, html);
}

function generateJsonMCPToolServer(
  mcpServerNames: string[],
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  const obj: any = {
    type: 'mcp-tool-server',
    mcpServers: mcpServerNames
  };
  
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    obj.tools = childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlMCPToolServer(
  mcpServerNames: string[],
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let yaml = `type: mcp-tool-server\nmcpServers:\n`;
  mcpServerNames.forEach(serverName => {
    yaml += `  - ${JSON.stringify(serverName)}\n`;
  });
  
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    yaml += `tools: ${JSON.stringify(childrenContent)}\n`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlMCPToolServer(
  mcpServerNames: string[],
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let xml = `<mcp-tool-server>`;
  
  if (mcpServerNames.length > 0) {
    xml += `<mcp-servers>`;
    mcpServerNames.forEach(serverName => {
      xml += `<server name="${serverName.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" />`;
    });
    xml += `</mcp-servers>`;
  }
  
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    xml += `<tools>${childrenContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</tools>`;
  }
  
  xml += `</mcp-tool-server>`;
  
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextMCPToolServer(
  mcpServerNames: string[],
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let result = 'MCP TOOL SERVERS\n===============\n\n';
  
  if (mcpServerNames.length > 0) {
    result += 'Available MCP Servers:\n';
    mcpServerNames.forEach((serverName, index) => {
      result += `${index + 1}. ${serverName}\n`;
    });
    result += '\n';
  }
  
  // Process children (for foreach/for loop support)
  if (children.length > 0) {
    result += 'Tools:\n------\n';
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}