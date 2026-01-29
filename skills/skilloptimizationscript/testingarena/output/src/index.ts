import codebolt from '@codebolt/codeboltjs';
import { UserMessage, SystemPrompt, TaskInstruction, Agent } from '@codebolt/agent/unified';
import { FlatUserMessage } from '@codebolt/types';

/**
 * Simple Codebolt Agent
 *
 * This agent demonstrates the pattern of using:
 * - UserMessage: Wraps the incoming user message
 * - SystemPrompt: Loads system prompt from agent.yaml
 * - TaskInstruction: Loads task instructions from task.yaml
 * - Agent: Executes the agent loop with the configured tools and prompts
 */

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    try {
        // 1. Wrap the incoming user message
        const userMessage = new UserMessage(reqMessage);

        // 2. Load system prompt from agent.yaml using the "test" key
        const systemPrompt = new SystemPrompt("./agent.yaml", "test");

        // 3. Get available tools from the Codebolt MCP server
        const { data } = await codebolt.mcp.listMcpFromServers(["codebolt"]);
        const agentTools = data;

        // 4. Create task instruction from task.yaml using the "main_task" key
        const task = new TaskInstruction(agentTools, userMessage, "./task.yaml", "main_task");

        // 5. Create and run the agent
        const agent = new Agent(agentTools, systemPrompt);
        const { message, success, error } = await agent.run(task);

        // 6. Return the result
        return message ? message : error;

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        codebolt.chat.sendMessage(`Error: ${errorMessage}`);
        return `Error: ${errorMessage}`;
    }
});
