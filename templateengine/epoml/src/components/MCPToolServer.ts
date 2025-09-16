import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';
import codebolt from '@codebolt/codeboltjs';

export interface MCPToolServerProps extends BaseComponentProps {
  /** List of MCP server names */
  mcpServerNames?: string[];
  /** Template variables for dynamic content */
  templateVars?: Record<string, any>;
}

export async function MCPToolServer(props: MCPToolServerProps): Promise<Component> {
  const {
    mcpServerNames = ['codebolt'],
    templateVars = {},
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  // Fetch MCP tools from servers
  let mcpTools: any[] = [];
  try {
    const enabledResponse = await codebolt.mcp.listMcpFromServers(mcpServerNames);
    if (enabledResponse && enabledResponse.data) {
      mcpTools = enabledResponse.data;
    }
  } catch (error) {
    console.error('Error fetching MCP tools:', error);
  }

  // Process template variables
  const processedMCPServerNames = mcpServerNames.map(name => {
    // In a real implementation, this would process template variables in the name
    return name;
  });

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownMCPToolServer(processedMCPServerNames, mcpTools, children, className, speaker);
    
    case 'html':
      return generateHtmlMCPToolServer(processedMCPServerNames, mcpTools, children, className, speaker);
    
    case 'json':
      return generateJsonMCPToolServer(processedMCPServerNames, mcpTools, children, className, speaker);
    
    case 'yaml':
      return generateYamlMCPToolServer(processedMCPServerNames, mcpTools, children, className, speaker);
    
    case 'xml':
      return generateXmlMCPToolServer(processedMCPServerNames, mcpTools, children, className, speaker);
    
    case 'text':
    default:
      return generateTextMCPToolServer(processedMCPServerNames, mcpTools, children, className, speaker);
  }
}

