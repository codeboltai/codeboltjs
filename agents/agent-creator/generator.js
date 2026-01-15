const codebolt = require('@codebolt/codeboltjs');
const fs = require('fs')
const {
    InitialPromptGenerator,

    ResponseExecutor
} = require('@codebolt/agent/unified')

const {
    EnvironmentContextModifier,
    CoreSystemPromptModifier,
    DirectoryContextModifier,
    IdeContextModifier,
    AtFileProcessorModifier,
    ToolInjectionModifier,
    ChatHistoryMessageModifier


} = require('@codebolt/agent/processor-pieces');



const { AgentStep } = require('@codebolt/agent/unified');


const config = {
    backendUrl: process.env.BACKEND_API_URL || 'https://contextdocs.arrowai.workers.dev',

};


/**
 * Step 1: Create a high-level plan based on user request
 */
async function createHighLevelPlan(userRequest, config) {
    const prompt = `
You are an expert software architect. Given a user request, create a high-level plan for building the requested functionality.

User Request: "${userRequest}"

Please create a high-level plan that includes:
1. Main objective and purpose
2. Key functionality requirements
3. Required API components/interfaces (be specific about what types of APIs might be needed)
4. Data flow and architecture considerations
5. Implementation steps

Format your response as a structured plan with clear sections. Be specific about what types of APIs or components would be needed (e.g., file system operations, HTTP requests, data processing, UI components, etc.).

IMPORTANT: Focus on identifying what API interfaces and components would be needed to implement this functionality.

Example Agent:
${fs.readFileSync('./exampleAgent.md', 'utf8')}

`;

    let response = await codebolt.llm.inference({messages:[{"role":"user","content":prompt}]});
    codebolt.chat.sendMessage(response.message);
    console.log(JSON.stringify(response.message));

    return response.message
}

/**
 * Step 2: Get list of available API components from backend
 */
