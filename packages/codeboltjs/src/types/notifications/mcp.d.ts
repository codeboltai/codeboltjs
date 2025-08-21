export type GetEnabledMCPServersRequestNotification = {
    toolUseId: string;
    type: "mcpnotify";
    action: "getEnabledMCPServersRequest";
    data: {};
};
export type GetEnabledMCPServersResultNotification = {
    toolUseId: string;
    type: "mcpnotify";
    action: "getEnabledMCPServersResult";
    content: string | any;
    isError?: boolean;
};
export type ListToolsFromMCPServersRequestNotification = {
    toolUseId: string;
    type: "mcpnotify";
    action: "listToolsFromMCPServersRequest";
    data: {
        toolboxes: string[];
    };
};
export type ListToolsFromMCPServersResultNotification = {
    toolUseId: string;
    type: "mcpnotify";
    action: "listToolsFromMCPServersResult";
    content: string | any;
    isError?: boolean;
};
export type GetToolsRequestNotification = {
    toolUseId: string;
    type: "mcpnotify";
    action: "getToolsRequest";
    data: {
        tools: {
            toolbox: string;
            toolName: string;
        }[];
    };
};
export type GetToolsResultNotification = {
    toolUseId: string;
    type: "mcpnotify";
    action: "getToolsResult";
    content: string | any;
    isError?: boolean;
};
export type ExecuteToolRequestNotification = {
    toolUseId: string;
    type: "mcpnotify";
    action: "executeToolRequest";
    data: {
        toolbox: string;
        toolName: string;
        params: any;
    };
};
export type ExecuteToolResultNotification = {
    toolUseId: string;
    type: "mcpnotify";
    action: "executeToolResult";
    content: string | any;
    isError?: boolean;
};
