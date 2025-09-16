import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';
import codebolt from '@codebolt/codeboltjs';

export interface MCPToolFunctionProps extends BaseComponentProps {
  /** Name of the MCP tool */
  toolName?: string;
  /** Function signature or description */
  toolFunction?: string[];
  /** Template variables for dynamic content */
  templateVars?: Record<string, any>;
}

interface MCPToolFunction {
  name: string;
  description?: string;
  parameters?: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
}

interface MCPTool {
  type: "function";
  function: MCPToolFunction;
}

export async function MCPToolFunction(props: MCPToolFunctionProps): Promise<Component> {
  const {
    toolName = '',
    toolFunction = ['codebolt'],
    templateVars = {},
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  // Fetch MCP tools from servers
  let mcpTools: MCPTool[] = [];
  let selectedTool: MCPTool | null = null;
  let errorMessage: string | null = null;
  
  try {
    const enabledResponse = await codebolt.mcp.listMcpFromServers(toolFunction);
    if (enabledResponse && enabledResponse.data) {
      mcpTools = enabledResponse.data;
      
      // Find the specific tool if toolName is provided
      if (toolName) {
        selectedTool = mcpTools.find(tool => tool.function.name === toolName) || null;
        
        // If toolName was provided but not found, set error message
        if (!selectedTool) {
          errorMessage = `Tool "${toolName}" not found in any of the specified toolboxes: ${toolFunction.join(', ')}`;
        }
      }
    } else if (enabledResponse && enabledResponse.error) {
      errorMessage = `Error from MCP server: ${enabledResponse.error}`;
    } else {
      errorMessage = 'No MCP tools found or invalid response from server';
    }
  } catch (error) {
    console.error('Error fetching MCP tools:', error);
    errorMessage = `Failed to fetch MCP tools: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  // Process template variables
  const processedToolName = selectedTool ? selectedTool.function.name : toolName;
  const processedToolFunction = selectedTool ? selectedTool.function.description || '' : '';

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownMCPToolFunction(processedToolName, processedToolFunction, selectedTool, errorMessage, children, className, speaker);
    
    case 'html':
      return generateHtmlMCPToolFunction(processedToolName, processedToolFunction, selectedTool, errorMessage, children, className, speaker);
    
    case 'json':
      return generateJsonMCPToolFunction(processedToolName, processedToolFunction, selectedTool, errorMessage, children, className, speaker);
    
    case 'yaml':
      return generateYamlMCPToolFunction(processedToolName, processedToolFunction, selectedTool, errorMessage, children, className, speaker);
    
    case 'xml':
      return generateXmlMCPToolFunction(processedToolName, processedToolFunction, selectedTool, errorMessage, children, className, speaker);
    
    case 'text':
    default:
      return generateTextMCPToolFunction(processedToolName, processedToolFunction, selectedTool, errorMessage, children, className, speaker);
  }
}

function generateMarkdownMCPToolFunction(
  toolName: string,
  toolFunction: string,
  selectedTool: MCPTool | null,
  errorMessage: string | null,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let result = `### 🌐 ${toolName || 'MCP Tool Function'}\n\n`;
  
  if (errorMessage) {
    result += `⚠️ **Error:** ${errorMessage}\n\n`;
  }
  
  if (toolFunction) {
    result += `**Description:** ${toolFunction}\n\n`;
  }
  
  if (selectedTool && selectedTool.function.parameters) {
    result += `**Parameters:**\n`;
    if (selectedTool.function.parameters.properties) {
      Object.entries(selectedTool.function.parameters.properties).forEach(([key, value]) => {
        const paramInfo = value as any;
        const isRequired = selectedTool.function.parameters?.required?.includes(key);
        result += `- \`${key}\`${isRequired ? ' (required)' : ''}: ${paramInfo.description || 'No description'}\n`;
        if (paramInfo.type) {
          result += `  - Type: \`${paramInfo.type}\`\n`;
        }
      });
    }
    result += `\n`;
  }
  
  // Process children (for foreach/for loop support)
  if (children.length > 0) {
    result += `**Details:**\n\n`;
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlMCPToolFunction(
  toolName: string,
  toolFunction: string,
  selectedTool: MCPTool | null,
  errorMessage: string | null,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let html = `<div class="mcp-tool-function"`;
  if (className) {
    html += ` class="${className}"`;
  }
  if (speaker) {
    html += ` data-speaker="${speaker}"`;
  }
  html += '>';
  
  html += `<h3>🌐 ${toolName || 'MCP Tool Function'}</h3>`;
  
  if (errorMessage) {
    html += `<div class="error" style="color: red; background: #ffe6e6; padding: 10px; border-radius: 4px; margin: 10px 0;"><strong>⚠️ Error:</strong> ${errorMessage.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
  }
  
  if (toolFunction) {
    html += `<p><strong>Description:</strong> ${toolFunction.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
  }
  
  if (selectedTool && selectedTool.function.parameters) {
    html += `<h4>Parameters:</h4><ul>`;
    if (selectedTool.function.parameters.properties) {
      Object.entries(selectedTool.function.parameters.properties).forEach(([key, value]) => {
        const paramInfo = value as any;
        const isRequired = selectedTool.function.parameters?.required?.includes(key);
        const description = paramInfo.description || 'No description';
        const type = paramInfo.type || 'unknown';
        html += `<li><code>${key}</code>${isRequired ? ' <strong>(required)</strong>' : ''}: ${description.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}<br><small>Type: <code>${type}</code></small></li>`;
      });
    }
    html += `</ul>`;
  }
  
  // Process children (for foreach/for loop support)
  if (children.length > 0) {
    html += `<h4>Details:</h4>`;
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    html += `<div class="details">${childrenContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
  }
  
  html += `</div>`;
  
  return createElement('div', { className, 'data-speaker': speaker }, html);
}

function generateJsonMCPToolFunction(
  toolName: string,
  toolFunction: string,
  selectedTool: MCPTool | null,
  errorMessage: string | null,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  const obj: any = {
    type: 'mcp-tool-function',
    toolName: toolName || 'MCP Tool Function'
  };
  
  if (errorMessage) {
    obj.error = errorMessage;
  }
  
  if (toolFunction) {
    obj.description = toolFunction;
  }
  
  if (selectedTool) {
    obj.tool = {
      name: selectedTool.function.name,
      description: selectedTool.function.description,
      parameters: selectedTool.function.parameters
    };
  }
  
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    obj.details = childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlMCPToolFunction(
  toolName: string,
  toolFunction: string,
  selectedTool: MCPTool | null,
  errorMessage: string | null,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let yaml = `type: mcp-tool-function\ntoolName: ${JSON.stringify(toolName || 'MCP Tool Function')}\n`;
  
  if (errorMessage) {
    yaml += `error: ${JSON.stringify(errorMessage)}\n`;
  }
  
  if (toolFunction) {
    yaml += `description: ${JSON.stringify(toolFunction)}\n`;
  }
  
  if (selectedTool) {
    yaml += `tool:\n`;
    yaml += `  name: ${JSON.stringify(selectedTool.function.name)}\n`;
    if (selectedTool.function.description) {
      yaml += `  description: ${JSON.stringify(selectedTool.function.description)}\n`;
    }
    if (selectedTool.function.parameters) {
      yaml += `  parameters:\n`;
      yaml += `    type: ${JSON.stringify(selectedTool.function.parameters.type)}\n`;
      if (selectedTool.function.parameters.properties) {
        yaml += `    properties:\n`;
        Object.entries(selectedTool.function.parameters.properties).forEach(([key, value]) => {
          yaml += `      ${key}: ${JSON.stringify(value)}\n`;
        });
      }
      if (selectedTool.function.parameters.required) {
        yaml += `    required: ${JSON.stringify(selectedTool.function.parameters.required)}\n`;
      }
    }
  }
  
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    yaml += `details: ${JSON.stringify(childrenContent)}\n`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlMCPToolFunction(
  toolName: string,
  toolFunction: string,
  selectedTool: MCPTool | null,
  errorMessage: string | null,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let xml = `<mcp-tool-function name="${(toolName || 'MCP Tool Function').replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  
  if (toolFunction) {
    xml += ` description="${toolFunction.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  }
  
  xml += '>';
  
  if (errorMessage) {
    xml += `<error>${errorMessage.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</error>`;
  }
  
  if (selectedTool) {
    xml += `<tool name="${selectedTool.function.name.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">`;
    if (selectedTool.function.description) {
      xml += `<description>${selectedTool.function.description.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</description>`;
    }
    if (selectedTool.function.parameters) {
      xml += `<parameters type="${selectedTool.function.parameters.type}">`;
      if (selectedTool.function.parameters.properties) {
        Object.entries(selectedTool.function.parameters.properties).forEach(([key, value]) => {
          const paramInfo = value as any;
          const isRequired = selectedTool.function.parameters?.required?.includes(key);
          xml += `<parameter name="${key.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" type="${paramInfo.type || 'unknown'}" required="${isRequired}">`;
          xml += `<description>${(paramInfo.description || 'No description').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</description>`;
          xml += `</parameter>`;
        });
      }
      xml += `</parameters>`;
    }
    xml += `</tool>`;
  }
  
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    xml += `<details>${childrenContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</details>`;
  }
  
  xml += `</mcp-tool-function>`;
  
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextMCPToolFunction(
  toolName: string,
  toolFunction: string,
  selectedTool: MCPTool | null,
  errorMessage: string | null,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let result = `MCP TOOL FUNCTION\n================\n\n`;
  
  result += `Tool Name: ${toolName || 'MCP Tool Function'}\n\n`;
  
  if (errorMessage) {
    result += `ERROR: ${errorMessage}\n\n`;
  }
  
  if (toolFunction) {
    result += `Description: ${toolFunction}\n\n`;
  }
  
  if (selectedTool && selectedTool.function.parameters) {
    result += `Parameters:\n`;
    if (selectedTool.function.parameters.properties) {
      Object.entries(selectedTool.function.parameters.properties).forEach(([key, value]) => {
        const paramInfo = value as any;
        const isRequired = selectedTool.function.parameters?.required?.includes(key);
        result += `  ${key}${isRequired ? ' (required)' : ''}: ${paramInfo.description || 'No description'}\n`;
        if (paramInfo.type) {
          result += `    Type: ${paramInfo.type}\n`;
        }
      });
    }
    result += `\n`;
  }
  
  // Process children (for foreach/for loop support)
  if (children.length > 0) {
    result += `Details:\n--------\n`;
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}