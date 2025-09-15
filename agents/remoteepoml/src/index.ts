import codebolt from '@codebolt/codeboltjs';
// Main message handler for CodeBolt
codebolt.onMessage(async (message: any): Promise<any> => {
    try {
        codebolt.chat.sendMessage("Hi", {message: "Hello"});
    } catch (error) {
        console.error(error);
    }
});

// Export components for external use
export { RequestMessage, LLMAgentStep, ToolExecutor, ToolListClass as ToolList } from '@codebolt/agent/processor';
