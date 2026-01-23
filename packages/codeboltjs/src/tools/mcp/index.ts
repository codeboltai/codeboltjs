/**
 * MCP (Model Context Protocol) tools
 */

export { MCPListServersTool, type MCPListServersToolParams } from './mcp-list-servers';
export { MCPGetToolsTool, type MCPGetToolsToolParams } from './mcp-get-tools';
export { MCPExecuteToolTool, type MCPExecuteToolToolParams } from './mcp-execute-tool';
export { MCPConfigureServerTool, type MCPConfigureServerToolParams } from './mcp-configure-server';

// Create instances for convenience
import { MCPListServersTool } from './mcp-list-servers';
import { MCPGetToolsTool } from './mcp-get-tools';
import { MCPExecuteToolTool } from './mcp-execute-tool';
import { MCPConfigureServerTool } from './mcp-configure-server';

/**
 * All MCP operation tools
 */
export const mcpTools = [
    new MCPListServersTool(),
    new MCPGetToolsTool(),
    new MCPExecuteToolTool(),
    new MCPConfigureServerTool(),
];
