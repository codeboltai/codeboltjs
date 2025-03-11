import { UserMessage } from '../utils';
declare const codeboltMCP: {
    getEnabledToolBoxes: () => Promise<any>;
    getLocalToolBoxes: () => Promise<any>;
    getMentionedToolBoxes: (userMessage: UserMessage) => Promise<any>;
    getAvailableToolBoxes: () => Promise<any>;
    searchAvailableToolBoxes: (query: string) => Promise<any>;
    listToolsFromToolBoxes: (toolBoxes: string[]) => Promise<any>;
    configureToolBox: (name: string, config: any) => Promise<any>;
    getTools: (tools: {
        toolbox: string;
        toolName: string;
    }[]) => Promise<any[]>;
    executeTool: (toolbox: string, toolName: string, params: any) => Promise<any>;
};
export default codeboltMCP;
