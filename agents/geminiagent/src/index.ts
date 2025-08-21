import codebolt from '@codebolt/codeboltjs';
import { 
    RequestMessage, 
    LLMAgentStep, 
    ToolExecutor, 
    ToolListClass as ToolList 
} from '@codebolt/agentprocessorframework';
import { 
    HandleUrlMessageModifier,
    BaseContextMessageModifier,
    WorkingDirectoryMessageModifier,
    BaseSystemInstructionMessageModifier,
    ImageAttachmentMessageModifier,
    AddToolsListMessageModifier,
    LoopDetectionProcessor,
    ChatCompressionProcessor,
    ContextManagementProcessor,
    AdvancedLoopDetectionProcessor,
    TokenManagementProcessor,
    ResponseValidationProcessor,
    ChatRecordingProcessor,
    TelemetryProcessor,
    FileReadTool,
    FileWriteTool,
    FileDeleteTool,
    FileMoveTool,
    FileCopyTool
} from '@codebolt/agentprocessorpieces';

// Initialize components
const toolList = new ToolList([
    new FileReadTool(),
    new FileWriteTool(),
    new FileDeleteTool(),
    new FileMoveTool(),
    new FileCopyTool()
]);
const toolExecutor = new ToolExecutor(toolList, {
    maxRetries: 3,
    enableLogging: true
});

// Main message handler for CodeBolt
codebolt.onMessage(async (message: any): Promise<any> => {
    try {
        console.log('[GeminiAgent] Processing message:', message);
        
        // Step 1: Message Modification
        const messageModifier = new RequestMessage({
            messageModifiers: [
                new BaseContextMessageModifier({
                    prependmessage: "This is Codebolt Agent. Setting up the Context.",
                    datetime: true,
                    osInfo: true,
                    workingdir: true
                }),
                new WorkingDirectoryMessageModifier({
                    showFolderStructureSummary: true,
                    listFiles: true,
                    listFilesDepth: 2,
                    listFilesLimit: 200,
                    listFilesIgnoreFromGitignore: true,
                    listFilesIgnore: ["node_modules"]
                }),
                new BaseSystemInstructionMessageModifier({
                    systemInstruction: "You are a helpful assistant that can answer questions and help with tasks."
                }),
                new HandleUrlMessageModifier({
                    fetchUrlContent: true,
                }),
                new ImageAttachmentMessageModifier({
                    passImageAs: "URL",
                }),
                new AddToolsListMessageModifier({
                    toolsList: toolList,
                    addToolsLocation: "InsidePrompt", //or as Tool
                    giveToolExamples: true,
                    maxToolExamples: 2,
                }),
            ]
        });
        const InitialPrompt = await messageModifier.modify(message);
        console.log('[GeminiAgent] Message modified');
        
                 // Step 2: Create Agent Step with Enhanced Processors
         const agentStep = new LLMAgentStep({
             inputProcessors: [
                 // Phase 1: Core Safety & Performance
                 new AdvancedLoopDetectionProcessor({ 
                     toolCallThreshold: 5,
                     contentLoopThreshold: 10,
                     enableLLMDetection: false  // Disable for now to avoid extra LLM calls
                 }),
                 new TokenManagementProcessor({ 
                     maxTokens: 128000,
                     warningThreshold: 0.8,
                     enableCompression: true
                 }),
                 
                 // Phase 2: Context & Intelligence  
                 new ContextManagementProcessor({
                     enableProjectContext: true,
                     enableIdeContext: true,
                     enableDirectoryContext: true
                 }),
                 new ChatCompressionProcessor({
                     compressionThreshold: 0.7,
                     tokenLimit: 128000
                 }),
                 
                 // Legacy processor for compatibility
                 new LoopDetectionProcessor({ maxLoops: 10 })
             ],
             outputProcessors: [
                 // Phase 1: Critical Validation
                 new ResponseValidationProcessor({
                     validateToolCalls: true,
                     validateContent: true,
                     validateStructure: true
                 }),
                 
                 // Phase 3: Monitoring & Recording
                 new ChatRecordingProcessor({ 
                     enableTokenTracking: true,
                     exportFormat: 'json',
                     autoExport: false  // Manual export for now
                 }),
                 new TelemetryProcessor({
                     enablePerformanceTracking: true,
                     enableErrorTracking: true,
                     enableUsageTracking: true,
                     sampleRate: 1.0
                 })
             ],
             toolList: toolList,
             toolExecutor: toolExecutor,
             llmconfig: {
                 llmname: "gemini-pro",
                 model: "gemini-pro",
                 temperature: 0.7,
                 maxTokens: 8192
             },
             maxIterations: 10
         });
        
        // Step 3: Main Processing Loop
        let currentMessage = InitialPrompt;
        let iteration = 0;
        const maxIterations = 10;
        
        while (iteration < maxIterations) {
            iteration++;
            console.log(`[GeminiAgent] Processing iteration ${iteration}`);
            
            // Process one step
            const agentStepMessageResponse = await agentStep.step(currentMessage);
            console.log('[GeminiAgent] Agent step completed');
            
            // Check if we need tool execution
            const lastMessage = agentStepMessageResponse.messages[agentStepMessageResponse.messages.length - 1];
            if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
                console.log(`[GeminiAgent] Tool calls detected: ${lastMessage.tool_calls.length}`);
                
                // Execute tools
                const toolExecution = new ToolExecutor(toolList, {
                    maxRetries: 2,
                    enableLogging: true
                });
                
                const toolCalls = lastMessage.tool_calls.map(tc => ({
                    tool: tc.function.name,
                    parameters: typeof tc.function.arguments === 'string' 
                        ? JSON.parse(tc.function.arguments) 
                        : tc.function.arguments
                }));
                
                const updatedMessage = await toolExecution.executeTools({
                    toolCalls,
                    tools: toolList,
                    context: { iteration, promptId: `prompt-${Date.now()}` }
                });
                
                console.log('[GeminiAgent] Tools executed');
                
                // Add tool results to the message for next iteration
                currentMessage = {
                    messages: [
                        ...agentStepMessageResponse.messages,
                        {
                            role: 'system',
                            content: `Tool execution results: ${JSON.stringify(updatedMessage.results)}`,
                            name: 'tool-executor'
                        }
                    ]
                };
                
                // Continue the loop
                continue;
            } else {
                // No tool calls, we're done
                console.log('[GeminiAgent] No tool calls, processing complete');
                break;
            }
        }
        
        if (iteration >= maxIterations) {
            console.log('[GeminiAgent] Max iterations reached');
        }
        
        // Send final response to user
        const finalMessage = currentMessage.messages[currentMessage.messages.length - 1];
        if (finalMessage.role === 'assistant') {
            const content = typeof finalMessage.content === 'string' 
                ? finalMessage.content 
                : JSON.stringify(finalMessage.content);
            codebolt.chat.sendMessage(content, {});
        }
        
        console.log('[GeminiAgent] Processing complete');
        return { 
            success: true, 
            iterations: iteration,
            response: currentMessage
        };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[GeminiAgent] Error:', errorMessage);
        
        // Send error message to user
        codebolt.chat.sendMessage(`Sorry, I encountered an error: ${errorMessage}`, {});
        
        return { 
            error: errorMessage,
            success: false
        };
    }
});

// Export components for external use
export { RequestMessage, LLMAgentStep, ToolExecutor, ToolListClass as ToolList } from '@codebolt/agentprocessorframework';
