import { PromptBuilder, LLMOutputHandler, FollowUpQuestionBuilder } from '../src/agentlib/promptbuilder';
import llm from '../src/modules/llm';
import type { CodeboltAPI } from '../src/types/libFunctionTypes';

/**
 * Example demonstrating the agent workflow using the new classes
 */
async function runAgentWorkflow(userMessage: any, codebolt: CodeboltAPI) {
    try {
        // Step 1: Build the initial prompt
        const promptBuilderObject = new PromptBuilder(userMessage, codebolt);
        const userPrompt = await promptBuilderObject
            .addMCPTools()
            .addAgentTools()
            .addEnvironmentDetails()
            .addSystemPrompt('agent.yaml', 'test', 'example.md')
            .addTaskInstruction('task.yaml', 'main_task')
            .buildInferenceParams(); // Use buildInferenceParams for LLM inference

        // Step 2: Get initial LLM response
        let llmOutput = llm.inference(userPrompt);
        let llmOutputObject = new LLMOutputHandler(llmOutput, codebolt);

        // Step 3: Main conversation loop
        while (!llmOutputObject.isCompleted()) {
            // Send the assistant's message to the user
            await llmOutputObject.sendMessageToUser();
            
            // Execute any tool calls in the response
            const toolCallResult = await llmOutputObject.runTools();
            
            // Step 4: Build follow-up prompt with tool results
            const followUpQuestionObject = new FollowUpQuestionBuilder(codebolt);
            const nextUserPrompt = await followUpQuestionObject
                .addPreviousConversation(userPrompt)
                .addToolResult(toolCallResult)
                .checkAndSummarizeConversationIfLong()
                .buildInferenceParams(); // Use buildInferenceParams for LLM inference

            // Step 5: Get next LLM response
            llmOutput = llm.inference(nextUserPrompt);
            llmOutputObject = new LLMOutputHandler(llmOutput, codebolt);
            
            // Update userPrompt for next iteration
            userPrompt.messages = nextUserPrompt.messages;
        }

        console.log("Agent workflow completed successfully!");
        
    } catch (error) {
        console.error("Error in agent workflow:", error);
        throw error;
    }
}

/**
 * Alternative example with more detailed control
 */
async function runDetailedAgentWorkflow(userMessage: any, codebolt: CodeboltAPI) {
    try {
        // Step 1: Build the initial prompt with more control
        const promptBuilder = new PromptBuilder(userMessage, codebolt);
        
        // Add components step by step
        promptBuilder
            .addMCPTools(['codebolt', 'filesystem', 'browser'])
            .addAgentTools()
            .addEnvironmentDetails()
            .addSystemPrompt('agent.yaml', 'test')
            .addTaskInstruction('task.yaml', 'main_task')
            .addCustomSection('Additional Context', 'This is a complex task requiring multiple steps');

        const initialPrompt = await promptBuilder.buildInferenceParams();
        
        // Step 2: Start the conversation
        let currentPrompt = initialPrompt;
        let conversationTurn = 0;
        const maxTurns = 20; // Prevent infinite loops
        
        while (conversationTurn < maxTurns) {
            console.log(`\n--- Conversation Turn ${conversationTurn + 1} ---`);
            
            // Get LLM response
            const llmResponse = llm.inference(currentPrompt);
            const outputHandler = new LLMOutputHandler(llmResponse, codebolt);
            
            // Send message to user
            await outputHandler.sendMessageToUser();
            
            // Check if completed
            if (outputHandler.isCompleted()) {
                console.log("Task completed successfully!");
                break;
            }
            
            // Execute tools
            const toolResults = await outputHandler.runTools();
            
            // Build next prompt
            const followUpBuilder = new FollowUpQuestionBuilder(codebolt);
            followUpBuilder
                .addPreviousConversation(currentPrompt)
                .addToolResult(toolResults)
                .setMaxConversationLength(30); // Summarize after 30 messages
            
            // Check if we need to summarize
            if (followUpBuilder.shouldSummarize()) {
                console.log("Summarizing conversation due to length...");
                followUpBuilder.checkAndSummarizeConversationIfLong();
            }
            
            currentPrompt = await followUpBuilder.buildInferenceParams();
            conversationTurn++;
        }
        
        if (conversationTurn >= maxTurns) {
            console.log("Maximum conversation turns reached. Stopping.");
        }
        
    } catch (error) {
        console.error("Error in detailed agent workflow:", error);
        throw error;
    }
}

