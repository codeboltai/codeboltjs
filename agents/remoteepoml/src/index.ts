import codebolt from '@codebolt/codeboltjs';
import { epomlparse } from 'epoml';
// Main message handler for CodeBolt
codebolt.onMessage(async (message: any): Promise<any> => {
    try {

      // const  prompt = `<MCPToolServer syntax="markdown" />`;
      // const parsedPrompt = await epomlparse(prompt);
      // console.log(parsedPrompt);

      const prompt = `<MCPToolFunction toolName="codebolt--read_file" syntax="markdown" />`;
       const parsedPrompt = await epomlparse(prompt);
      // console.log(parsedPrompt);

        codebolt.chat.sendMessage(parsedPrompt, {message: "Hello"}); 
    } catch (error) {
        console.error(error);
    }
});

// Export components for external use