async function getAPIComponentsList() {
    try {
        const response = await fetch(`${config.backendUrl}/api/interfaces`);
        if (!response.ok) {
            throw new Error(`Backend API error: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(`Backend API error: ${data.error}`);
        }

        // Return simplified list with just name, category, and short description
        return data.data.map(component => ({
            id: component.id,
            name: component.name,
            category: component.category,
            description: component.description,
            tags: component.tags
        }));
    } catch (error) {
        console.error('Error fetching API components:', error);
        throw error;
    }
}

/**
 * Step 3: Determine which components are needed based on the high-level plan
 */
async function determineRequiredComponents(highLevelPlan, apiComponents) {
    const componentsList = apiComponents.map(comp =>
        `- ${comp.name} (${comp.category}): ${comp.description} `
    ).join('\n');

    const prompt = `
You are an expert software architect analyzing a high-level plan to determine required API components.

HIGH-LEVEL PLAN:
${highLevelPlan}

AVAILABLE API COMPONENTS:
 ${componentsList}

    The agent has the following structure:
    - The entrypoint of agent is codebolt.onUserMessage(message).
    For Example:
    
    \`\`\`
    import { codebolt } from "codebolt";
    
    codebolt.onUserMessage(message){
        // perform action on message
    }
    \`\`\`
    - This is called when the user sends a message to your agent. inside this function you can perform actions on the message.
    - There are multiple actions that you can perform on the message which are listed below. Please tell me in response that what action you want to know in detail.
    Actions list:
    

    - A typical logic of an agent would be the following:
    \`\`\`
    codebolt.onUserMessage(message){
        // get all the data from the message object and create a prompt for the llm
        // call the llm with the prompt
        // get the response from the llm and find out which action to perform or which tool to run these tools are actions defined above
        // these tools include things like performing actions on code, like read write file execute command etc. or sending messages to the user like sendMessageToUser(message)
        // run those tools locally using the codebolt library actions above and get the response
        // send those response back to the llm in a formatted way to the llm.
        // keep repeating the process untill the llm sends a completion message.
        // once you get the completion message then end the loop and function.
    }
    \`\`\`
    
    This is the core agentic loop. I will show you an example of how to use the codebolt library to perform actions on the message.
    \`\`\`
    agentic loop example:
    async function startTask(task: string, images: string[] = []) {
              // Reset state
              apiConversationHistory = [];
              consecutiveMistakeCount = 0;
              isAborted = false;
              
              // Get project path
              const { projectPath } = await codebolt.project.getProjectPath();
              if (projectPath) {
                  cwd = projectPath;
              }
              
              await sendMessageToUI(task, "text");
              
              // Format initial content
              const imageBlocks = formatImagesIntoBlocks(images);
              let userContent: UserContent = [
                  { type: "text", text: \`<task>\n$<userTask>\n</task>\` },
                  ...imageBlocks,
              ];
              
              // Main processing loop
              let includeFileDetails = true;
              while (!isAborted) {
                  const didEndLoop = await processApiResponse(userContent);
                  
                  if (didEndLoop) {
                      break;
                  }
                  
                  // Continue with next iteration
                  userContent = [{
                      type: "text",
                      text: "If you have completed the user's task, use the attempt_completion tool. If you require additional information from the user, use the ask_followup_question tool. Otherwise, proceed with the next step of the task."
                  }];
                  
                  consecutiveMistakeCount++;
                  includeFileDetails = false;
              }
    }
    
    
    \`\`\`
    
    The user might have certain requirements like they would want to read a file first and then do an agentic loop along with the file contents, or they might want to write a file at the end of each step of each agentic loop.
    in that ways you can put their custom code in the agentic loop.


    Full example agent is given below:

    ====
    ${fs.readFileSync('./exampleAgent.md', 'utf8')}
    ====




Based on the high-level plan, identify which API components would be needed to implement the requested functionality.

For each required component, explain:
1. Component name
2. Why it's needed for this specific project
3. How it will be used in the implementation

Only select components that are directly relevant to implementing the functionality described in the plan.

Format your response as a JSON array of component names that are required:
["component_name_1", "component_name_2", ...]

Be selective - only include components that are actually necessary for the implementation.

Example Agent:
${fs.readFileSync('./exampleAgent.md', 'utf8')}

`;

   const response = await codebolt.llm.inference({messages:[{"role":"user","content":prompt}]});
   codebolt.chat.sendMessage(response.message);
   console.log(JSON.stringify(response.message));

   const responseText = response.message.trim();

    try {
        // Extract JSON array from response
        const jsonMatch = responseText.match(/\[(.*?)\]/s);
        if (jsonMatch) {
            const componentsArray = JSON.parse(jsonMatch[0]);
            return componentsArray;
        } else {
            // Fallback: extract component names from text
            const names = apiComponents
                .filter(comp => responseText.toLowerCase().includes(comp.name.toLowerCase()))
                .map(comp => comp.name);
            return names;
        }
    } catch (error) {
        console.warn('Could not parse JSON response, falling back to text analysis');
        // Fallback: find component names mentioned in the response
        const names = apiComponents
            .filter(comp => responseText.toLowerCase().includes(comp.name.toLowerCase()))
            .map(comp => comp.name);
        return names;
    }
}

/**
 * Step 4: Get detailed information for the required components
 */
async function getComponentDetails(requiredComponents) {
    const details = [];

    for (const componentName of requiredComponents) {
        try {
            const response = await fetch(`${config.backendUrl}/api/interfaces/${encodeURIComponent(componentName)}`);
            if (!response.ok) {
                console.warn(`Could not fetch details for component: ${componentName}`);
                continue;
            }

            const data = await response.json();
            if (data.success) {
                details.push(data.data);
            }
        } catch (error) {
            console.warn(`Error fetching details for ${componentName}:`, error);
        }
    }
    console.log(JSON.stringify(details));
    return details;
}

/**
 * Step 5: Generate the final Codebolt AI agent code
 */
async function generateCodeboltAgent(userRequest, highLevelPlan, componentDetails,reqMessage) {
    try {
        
    
    const componentsInfo = componentDetails.map(comp => `
## ${comp.name} (${comp.category})
**Description:** ${comp.description}
**Method:** ${comp.function}
**Examples:**
${Object.entries(comp.examples || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
**Tags:** ${comp.tags}
`).join('\n');

    const systemPrompt = `
You are an expert Codebolt AI agent developer. Your task is to generate a complete Codebolt AI agent based on the user request in typescript, high-level plan, and available API components.

USER REQUEST:
"${userRequest}"

HIGH-LEVEL PLAN:
${highLevelPlan}

AVAILABLE API COMPONENTS:
${componentsInfo}
IMPORTANT NOTE: You **MUST** create your agent inside the \`.codeboltAgents/agents/<meaningful-name>\` folder. with typescript node js. Place your complete agent definition there for proper Codebolt project structure and discoverability. This is required for correct deployment and functioning.

Example:
- Path: \`.codeboltAgents/agents/<meaningful-name>\`


Generate a complete Codebolt AI agent that implements the requested functionality. The agent should:

1. Have a clear, descriptive name
2. Include a detailed description of what it does
3. Implement the functionality described in the user request
4. Use the appropriate API components from the list above
5. Handle errors gracefully
6. Include helpful comments and documentation
7. Follow Codebolt AI agent best practices

Format the output as a complete Codebolt AI agent definition with:
- Agent metadata (name, description, version)
- Required dependencies/imports
- Main implementation code
- Error handling
- Usage examples

Make sure the code is production-ready and follows best practices for maintainability and reliability.

IMPORTANT: 
- Use only the API components that were provided above
- Include proper error handling
- Add clear documentation and comments
- Make the agent modular and reusable
- Include usage examples
The agent has the following structure:
    - The entrypoint of agent is codebolt.onUserMessage(message).
    For Example:
    
    \`\`\`
    import { codebolt } from "codebolt";
    
    codebolt.onUserMessage(message){
        // perform action on message
    }
    \`\`\`
    - This is called when the user sends a message to your agent. inside this function you can perform actions on the message.
    - There are multiple actions that you can perform on the message which are listed below. Please tell me in response that what action you want to know in detail.
    Actions list:
    

    - A typical logic of an agent would be the following:
    \`\`\`
    codebolt.onUserMessage(message){
        // get all the data from the message object and create a prompt for the llm
        // call the llm with the prompt
        // get the response from the llm and find out which action to perform or which tool to run these tools are actions defined above
        // these tools include things like performing actions on code, like read write file execute command etc. or sending messages to the user like sendMessageToUser(message)
        // run those tools locally using the codebolt library actions above and get the response
        // send those response back to the llm in a formatted way to the llm.
        // keep repeating the process untill the llm sends a completion message.
        // once you get the completion message then end the loop and function.
    }
    \`\`\`

    - Processors setup 
     
    \`\`\`
     let promptGenerator = new InitialPromptGenerator({

            processors: [
                // 1. Chat History
                new ChatHistoryMessageModifier({enableChatHistory:true}),
                // 2. Environment Context (date, OS)
                new EnvironmentContextModifier({ enableFullContext: true }),

                // 3. Directory Context (folder structure)  
                new DirectoryContextModifier(),

                // 4. IDE Context (active file, opened files)
                new IdeContextModifier({
                    includeActiveFile: true,
                    includeOpenFiles: true,
                    includeCursorPosition: true,
                    includeSelectedText: true
                }),
                // 5. Core System Prompt (instructions)
                new CoreSystemPromptModifier(
                    { customSystemPrompt: systemPrompt }
                ),

                // 6. Tools (function declarations)
                new ToolInjectionModifier({
                    includeToolDescriptions: true
                }),

                // 7. At-file processing (@file mentions)
                new AtFileProcessorModifier({
                    enableRecursiveSearch: true
                })
            ],
            baseSystemPrompt: systemPrompt
        });
    \`\`\`
    
    This is the core agentic loop. I will show you an example of how to use the codebolt library to perform actions on the message.
    \`\`\`
    agentic loop example:
     let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
        let completed = false;
        do {
            let agent = new AgentStep({ preInferenceProcessors: [], postInferenceProcessors: [] })
            let result: AgentStepOutput = await agent.executeStep(reqMessage, prompt); //Primarily for LLM Calling and has 
            prompt = result.nextMessage;
       
            let responseExecutor = new ResponseExecutor({
                preToolCallProcessors: [],
                postToolCallProcessors: []

            })
            let executionResult = await responseExecutor.executeResponse({
                initailUserMessage: reqMessage,
                actualMessageSentToLLM: result.actualMessageSentToLLM,
                rawLLMOutput: result.rawLLMResponse,
                nextMessage: result.nextMessage,
            });

            completed = executionResult.completed;
            prompt = executionResult.nextMessage;


            if (completed) {
                break;
            }

        } while (!completed);

    \`\`\`
    
    The user might have certain requirements like they would want to read a file first and then do an agentic loop along with the file contents, or they might want to write a file at the end of each step of each agentic loop.
    in that ways you can put their custom code in the agentic loop.

    Full example agent is given below:
    ====
    ${fs.readFileSync('./exampleAgent.md', 'utf8')}
    ====

    Must Always first generate codeboltagent.yaml 
    here is sample yaml file
    ===
    ${fs.readFileSync('./codeboltagent.yaml')}
    ===
`;

console.log(systemPrompt)
    // const response = await codebolt.llm.inference({messages:[{"role":"user","content":prompt}]});
    // return response.message

    try {
 
        // codebolt.chat.sendMessage("Gemini agent started", {})
        // codebolt.chat.sendMessage(JSON.stringify(reqMessage),{})
        let promptGenerator = new InitialPromptGenerator({

            processors: [
                // 1. Chat History
                new ChatHistoryMessageModifier({enableChatHistory:true}),
                // 2. Environment Context (date, OS)
                new EnvironmentContextModifier({ enableFullContext: true }),

                // 3. Directory Context (folder structure)  
                new DirectoryContextModifier(),

                // 4. IDE Context (active file, opened files)
                new IdeContextModifier({
                    includeActiveFile: true,
                    includeOpenFiles: true,
                    includeCursorPosition: true,
                    includeSelectedText: true
                }),
                // 5. Core System Prompt (instructions)
                new CoreSystemPromptModifier(
                    { customSystemPrompt: systemPrompt }
                ),

                // 6. Tools (function declarations)
                new ToolInjectionModifier({
                    includeToolDescriptions: true
                }),

                // 7. At-file processing (@file mentions)
                new AtFileProcessorModifier({
                    enableRecursiveSearch: true
                })
            ],
            baseSystemPrompt: systemPrompt
        });
        let prompt = await promptGenerator.processMessage(reqMessage);
        let completed = false;
        do {
            let agent = new AgentStep({ preInferenceProcessors: [], postInferenceProcessors: [] })
            let result = await agent.executeStep(reqMessage, prompt); //Primarily for LLM Calling and has 
            prompt = result.nextMessage;
       
            let responseExecutor = new ResponseExecutor({
                preToolCallProcessors: [],
                postToolCallProcessors: []

            })
            let executionResult = await responseExecutor.executeResponse({
                initailUserMessage: reqMessage,
                actualMessageSentToLLM: result.actualMessageSentToLLM,
                rawLLMOutput: result.rawLLMResponse,
                nextMessage: result.nextMessage,
            });

            completed = executionResult.completed;
            prompt = executionResult.nextMessage;


            if (completed) {
                break;
            }

        } while (!completed);





    } catch (error) {
        console.error('❌ Error generating agent:', error);
    }
} catch (error) {
    console.error('❌ Error generating agent:', error);
}
   
}

/**
 * Utility method to search for specific API components
 */
async function searchAPIComponents(query, category = null, config) {
    try {
        let url = `${config.backendUrl}/api/interfaces/search?query=${encodeURIComponent(query)}`;
        if (category) {
            url += `&category=${encodeURIComponent(category)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Search API error: ${response.status}`);
        }

        const data = await response.json();
        return data.success ? data.interfaces : [];
    } catch (error) {
        console.error('Error searching API components:', error);
        return [];
    }
}

// Export functions for use in other modules
module.exports = {
    createHighLevelPlan,
    getAPIComponentsList,
    determineRequiredComponents,
    getComponentDetails,
    generateCodeboltAgent,
    searchAPIComponents
};