/**
 * Example with error handling and recovery
 */
async function runRobustAgentWorkflow(userMessage: any, codebolt: CodeboltAPI) {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
        try {
            // Build initial prompt
            const promptBuilder = new PromptBuilder(userMessage, codebolt);
            const userPrompt = await promptBuilder
                .addAllAutomatic() // Add all tools and environment automatically
                .addSystemPrompt('agent.yaml', 'robust_agent')
                .buildInferenceParams();

            let currentPrompt = userPrompt;
            let conversationActive = true;
            
            while (conversationActive) {
                try {
                    // Get LLM response with timeout handling
                    const llmResponse = llm.inference(currentPrompt);
                    const outputHandler = new LLMOutputHandler(llmResponse, codebolt);
                    
                    // Process response
                    await outputHandler.sendMessageToUser();
                    
                    if (outputHandler.isCompleted()) {
                        conversationActive = false;
                        console.log("Workflow completed successfully!");
                        return; // Success - exit all retry loops
                    }
                    
                    // Execute tools with error handling
                    const toolResults = await outputHandler.runTools();
                    
                    // Build next prompt
                    const followUpBuilder = new FollowUpQuestionBuilder(codebolt);
                    currentPrompt = await followUpBuilder
                        .addPreviousConversation(currentPrompt)
                        .addToolResult(toolResults)
                        .checkAndSummarizeConversationIfLong()
                        .buildInferenceParams();
                        
                } catch (stepError) {
                    console.error("Error in conversation step:", stepError);
                    
                    // Add error recovery message
                    const followUpBuilder = new FollowUpQuestionBuilder(codebolt);
                    currentPrompt = await followUpBuilder
                        .addPreviousConversation(currentPrompt)
                        .addUserMessage(`An error occurred: ${stepError}. Please try a different approach.`)
                        .buildInferenceParams();
                }
            }
            
            return; // Success
            
        } catch (error) {
            retryCount++;
            console.error(`Workflow attempt ${retryCount} failed:`, error);
            
            if (retryCount >= maxRetries) {
                console.error("Maximum retries reached. Workflow failed.");
                throw error;
            }
            
            console.log(`Retrying... (${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
        }
    }
}

/**
 * Example using the new addLLMResponse method in PromptBuilder
 * This demonstrates the simplified workflow with conversation management
 */
async function runWorkflowWithPromptBuilder(userMessage: any, codebolt: CodeboltAPI) {
    try {
        // Step 1: Build the initial prompt
        const promptBuilder = new PromptBuilder(userMessage, codebolt);
        let currentPrompt = await promptBuilder
            .addMCPTools()
            .addAgentTools()
            .addEnvironmentDetails()
            .addSystemPrompt('agent.yaml', 'test', 'example.md')
            .addTaskInstruction('task.yaml', 'main_task')
            .buildInferenceParams();

        let maxTurns = 20;
        let turn = 0;

        // Step 2: Main conversation loop using PromptBuilder for conversation management
        while (!promptBuilder.isTaskCompleted() && turn < maxTurns) {
            console.log(`\n--- Conversation Turn ${turn + 1} ---`);
            
            // Get LLM response
            const llmResponse = llm.inference(currentPrompt);
            
            // Add LLM response to conversation history
            await promptBuilder.addLLMResponse(llmResponse);
            
            // Process the response using LLMOutputHandler
            const outputHandler = new LLMOutputHandler(llmResponse, codebolt);
            await outputHandler.sendMessageToUser();
            
            // Check if task is completed (using both methods for reliability)
            if (outputHandler.isCompleted() || promptBuilder.isTaskCompleted()) {
                console.log("Task completed successfully!");
                break;
            }
            
            // Execute tools and get results
            const toolResults = await outputHandler.runTools();
            
            // Add tool results to conversation
            if (toolResults.length > 0) {
                promptBuilder.addToolResults(toolResults);
            } else {
                // Add default continuation message when no tools executed
                promptBuilder.addDefaultContinuationMessage();
            }
            
            // Check if conversation should be summarized
            if (promptBuilder.shouldSummarizeConversation(30)) {
                console.log("Conversation getting long, consider summarization...");
                // Note: Actual summarization would require additional implementation
            }
            
            // Build next prompt for the loop
            currentPrompt = await promptBuilder.buildInferenceParams();
            turn++;
        }
        
        if (turn >= maxTurns) {
            console.log("Maximum conversation turns reached. Stopping.");
        }
        
        console.log(`Workflow completed in ${turn} turns`);
        console.log(`Final conversation length: ${promptBuilder.getConversationLength()} messages`);
        
    } catch (error) {
        console.error("Error in PromptBuilder workflow:", error);
        throw error;
    }
}

/**
 * Example matching the user's agent code structure with the new addLLMResponse method
 * This shows how to update the existing agent to use PromptBuilder for conversation management
 */
async function runUpdatedAgentWorkflow(userMessage: any, codebolt: CodeboltAPI) {
    try {
        // Step 1: Build the initial prompt
        const promptBuilderObject = new PromptBuilder(userMessage, codebolt);
        let userPrompt = await promptBuilderObject
            .addMCPTools()
            .addAgentTools()
            .addEnvironmentDetails()
            .addSystemPrompt('agent.yaml', 'test', 'example.md')
            .addTaskInstruction('task.yaml', 'main_task')
            .buildInferenceParams();

        // Step 2: Get initial LLM response
        let llmOutput = llm.inference(userPrompt);
        
        // Add the initial LLM response to conversation history
        await promptBuilderObject.addLLMResponse(llmOutput);
        
        let llmOutputObject = new LLMOutputHandler(llmOutput, codebolt);

        // Step 3: Main conversation loop with improved conversation management
        while (!llmOutputObject.isCompleted() && !promptBuilderObject.isTaskCompleted()) {
            // Send the assistant's message to the user
            await llmOutputObject.sendMessageToUser();
            
            // Execute any tool calls in the response
            const toolCallResult = await llmOutputObject.runTools();
            
            // Add tool results to conversation history
            if (toolCallResult.length > 0) {
                promptBuilderObject.addToolResults(toolCallResult);
            } else {
                // Add default continuation message when no tools executed
                promptBuilderObject.addDefaultContinuationMessage();
            }
            
            // Check if conversation should be summarized
            if (promptBuilderObject.shouldSummarizeConversation(30)) {
                console.log("Conversation getting long, consider summarization...");
            }
            
            // Step 4: Build next prompt using PromptBuilder's conversation history
            const nextUserPrompt = await promptBuilderObject.buildInferenceParams();

            // Step 5: Get next LLM response
            llmOutput = llm.inference(nextUserPrompt);
            
            // Add the new LLM response to conversation history
            await promptBuilderObject.addLLMResponse(llmOutput);
            
            llmOutputObject = new LLMOutputHandler(llmOutput, codebolt);
            
            // Update userPrompt for next iteration
            userPrompt = nextUserPrompt;
        }

        console.log("Agent workflow completed successfully!");
        console.log(`Final conversation length: ${promptBuilderObject.getConversationLength()} messages`);
        
    } catch (error) {
        console.error("Error in agent workflow:", error);
        throw error;
    }
}

export { 
    runAgentWorkflow, 
    runDetailedAgentWorkflow, 
    runRobustAgentWorkflow,
    runWorkflowWithPromptBuilder,
    runUpdatedAgentWorkflow 
}; 