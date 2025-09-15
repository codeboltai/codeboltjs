import codebolt from '@codebolt/codeboltjs';
import { epomlparse } from 'epoml';
// Main message handler for CodeBolt
codebolt.onMessage(async (message: any): Promise<any> => {
    try {

        const enabledResponse = await codebolt.mcp.getEnabledMCPServers();
        console.log("enabledResponse",enabledResponse);
        codebolt.chat.sendMessage(JSON.stringify(enabledResponse), {message: "Hello"});

        // const prompt = `<MCPToolServer mcpServerNames={["codebolt"]} syntax="markdown" />`
        // codebolt.chat.sendMessage(await epomlparse(prompt), {message: "Hello"});
        // codebolt.chat.sendMessage("Hi2", {message: "Hello"});
        
    } catch (error) {
        console.error(error);
    }
});

// Export components for external use
export { RequestMessage, LLMAgentStep, ToolExecutor, ToolListClass as ToolList } from '@codebolt/agent/processor';
