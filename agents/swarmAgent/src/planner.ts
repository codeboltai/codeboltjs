import codebolt from '@codebolt/codeboltjs';

import {
    InitialPromptGenerator,
    ResponseExecutor
} from '@codebolt/agent/unified';
import { FlatUserMessage } from "@codebolt/types/sdk";
import {
    EnvironmentContextModifier,
    CoreSystemPromptModifier,
    DirectoryContextModifier,
    IdeContextModifier,
    AtFileProcessorModifier,
    ToolInjectionModifier,
    ChatHistoryMessageModifier
} from '@codebolt/agent/processor-pieces';



import { AgentStep } from '@codebolt/agent/unified';
import { AgentStepOutput, ProcessedMessage } from '@codebolt/types/agent';
import { llmWithJsonRetry } from './utils';

interface PlannerManifest {
    fileIntents?: Array<{
        path?: string;
        paths?: string[];
        description: string;
        modificationType: "create" | "update" | "delete";
    }>;
    structureUpdates?: {
        packages?: Array<{
            name: string;
            path: string;
            description: string;
        }>;
        dependencies?: Array<{
            packageName: string;
            dependencyName: string;
            version: string;
        }>;
    };
}

let systemPrompt = `You are a Planner Agent. Your goal is to analyze the request and create a detailed implementation plan.
    
    ## Core Principles
    *   **Strictly Read-Only (mostly):** You can inspect files, navigate code repositories.
    *   **Write permission:** You are ONLY allowed to write to the specs file.
    *   **Valid Markdown:** The output file must be strictly valid Markdown (.md).

    ## Plan Format Requirement (CRITICAL)
    You MUST include a section at the end of your plan called "## Structured Manifest".
    This section must contain a JSON code block with the following structure:
    \`\`\`json
    {
        "fileIntents": [
            { "paths": ["string (relative path)", "string (relative path)"], "description": "string", "modificationType": "create" | "update" | "delete" }
        ],
        "structureUpdates": {
            "packages": [ { "name": "string", "path": "string", "description": "string" } ],
            "dependencies": [ { "packageName": "string", "dependencyName": "string", "version": "string" } ]
        }
    }
    \`\`\`
    This JSON block allows other agents to automatically register your planned changes.
    **IMPORTANT:** Group related file changes into a single intent where possible by using the "paths" array.

    ## Steps
    1.  **Analyze:** specific request and codebase.
    2.  **Plan:** Create a step-by-step plan.
    3.  **Write:** Write the plan to the file specified in the user request (e.g. \`plans/agent_123-my_job.md\`). This is Mandatory.
    4.  **Finish:** Once the file is written, the task is complete.

    `.trim();

export const plannerAgent = (async (reqMessage: FlatUserMessage, planFileName: string) => {
    //Detail Planner Agent
    try {

        codebolt.chat.sendMessage("Planner agent started", {})
        // codebolt.chat.sendMessage(JSON.stringify(reqMessage),{})
        let promptGenerator = new InitialPromptGenerator({

            processors: [
                // 1. Chat History
                new ChatHistoryMessageModifier({ enableChatHistory: true }),
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
                initialUserMessage: reqMessage,
                actualMessageSentToLLM: result.actualMessageSentToLLM,
                rawLLMOutput: result.rawLLMResponse,
                nextMessage: result.nextMessage,
            });

            completed = executionResult.completed;
            prompt = executionResult.nextMessage;


            if (completed) {
                try {
                    codebolt.chat.sendMessage("Planner loop completed, starting post-processing...", {});

                    if (planFileName) {
                        codebolt.chat.sendMessage(`Reading plan file from: ${planFileName}`, {});
                        const fileResponse: any = await codebolt.fs.readFile(planFileName);
                        const planContent = fileResponse.content || fileResponse;

                        // 2. prompt LLM to extract intents and structure updates
                        const extractionSystemPrompt = `
                            You are a Plan Parser. 
                            Your goal is to extract the specialized "Structured Manifest" from the provided Implementation Plan.
                            
                            Look for the JSON block under "## Structured Manifest".
                            If found, return that JSON exactly.
                            
                            If NOT found, attempt to infer the structure from the text as a fallback, using this format:
                            {
                                "fileIntents": [
                                    { "paths": ["string (relative path)"], "description": "string", "modificationType": "create" | "update" | "delete" }
                                ],
                                "structureUpdates": {
                                    "packages": [ { "name": "string", "path": "string", "description": "string" } ],
                                    "dependencies": [ { "packageName": "string", "dependencyName": "string", "version": "string" } ]
                                }
                            }
                            `;


                        codebolt.chat.sendMessage("Extracting structured manifest...", {});
                        const parsedData = await llmWithJsonRetry<PlannerManifest>(extractionSystemPrompt, planContent);

                        if (parsedData) {
                            codebolt.chat.sendMessage(`Parsed plan data: ${JSON.stringify(parsedData, null, 2)}`, {});

                            // 3. Register File Update Intents
                            if (parsedData.fileIntents && Array.isArray(parsedData.fileIntents)) {
                                codebolt.chat.sendMessage(`Found ${parsedData.fileIntents.length} intent groups to process.`, {});
                                for (const intent of parsedData.fileIntents) {

                                    const targetPaths: string[] = [];
                                    if (intent.paths && Array.isArray(intent.paths)) {
                                        targetPaths.push(...intent.paths);
                                    } else if (intent.path) {
                                        targetPaths.push(intent.path);
                                    }

                                    if (targetPaths.length === 0) {
                                        codebolt.chat.sendMessage("Skipping intent with missing path(s).", {});
                                        continue;
                                    }

                                    codebolt.chat.sendMessage(`Processing intent for files: ${targetPaths.join(', ')}`, {});

                                    try {
                                        // Create intent with multiple files
                                        await codebolt.fileUpdateIntent.create({
                                            environmentId: 'local-default',
                                            files: targetPaths.map(p => ({
                                                filePath: p,
                                                intentLevel: 3 // Priority-Based
                                            })),
                                            description: intent.description || "Planned update",
                                            priority: 3 // Medium priority for planned changes
                                        }, "planner-agent", "Planner Agent");
                                        codebolt.chat.sendMessage(`Successfully created intent for ${targetPaths.length} files`, {});
                                    } catch (err) {
                                        codebolt.chat.sendMessage(`❌ Failed to create intent for ${targetPaths.join(', ')}: ${err}`, {});
                                        console.error(err);
                                    }
                                }
                            } else {
                                codebolt.chat.sendMessage("No file intents found in parsed data.", {});
                            }

                            // 4. Update Project Structure (basic implementation)
                            if (parsedData.structureUpdates) {
                                if (parsedData.structureUpdates.packages && Array.isArray(parsedData.structureUpdates.packages)) {
                                    for (const pkg of parsedData.structureUpdates.packages) {
                                        codebolt.chat.sendMessage(`Noted package structure update for: ${pkg.name}`, {});
                                    }
                                }
                            }

                            codebolt.chat.sendMessage("Plan synchronization complete. File intents registered.", {});
                        } else {
                            codebolt.chat.sendMessage("❌ Failed to extract structured manifest from plan.", {});
                        }

                    } else {
                        codebolt.chat.sendMessage("No planFileName provided to planner agent.", {});
                    }
                } catch (postProcessError) {
                    console.error("Error during post-processing:", postProcessError);
                }
                break;
            }

        } while (!completed);



    } catch (error) {
        console.error("Planner agent error:", error);
    }

})
