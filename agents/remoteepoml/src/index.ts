import codebolt from '@codebolt/codeboltjs';
import { epomlparse } from 'epoml';
// Main message handler for CodeBolt
codebolt.onMessage(async (message: any): Promise<any> => {
    try {
        const prompt = `<Folder path="C:\\btpl\\agents\\ApiExample\\sample" />` 

        codebolt.chat.sendMessage(await epomlparse(prompt), {message: "Hello"});
    } catch (error) {
        console.error(error);
    }
});

// Export components for external use
export { RequestMessage, LLMAgentStep, ToolExecutor, ToolListClass as ToolList } from '@codebolt/agent/processor';
