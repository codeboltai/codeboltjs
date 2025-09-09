import { PostInferenceProcessorOutput, ProcessedMessage } from "@codebolt/types/agent";
import { BasePostInferenceProcessor } from "../base";
import { LLMResponse, MessageObject } from "@codebolt/types/sdk";



export class CheckForNoToolCall extends BasePostInferenceProcessor {

    constructor(){
        super()
    }
    modify(llmMessageSent: ProcessedMessage, llmResponseMessage: LLMResponse, nextPrompt: ProcessedMessage): Promise<PostInferenceProcessorOutput> {
        
        // Check if tool_calls exist in the LLM response
        const hasToolCalls = llmResponseMessage.tool_calls && llmResponseMessage.tool_calls.length > 0;
        
        if (!hasToolCalls) {
            // Create a new message indicating no tool call was found
            const noToolCallMessage: MessageObject = {
                role: 'user',
                content: 'no tool call found in request'
            };
            
            // Add the message to the existing nextPrompt messages
            const updatedNextPrompt: ProcessedMessage = {
                ...nextPrompt,
                message: {
                    ...nextPrompt.message,
                    messages: [...nextPrompt.message.messages, noToolCallMessage]
                }
            };
            
            return Promise.resolve({
                nextPrompt: updatedNextPrompt
            });
        }
        
        // If tool calls exist, return the nextPrompt unchanged
        return Promise.resolve({
            nextPrompt: nextPrompt
        });
    }

}