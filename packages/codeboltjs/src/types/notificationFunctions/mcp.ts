/**
 * Interface for MCP notification functions
 */
export interface McpNotifications {
    GetEnabledMCPServersRequestNotify(toolUseId?: string): void;
    GetEnabledMCPServersResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    ListToolsFromMCPServersRequestNotify(toolboxes: string[], toolUseId?: string): void;
    ListToolsFromMCPServersResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    GetToolsRequestNotify(tools: { toolbox: string; toolName: string }[], toolUseId?: string): void;
    GetToolsResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    ExecuteToolRequestNotify(toolbox: string, toolName: string, params: any, toolUseId?: string): void;
    ExecuteToolResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}