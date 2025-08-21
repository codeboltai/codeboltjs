// Disable native modules for WebSocket
process.env.WS_NO_BUFFER_UTIL = '1';
process.env.WS_NO_UTF_8_VALIDATE = '1';

// Set default values for required environment variables
process.env.CODEBOLT_URL = process.env.CODEBOLT_URL || 'ws://localhost:3000/codebolt';
process.env.CODEBOLT_ID = process.env.CODEBOLT_ID || 'default_id';

const codebolt = require('@codebolt/codeboltjs');

const { UserMessage, SystemPrompt, TaskInstruction, Agent } = require("@codebolt/utils");

codebolt.onMessage(async (reqMessage) => {
    try {

        const userMessage = new UserMessage(reqMessage);
        const systemPrompt = new SystemPrompt("./agent.yaml", "test");
        const {data} = await codebolt.mcp.listMcpFromServers(["codebolt"]);

        const agentTools = data;

        const task = new TaskInstruction(agentTools, userMessage, "./task.yaml", "main_task");
       
        const agent = new Agent(agentTools, systemPrompt);
        const {message, success, error } = await agent.run(task);
        return message ? message : error;


    } catch (error) {
        console.log(error)
    }
})