function generateMarkdownMCPToolServer(
  mcpServerNames: string[],
  mcpTools: any[],
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let result = `## 🌐 MCP Tool Servers\n\n`;
  
  // if (mcpServerNames.length > 0) {
  //   result += `### Available MCP Servers:\n\n`;
  //   mcpServerNames.forEach((serverName, index) => {
  //     result += `${index + 1}. **${serverName}**\n`;
  //   });
  //   result += '\n';
  // }
  
  // Display MCP tools
  if (mcpTools.length > 0) {
    result += `### Available Tools (${mcpTools.length}):\n\n`;
    mcpTools.forEach((tool, index) => {
      if (tool.type === 'function' && tool.function) {
        const func = tool.function;
        result += `${index + 1}. **${func.name}**\n`;
        result += `   - *${func.description}*\n`;
        
        if (func.parameters && func.parameters.properties) {
          const requiredParams = func.parameters.required || [];
          const paramNames = Object.keys(func.parameters.properties);
          if (paramNames.length > 0) {
            result += `   - Parameters: ${paramNames.map(param => 
              requiredParams.includes(param) ? `**${param}**` : param
            ).join(', ')}\n`;
          }
        }
        result += '\n';
      }
    });
  }
  
  // Process children (for foreach/for loop support)
  if (children.length > 0) {
    result += `### Additional Content:\n\n`;
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlMCPToolServer(
  mcpServerNames: string[],
  mcpTools: any[],
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
  
  // if (mcpServerNames.length > 0) {
  //   html += `<h3>Available MCP Servers:</h3>`;
  //   html += `<ul>`;
  //   mcpServerNames.forEach(serverName => {
  //     html += `<li><strong>${serverName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</strong></li>`;
  //   });
  //   html += `</ul>`;
  // }
  
  // Display MCP tools
  if (mcpTools.length > 0) {
    html += `<h3>Available Tools (${mcpTools.length}):</h3>`;
    html += `<div class="tools-list">`;
    mcpTools.forEach((tool, index) => {
      if (tool.type === 'function' && tool.function) {
        const func = tool.function;
        html += `<div class="tool-item">`;
        html += `<h4>${index + 1}. ${func.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h4>`;
        html += `<p class="tool-description"><em>${func.description.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</em></p>`;
        
        if (func.parameters && func.parameters.properties) {
          const requiredParams = func.parameters.required || [];
          const paramNames = Object.keys(func.parameters.properties);
          if (paramNames.length > 0) {
            html += `<p class="tool-parameters"><strong>Parameters:</strong> `;
            html += paramNames.map(param => 
              requiredParams.includes(param) ? `<strong>${param}</strong>` : param
            ).join(', ');
            html += `</p>`;
          }
        }
        html += `</div>`;
      }
    });
    html += `</div>`;
  }
  
  // Process children (for foreach/for loop support)
  if (children.length > 0) {
    html += `<h3>Additional Content:</h3>`;
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    html += `<div class="additional-content">${childrenContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
  }
  
  html += `</div>`;
  
  return createElement('div', { className, 'data-speaker': speaker }, html);
}

function generateJsonMCPToolServer(
  mcpServerNames: string[],
  mcpTools: any[],
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  const obj: any = {
    type: 'mcp-tool-server',
    mcpServers: mcpServerNames,
    tools: mcpTools
  };
  
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    obj.additionalContent = childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlMCPToolServer(
  mcpServerNames: string[],
  mcpTools: any[],
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let yaml = `type: mcp-tool-server\nmcpServers:\n`;
  mcpServerNames.forEach(serverName => {
    yaml += `  - ${JSON.stringify(serverName)}\n`;
  });
  
  yaml += `tools:\n`;
  mcpTools.forEach((tool, index) => {
    if (tool.type === 'function' && tool.function) {
      const func = tool.function;
      yaml += `  - name: ${JSON.stringify(func.name)}\n`;
      yaml += `    description: ${JSON.stringify(func.description)}\n`;
      if (func.parameters && func.parameters.properties) {
        const requiredParams = func.parameters.required || [];
        const paramNames = Object.keys(func.parameters.properties);
        if (paramNames.length > 0) {
          yaml += `    parameters:\n`;
          paramNames.forEach(param => {
            yaml += `      - name: ${JSON.stringify(param)}\n`;
            yaml += `        required: ${requiredParams.includes(param)}\n`;
          });
        }
      }
    }
  });
  
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    yaml += `additionalContent: ${JSON.stringify(childrenContent)}\n`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlMCPToolServer(
  mcpServerNames: string[],
  mcpTools: any[],
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
  
  if (mcpTools.length > 0) {
    xml += `<tools count="${mcpTools.length}">`;
    mcpTools.forEach((tool, index) => {
      if (tool.type === 'function' && tool.function) {
        const func = tool.function;
        xml += `<tool index="${index + 1}">`;
        xml += `<name>${func.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</name>`;
        xml += `<description>${func.description.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</description>`;
        
        if (func.parameters && func.parameters.properties) {
          const requiredParams = func.parameters.required || [];
          const paramNames = Object.keys(func.parameters.properties);
          if (paramNames.length > 0) {
            xml += `<parameters>`;
            paramNames.forEach(param => {
              xml += `<parameter name="${param.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" required="${requiredParams.includes(param)}" />`;
            });
            xml += `</parameters>`;
          }
        }
        xml += `</tool>`;
      }
    });
    xml += `</tools>`;
  }
  
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    xml += `<additional-content>${childrenContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</additional-content>`;
  }
  
  xml += `</mcp-tool-server>`;
  
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextMCPToolServer(
  mcpServerNames: string[],
  mcpTools: any[],
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let result = 'MCP TOOL SERVERS\n===============\n\n';
  
  // if (mcpServerNames.length > 0) {
  //   result += 'Available MCP Servers:\n';
  //   mcpServerNames.forEach((serverName, index) => {
  //     result += `${index + 1}. ${serverName}\n`;
  //   });
  //   result += '\n';
  // }
  
  // Display MCP tools
  if (mcpTools.length > 0) {
    result += `Available Tools (${mcpTools.length}):\n`;
    result += '==================\n\n';
    mcpTools.forEach((tool, index) => {
      if (tool.type === 'function' && tool.function) {
        const func = tool.function;
        result += `${index + 1}. ${func.name}\n`;
        result += `   Description: ${func.description}\n`;
        
        if (func.parameters && func.parameters.properties) {
          const requiredParams = func.parameters.required || [];
          const paramNames = Object.keys(func.parameters.properties);
          if (paramNames.length > 0) {
            result += `   Parameters: ${paramNames.map(param => 
              requiredParams.includes(param) ? `*${param}*` : param
            ).join(', ')}\n`;
          }
        }
        result += '\n';
      }
    });
  }
  
  // Process children (for foreach/for loop support)
  if (children.length > 0) {
    result += 'Additional Content:\n';
    result += '------------------\n';
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}