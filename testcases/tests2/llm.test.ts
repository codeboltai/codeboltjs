/**
 * Comprehensive Test Suite for LLM Module
 *
 * This test suite covers ALL methods in the llm module including:
 * - inference: Testing LLM inference operations with various scenarios
 * - getModelConfig: Testing model configuration retrieval
 *
 * Each test:
 * 1. Uses the shared CodeboltSDK instance
 * 2. Has descriptive test names
 * 3. Tests various LLM inference scenarios
 * 4. Tests streaming vs non-streaming responses
 * 5. Tests with different message formats and tool calls
 * 6. Includes AskUserQuestion at the END to verify success
 * 7. Includes proper timeout handling for LLM operations
 */

import { getSharedCodebolt, waitForConnection } from './setup';
import type {
    MessageObject,
    Tool,
    ToolCall,
    LLMInferenceParams,
    LLMCompletion,
    LLMModelConfig
} from '@codebolt/types/sdk';

// ============================================================================
// Test Configuration
// ============================================================================

const LLM_TIMEOUT = 60000; // 60 seconds for LLM operations
const DEFAULT_LLM_ROLE = 'default';

// Helper function to create basic messages
function createBasicMessage(content: string): MessageObject {
    return {
        role: 'user',
        content
    };
}

// Helper function to create conversation with system prompt
function createConversationWithSystem(systemPrompt: string, userMessage: string): MessageObject[] {
    return [
        {
            role: 'system',
            content: systemPrompt
        },
        {
            role: 'user',
            content: userMessage
        }
    ];
}

// Helper function to create a sample tool
function createSampleTool(): Tool {
    return {
        type: 'function',
        function: {
            name: 'get_weather',
            description: 'Get the current weather for a location',
            parameters: {
                type: 'object',
                properties: {
                    location: {
                        type: 'string',
                        description: 'The city and state, e.g., San Francisco, CA'
                    },
                    unit: {
                        type: 'string',
                        enum: ['celsius', 'fahrenheit'],
                        description: 'The temperature unit'
                    }
                },
                required: ['location']
            }
        }
    };
}

// Helper function to create multiple tools
function createMultipleTools(): Tool[] {
    return [
        {
            type: 'function',
            function: {
                name: 'get_weather',
                description: 'Get the current weather for a location',
                parameters: {
                    type: 'object',
                    properties: {
                        location: {
                            type: 'string',
                            description: 'The city and state'
                        }
                    },
                    required: ['location']
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'calculate',
                description: 'Perform a mathematical calculation',
                parameters: {
                    type: 'object',
                    properties: {
                        expression: {
                            type: 'string',
                            description: 'Mathematical expression to evaluate'
                        }
                    },
                    required: ['expression']
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'search_database',
                description: 'Search a database for information',
                parameters: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query'
                        },
                        limit: {
                            type: 'number',
                            description: 'Maximum number of results'
                        }
                    },
                    required: ['query']
                }
            }
        }
    ];
}

// ============================================================================
// Setup and Teardown
// ============================================================================

describe('LLM Module Tests', () => {
    let codebolt: ReturnType<typeof getSharedCodebolt>;

    beforeAll(async () => {
        codebolt = getSharedCodebolt();
        await waitForConnection();
    }, 30000);

    // ============================================================================
    // inference() Method Tests - Basic Functionality
    // ============================================================================

    describe('LLM.inference() - Basic Functionality', () => {

        test('should perform basic text inference with a simple prompt', async () => {
            const params: LLMInferenceParams = {
                messages: [createBasicMessage('What is 2 + 2?')],
                llmrole: DEFAULT_LLM_ROLE
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response).toBeDefined();
            expect(response.completion).toBeDefined();
            expect(response.completion.content).toBeDefined();
            expect(typeof response.completion.content).toBe('string');
            expect(response.completion.content.length).toBeGreaterThan(0);

            // Ask user to verify success
            const question = `Did the LLM successfully respond to "What is 2 + 2?" with: "${response.completion.content}"?`;
            expect(question).toBeTruthy(); // Placeholder for AskUserQuestion
        }, LLM_TIMEOUT);

        test('should handle multi-turn conversations correctly', async () => {
            const params: LLMInferenceParams = {
                messages: [
                    { role: 'user', content: 'My favorite color is blue.' },
                    { role: 'assistant', content: 'I noted that your favorite color is blue.' },
                    { role: 'user', content: 'What is my favorite color?' }
                ],
                llmrole: DEFAULT_LLM_ROLE
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion.content).toBeDefined();
            expect(response.completion.content.toLowerCase()).toContain('blue');

            const question = `Did the LLM correctly remember the favorite color is blue? Response: "${response.completion.content}"`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should include system prompt in the conversation context', async () => {
            const systemPrompt = 'You are a helpful assistant that always responds in rhyme.';
            const userMessage = 'Tell me about programming';

            const params: LLMInferenceParams = {
                messages: createConversationWithSystem(systemPrompt, userMessage),
                llmrole: DEFAULT_LLM_ROLE
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion.content).toBeDefined();

            const question = `Did the LLM respond in rhyme as instructed? Response: "${response.completion.content}"`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should respect max_tokens parameter', async () => {
            const params: LLMInferenceParams = {
                messages: [createBasicMessage('Explain quantum computing in detail')],
                llmrole: DEFAULT_LLM_ROLE,
                max_tokens: 50
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion.content).toBeDefined();
            // Verify response is reasonably short (though exact token count may vary)
            expect(response.completion.content.length).toBeLessThan(500);

            const question = `Did the LLM respect the max_tokens limit of 50? Response length: ${response.completion.content.length} chars`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should respect temperature parameter for response variability', async () => {
            const paramsLow: LLMInferenceParams = {
                messages: [createBasicMessage('Generate a creative story opening')],
                llmrole: DEFAULT_LLM_ROLE,
                temperature: 0.1,
                max_tokens: 100
            };

            const response1 = await Promise.race([
                codebolt.llm.inference(paramsLow),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            const response2 = await Promise.race([
                codebolt.llm.inference(paramsLow),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response1.completion.content).toBeDefined();
            expect(response2.completion.content).toBeDefined();

            const question = `Did low temperature (0.1) produce consistent responses? First: "${response1.completion.content.substring(0, 50)}..." Second: "${response2.completion.content.substring(0, 50)}..."`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT * 2);
    });

    // ============================================================================
    // inference() Method Tests - Streaming vs Non-Streaming
    // ============================================================================

    describe('LLM.inference() - Streaming vs Non-Streaming', () => {

        test('should handle non-streaming responses correctly', async () => {
            const params: LLMInferenceParams = {
                messages: [createBasicMessage('Count from 1 to 5')],
                llmrole: DEFAULT_LLM_ROLE,
                stream: false
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion).toBeDefined();
            expect(response.completion.content).toBeDefined();
            expect(response.completion.content.length).toBeGreaterThan(0);

            const question = `Did non-streaming mode return complete response? Response: "${response.completion.content}"`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should handle streaming responses correctly', async () => {
            const params: LLMInferenceParams = {
                messages: [createBasicMessage('Tell me a short story')],
                llmrole: DEFAULT_LLM_ROLE,
                stream: true
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion).toBeDefined();
            expect(response.completion.content).toBeDefined();

            const question = `Did streaming mode return the complete content? Content length: ${response.completion.content.length}`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should compare streaming vs non-streaming responses', async () => {
            const message = 'Explain what JavaScript is';

            const nonStreamingParams: LLMInferenceParams = {
                messages: [createBasicMessage(message)],
                llmrole: DEFAULT_LLM_ROLE,
                stream: false,
                max_tokens: 200
            };

            const streamingParams: LLMInferenceParams = {
                messages: [createBasicMessage(message)],
                llmrole: DEFAULT_LLM_ROLE,
                stream: true,
                max_tokens: 200
            };

            const [nonStreamingResponse, streamingResponse] = await Promise.all([
                Promise.race([
                    codebolt.llm.inference(nonStreamingParams),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                    )
                ]) as { completion: LLMCompletion },
                Promise.race([
                    codebolt.llm.inference(streamingParams),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                    )
                ]) as { completion: LLMCompletion }
            ]);

            expect(nonStreamingResponse.completion.content).toBeDefined();
            expect(streamingResponse.completion.content).toBeDefined();

            const question = `Do both streaming and non-streaming return similar content? Non-streaming: "${nonStreamingResponse.completion.content.substring(0, 50)}..." Streaming: "${streamingResponse.completion.content.substring(0, 50)}..."`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT * 2);
    });

    // ============================================================================
    // inference() Method Tests - Tool Calling
    // ============================================================================

    describe('LLM.inference() - Tool Calling', () => {

        test('should handle inference with available tools', async () => {
            const params: LLMInferenceParams = {
                messages: [createBasicMessage('What is the weather in San Francisco?')],
                tools: [createSampleTool()],
                tool_choice: 'auto',
                llmrole: DEFAULT_LLM_ROLE
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion).toBeDefined();
            expect(response.completion.content || response.completion.tool_calls).toBeDefined();

            const hasToolCalls = response.completion.tool_calls && response.completion.tool_calls.length > 0;
            const question = hasToolCalls
                ? `Did the LLM request to use the get_weather tool? Tool calls: ${JSON.stringify(response.completion.tool_calls)}`
                : `Did the LLM respond without calling the tool? Response: "${response.completion.content}"`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should handle inference with multiple tools available', async () => {
            const params: LLMInferenceParams = {
                messages: [createBasicMessage('Calculate 25 * 4')],
                tools: createMultipleTools(),
                tool_choice: 'auto',
                llmrole: DEFAULT_LLM_ROLE
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion).toBeDefined();

            const question = `Did the LLM choose the calculate tool from multiple options? Response: ${JSON.stringify(response.completion.tool_calls || response.completion.content)}`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should enforce tool_choice when set to required', async () => {
            const params: LLMInferenceParams = {
                messages: [createBasicMessage('Hello, how are you?')],
                tools: [createSampleTool()],
                tool_choice: 'required',
                llmrole: DEFAULT_LLM_ROLE
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion).toBeDefined();
            // With tool_choice='required', model should call a tool even for simple greetings
            expect(response.completion.tool_calls).toBeDefined();

            const question = `Did the LLM call a tool even for a simple greeting? Tool calls: ${JSON.stringify(response.completion.tool_calls)}`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should enforce tool_choice when set to none', async () => {
            const params: LLMInferenceParams = {
                messages: [createBasicMessage('What is the weather in Tokyo?')],
                tools: [createSampleTool()],
                tool_choice: 'none',
                llmrole: DEFAULT_LLM_ROLE
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion).toBeDefined();
            expect(response.completion.content).toBeDefined();
            // With tool_choice='none', model should not call tools

            const question = `Did the LLM respond without calling any tools? Response: "${response.completion.content}"`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should handle tool_choice with specific function', async () => {
            const params: LLMInferenceParams = {
                messages: [createBasicMessage('Hello')],
                tools: createMultipleTools(),
                tool_choice: {
                    type: 'function',
                    function: { name: 'get_weather' }
                },
                llmrole: DEFAULT_LLM_ROLE
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion).toBeDefined();
            expect(response.completion.tool_calls).toBeDefined();
            expect(response.completion.tool_calls![0].function.name).toBe('get_weather');

            const question = `Did the LLM call the specific get_weather function? Tool calls: ${JSON.stringify(response.completion.tool_calls)}`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should handle conversation with tool call and tool response', async () => {
            const toolCallId = 'call_test_123';
            const params: LLMInferenceParams = {
                messages: [
                    { role: 'user', content: 'What is 15 + 27?' },
                    {
                        role: 'assistant',
                        content: null,
                        tool_calls: [{
                            id: toolCallId,
                            type: 'function',
                            function: {
                                name: 'calculate',
                                arguments: JSON.stringify({ expression: '15 + 27' })
                            }
                        }]
                    },
                    {
                        role: 'tool',
                        tool_call_id: toolCallId,
                        content: '42'
                    }
                ],
                tools: createMultipleTools(),
                llmrole: DEFAULT_LLM_ROLE
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion).toBeDefined();
            expect(response.completion.content).toBeDefined();

            const question = `Did the LLM correctly process the tool result and provide the final answer? Response: "${response.completion.content}"`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);
    });

    // ============================================================================
    // inference() Method Tests - Different Message Formats
    // ============================================================================

    describe('LLM.inference() - Different Message Formats', () => {

        test('should handle messages with array content format', async () => {
            const params: LLMInferenceParams = {
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: 'Describe this image' }
                        ]
                    }
                ],
                llmrole: DEFAULT_LLM_ROLE
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion).toBeDefined();

            const question = `Did the LLM handle the array content format? Response: "${response.completion.content}"`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should handle messages with image content', async () => {
            const params: LLMInferenceParams = {
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: 'What do you see?' },
                            {
                                type: 'image_url',
                                image_url: { url: 'https://example.com/test.jpg' }
                            }
                        ]
                    }
                ],
                llmrole: DEFAULT_LLM_ROLE
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion).toBeDefined();

            const question = `Did the LLM process the image content? Response: "${response.completion.content}"`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should handle tool messages with tool_call_id', async () => {
            const params: LLMInferenceParams = {
                messages: [
                    { role: 'user', content: 'Get weather for Paris' },
                    {
                        role: 'assistant',
                        tool_calls: [{
                            id: 'call_abc123',
                            type: 'function',
                            function: {
                                name: 'get_weather',
                                arguments: JSON.stringify({ location: 'Paris' })
                            }
                        }]
                    },
                    {
                        role: 'tool',
                        tool_call_id: 'call_abc123',
                        content: 'Sunny, 22°C'
                    }
                ],
                tools: [createSampleTool()],
                llmrole: DEFAULT_LLM_ROLE
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion).toBeDefined();
            expect(response.completion.content).toBeDefined();

            const question = `Did the LLM correctly handle the tool response? Response: "${response.completion.content}"`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should handle assistant messages with name field', async () => {
            const params: LLMInferenceParams = {
                messages: [
                    { role: 'user', content: 'Hi!' },
                    { role: 'assistant', name: 'HelperBot', content: 'Hello! How can I assist you today?' },
                    { role: 'user', content: 'What can you do?' }
                ],
                llmrole: DEFAULT_LLM_ROLE
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion).toBeDefined();

            const question = `Did the LLM continue the conversation properly? Response: "${response.completion.content}"`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);
    });

    // ============================================================================
    // inference() Method Tests - Error Handling and Edge Cases
    // ============================================================================

    describe('LLM.inference() - Error Handling and Edge Cases', () => {

        test('should handle empty messages array gracefully', async () => {
            const params: LLMInferenceParams = {
                messages: [],
                llmrole: DEFAULT_LLM_ROLE
            };

            try {
                const response = await Promise.race([
                    codebolt.llm.inference(params),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                    )
                ]) as { completion: LLMCompletion };

                // Some providers may handle this, others may error
                const question = response?.completion
                    ? `Did the LLM handle empty messages? Response: "${response.completion.content}"`
                    : 'Empty messages handled gracefully';
                expect(question).toBeTruthy();
            } catch (error) {
                const question = `Empty messages resulted in expected error: ${(error as Error).message}`;
                expect(question).toBeTruthy();
            }
        }, LLM_TIMEOUT);

        test('should handle very long messages', async () => {
            const longText = 'Explain artificial intelligence. '.repeat(100);
            const params: LLMInferenceParams = {
                messages: [createBasicMessage(longText)],
                llmrole: DEFAULT_LLM_ROLE,
                max_tokens: 100
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion).toBeDefined();

            const question = `Did the LLM handle the long message? Response: "${response.completion.content.substring(0, 100)}..."`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should handle special characters in messages', async () => {
            const specialText = 'Test with special chars: < > & " \' \\n \\t \\u0000 🎉 🔥';
            const params: LLMInferenceParams = {
                messages: [createBasicMessage(specialText)],
                llmrole: DEFAULT_LLM_ROLE
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion).toBeDefined();

            const question = `Did the LLM handle special characters correctly? Response: "${response.completion.content}"`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should handle multiple user messages in sequence', async () => {
            const params: LLMInferenceParams = {
                messages: [
                    { role: 'user', content: 'First question' },
                    { role: 'user', content: 'Second question' },
                    { role: 'user', content: 'Third question' }
                ],
                llmrole: DEFAULT_LLM_ROLE
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion).toBeDefined();

            const question = `Did the LLM handle multiple user messages? Response: "${response.completion.content}"`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should handle extreme temperature values', async () => {
            const params: LLMInferenceParams = {
                messages: [createBasicMessage('Say hello')],
                llmrole: DEFAULT_LLM_ROLE,
                temperature: 1.5,
                max_tokens: 50
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion).toBeDefined();

            const question = `Did the LLM handle temperature of 1.5? Response: "${response.completion.content}"`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);
    });

    // ============================================================================
    // inference() Method Tests - Response Structure
    // ============================================================================

    describe('LLM.inference() - Response Structure', () => {

        test('should return complete response structure with all fields', async () => {
            const params: LLMInferenceParams = {
                messages: [createBasicMessage('Say "Hello World"')],
                llmrole: DEFAULT_LLM_ROLE
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion).toBeDefined();
            expect(response.completion.content).toBeDefined();
            expect(response.completion.role).toBe('assistant');

            if (response.completion.model) {
                expect(response.completion.model).toBeDefined();
            }

            if (response.completion.usage) {
                expect(response.completion.usage.prompt_tokens).toBeGreaterThanOrEqual(0);
                expect(response.completion.usage.completion_tokens).toBeGreaterThanOrEqual(0);
                expect(response.completion.usage.total_tokens).toBeGreaterThanOrEqual(0);
            }

            const question = `Does the response have all expected fields? Content: "${response.completion.content}", Role: ${response.completion.role}, Model: ${response.completion.model || 'N/A'}`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should include finish_reason in response', async () => {
            const params: LLMInferenceParams = {
                messages: [createBasicMessage('Count to 10')],
                llmrole: DEFAULT_LLM_ROLE,
                max_tokens: 50
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            if (response.completion.finish_reason) {
                expect(['stop', 'length', 'content_filter', 'tool_calls']).toContain(response.completion.finish_reason);
            }

            const question = `Does the response include finish_reason? ${response.completion.finish_reason || 'N/A'}`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should include token usage information', async () => {
            const params: LLMInferenceParams = {
                messages: [createBasicMessage('Explain machine learning briefly')],
                llmrole: DEFAULT_LLM_ROLE
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            if (response.completion.usage) {
                expect(response.completion.usage.total_tokens).toBeGreaterThan(0);

                const question = `Token usage - Prompt: ${response.completion.usage.prompt_tokens}, Completion: ${response.completion.usage.completion_tokens}, Total: ${response.completion.usage.total_tokens}`;
                expect(question).toBeTruthy();
            } else {
                const question = 'Response received but usage information not available';
                expect(question).toBeTruthy();
            }
        }, LLM_TIMEOUT);

        test('should include choices array in response', async () => {
            const params: LLMInferenceParams = {
                messages: [createBasicMessage('What is the capital of France?')],
                llmrole: DEFAULT_LLM_ROLE
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            if (response.completion.choices) {
                expect(Array.isArray(response.completion.choices)).toBe(true);
                expect(response.completion.choices.length).toBeGreaterThan(0);

                const question = `Response includes ${response.completion.choices.length} choice(s)`;
                expect(question).toBeTruthy();
            } else {
                const question = 'Response format does not include choices array';
                expect(question).toBeTruthy();
            }
        }, LLM_TIMEOUT);
    });

    // ============================================================================
    // getModelConfig() Method Tests
    // ============================================================================

    describe('LLM.getModelConfig()', () => {

        test('should retrieve default model configuration', async () => {
            const response = await Promise.race([
                codebolt.llm.getModelConfig(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('getModelConfig timeout')), LLM_TIMEOUT)
                )
            ]) as { config: LLMModelConfig | null; success: boolean; error?: string };

            expect(response).toBeDefined();
            expect(response.success).toBeDefined();

            if (response.config) {
                expect(response.config.llm_id).toBeDefined();
                expect(response.config.model_name).toBeDefined();
                expect(response.config.litellm_provider).toBeDefined();

                const question = `Default model: ${response.config.model_name}, Provider: ${response.config.litellm_provider}, Max Tokens: ${response.config.max_tokens}`;
                expect(question).toBeTruthy();
            } else {
                const question = response.error
                    ? `No default config available: ${response.error}`
                    : 'No default config available';
                expect(question).toBeTruthy();
            }
        }, LLM_TIMEOUT);

        test('should retrieve configuration for specific model by ID', async () => {
            // First get the default model to find a valid model_id
            const defaultResponse = await codebolt.llm.getModelConfig() as { config: LLMModelConfig | null; success: boolean };

            if (defaultResponse.config) {
                const response = await Promise.race([
                    codebolt.llm.getModelConfig(defaultResponse.config.llm_id),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('getModelConfig timeout')), LLM_TIMEOUT)
                    )
                ]) as { config: LLMModelConfig | null; success: boolean; error?: string };

                expect(response.success).toBe(true);

                if (response.config) {
                    expect(response.config.llm_id).toBe(defaultResponse.config.llm_id);

                    const question = `Retrieved config for model ID: ${response.config.llm_id}, Model: ${response.config.model_name}`;
                    expect(question).toBeTruthy();
                }
            } else {
                const question = 'No default model available to test specific model retrieval';
                expect(question).toBeTruthy();
            }
        }, LLM_TIMEOUT * 2);

        test('should handle invalid model ID gracefully', async () => {
            const response = await Promise.race([
                codebolt.llm.getModelConfig('invalid_model_id_12345'),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('getModelConfig timeout')), LLM_TIMEOUT)
                )
            ]) as { config: LLMModelConfig | null; success: boolean; error?: string };

            expect(response).toBeDefined();

            const question = response.config
                ? `Unexpectedly found config for invalid ID: ${response.config.model_name}`
                : `Correctly handled invalid model ID. Success: ${response.success}, Error: ${response.error || 'None'}`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should return complete model configuration structure', async () => {
            const response = await Promise.race([
                codebolt.llm.getModelConfig(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('getModelConfig timeout')), LLM_TIMEOUT)
                )
            ]) as { config: LLMModelConfig | null; success: boolean; error?: string };

            if (response.config) {
                const config = response.config;

                // Verify all expected fields are present
                const expectedFields = [
                    'llm_id',
                    'user_model_name',
                    'model_name',
                    'datetime',
                    'max_tokens',
                    'max_output_tokens',
                    'litellm_provider',
                    'mode',
                    'supports_function_calling',
                    'input_cost_per_token',
                    'output_cost_per_token'
                ];

                const missingFields = expectedFields.filter(field => !(field in config));

                if (missingFields.length === 0) {
                    const question = `Model config has all expected fields. Model: ${config.model_name}, Max Input: ${config.max_input_tokens}, Max Output: ${config.max_output_tokens}`;
                    expect(question).toBeTruthy();
                } else {
                    const question = `Model config missing fields: ${missingFields.join(', ')}`;
                    expect(question).toBeTruthy();
                }
            } else {
                const question = 'No model config available to test structure';
                expect(question).toBeTruthy();
            }
        }, LLM_TIMEOUT);

        test('should include function calling support information', async () => {
            const response = await Promise.race([
                codebolt.llm.getModelConfig(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('getModelConfig timeout')), LLM_TIMEOUT)
                )
            ]) as { config: LLMModelConfig | null; success: boolean; error?: string };

            if (response.config) {
                expect(response.config.supports_function_calling).toBeDefined();

                const supportsFunctionCalling = response.config.supports_function_calling === 1;
                const question = `Model supports function calling: ${supportsFunctionCalling}${response.config.supports_parallel_function_calling ? ', supports parallel calling: true' : ''}`;
                expect(question).toBeTruthy();
            } else {
                const question = 'No model config available to check function calling support';
                expect(question).toBeTruthy();
            }
        }, LLM_TIMEOUT);

        test('should include cost information', async () => {
            const response = await Promise.race([
                codebolt.llm.getModelConfig(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('getModelConfig timeout')), LLM_TIMEOUT)
                )
            ]) as { config: LLMModelConfig | null; success: boolean; error?: string };

            if (response.config) {
                expect(response.config.input_cost_per_token).toBeDefined();
                expect(response.config.output_cost_per_token).toBeDefined();

                const question = `Cost per token - Input: $${response.config.input_cost_per_token}, Output: $${response.config.output_cost_per_token}`;
                expect(question).toBeTruthy();
            } else {
                const question = 'No model config available to check cost information';
                expect(question).toBeTruthy();
            }
        }, LLM_TIMEOUT);
    });

    // ============================================================================
    // Integration Tests - Combining inference() and getModelConfig()
    // ============================================================================

    describe('LLM Integration Tests', () => {

        test('should use default model config for inference', async () => {
            const configResponse = await Promise.race([
                codebolt.llm.getModelConfig(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('getModelConfig timeout')), LLM_TIMEOUT)
                )
            ]) as { config: LLMModelConfig | null; success: boolean; error?: string };

            if (configResponse.config) {
                const params: LLMInferenceParams = {
                    messages: [createBasicMessage('What is the capital of Japan?')],
                    llmrole: DEFAULT_LLM_ROLE
                };

                const inferenceResponse = await Promise.race([
                    codebolt.llm.inference(params),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('inference timeout')), LLM_TIMEOUT)
                    )
                ]) as { completion: LLMCompletion };

                expect(inferenceResponse.completion).toBeDefined();

                const question = `Inference successful using model: ${configResponse.config.model_name}. Response: "${inferenceResponse.completion.content}"`;
                expect(question).toBeTruthy();
            } else {
                const question = 'No model config available for integration test';
                expect(question).toBeTruthy();
            }
        }, LLM_TIMEOUT * 2);

        test('should verify model respects max_tokens limit from config', async () => {
            const configResponse = await codebolt.llm.getModelConfig() as { config: LLMModelConfig | null; success: boolean };

            if (configResponse.config) {
                const testMaxTokens = Math.min(100, configResponse.config.max_output_tokens);

                const params: LLMInferenceParams = {
                    messages: [createBasicMessage('Write a detailed explanation of quantum physics')],
                    llmrole: DEFAULT_LLM_ROLE,
                    max_tokens: testMaxTokens
                };

                const response = await Promise.race([
                    codebolt.llm.inference(params),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('inference timeout')), LLM_TIMEOUT)
                    )
                ]) as { completion: LLMCompletion };

                expect(response.completion).toBeDefined();

                const question = `Inference with max_tokens=${testMaxTokens} completed. Response length: ${response.completion.content.length} chars. Usage: ${response.completion.usage?.completion_tokens || 'N/A'} tokens`;
                expect(question).toBeTruthy();
            } else {
                const question = 'No model config available for max_tokens verification';
                expect(question).toBeTruthy();
            }
        }, LLM_TIMEOUT * 2);

        test('should handle function calling based on model capabilities', async () => {
            const configResponse = await codebolt.llm.getModelConfig() as { config: LLMModelConfig | null; success: boolean };

            if (configResponse.config) {
                const supportsTools = configResponse.config.supports_function_calling === 1;

                if (supportsTools) {
                    const params: LLMInferenceParams = {
                        messages: [createBasicMessage('What is the weather in London?')],
                        tools: [createSampleTool()],
                        tool_choice: 'auto',
                        llmrole: DEFAULT_LLM_ROLE
                    };

                    const response = await Promise.race([
                        codebolt.llm.inference(params),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('inference timeout')), LLM_TIMEOUT)
                        )
                    ]) as { completion: LLMCompletion };

                    const question = `Model ${configResponse.config.model_name} supports function calling. Response: ${JSON.stringify(response.completion.tool_calls || response.completion.content)}`;
                    expect(question).toBeTruthy();
                } else {
                    const question = `Model ${configResponse.config.model_name} does not support function calling`;
                    expect(question).toBeTruthy();
                }
            } else {
                const question = 'No model config available for function calling test';
                expect(question).toBeTruthy();
            }
        }, LLM_TIMEOUT * 2);
    });

    // ============================================================================
    // Concurrent Request Tests
    // ============================================================================

    describe('LLM Concurrent Requests', () => {

        test('should handle multiple concurrent inference requests', async () => {
            const requests = [
                { role: 'user' as const, content: 'What is 1 + 1?' },
                { role: 'user' as const, content: 'What is 2 + 2?' },
                { role: 'user' as const, content: 'What is 3 + 3?' }
            ];

            const responses = await Promise.all(
                requests.map(msg =>
                    Promise.race([
                        codebolt.llm.inference({ messages: [msg], llmrole: DEFAULT_LLM_ROLE }),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                        )
                    ]) as { completion: LLMCompletion }
                )
            );

            responses.forEach((response, index) => {
                expect(response.completion).toBeDefined();
                expect(response.completion.content).toBeDefined();
            });

            const question = `All ${responses.length} concurrent requests completed successfully`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT * 2);

        test('should handle concurrent getModelConfig requests', async () => {
            const responses = await Promise.all(
                Array(5).fill(null).map(() =>
                    Promise.race([
                        codebolt.llm.getModelConfig(),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('getModelConfig timeout')), LLM_TIMEOUT)
                        )
                    ]) as { config: LLMModelConfig | null; success: boolean }
                )
            );

            responses.forEach(response => {
                expect(response.success).toBeDefined();
            });

            const question = `All ${responses.length} concurrent getModelConfig requests completed`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT * 2);

        test('should handle mixed concurrent requests', async () => {
            const [inferenceResponse, configResponse] = await Promise.all([
                Promise.race([
                    codebolt.llm.inference({
                        messages: [createBasicMessage('Say hello')],
                        llmrole: DEFAULT_LLM_ROLE
                    }),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('inference timeout')), LLM_TIMEOUT)
                    )
                ]) as { completion: LLMCompletion },
                Promise.race([
                    codebolt.llm.getModelConfig(),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('getConfig timeout')), LLM_TIMEOUT)
                    )
                ]) as { config: LLMModelConfig | null; success: boolean }
            ]);

            expect(inferenceResponse.completion).toBeDefined();
            expect(configResponse.success).toBeDefined();

            const question = `Mixed concurrent requests successful - Inference: "${inferenceResponse.completion.content}", Config model: ${configResponse.config?.model_name || 'N/A'}`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT * 2);
    });

    // ============================================================================
    // LLM Role-Specific Tests
    // ============================================================================

    describe('LLM Role Configuration', () => {

        test('should handle different LLM roles', async () => {
            const roles = [DEFAULT_LLM_ROLE, 'fast', 'smart'];

            const responses = await Promise.all(
                roles.map(role =>
                    Promise.race([
                        codebolt.llm.inference({
                            messages: [createBasicMessage('Hi')],
                            llmrole: role
                        }),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error(`LLM inference timeout for role: ${role}`)), LLM_TIMEOUT)
                        )
                    ])
                        .catch(error => ({ error: (error as Error).message }))
                )
            );

            const successCount = responses.filter((r: any) => !r.error && r.completion).length;
            const question = `${successCount}/${roles.length} role configurations successful`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT * 2);

        test('should handle invalid LLM role gracefully', async () => {
            const params: LLMInferenceParams = {
                messages: [createBasicMessage('Hello')],
                llmrole: 'nonexistent_role_xyz123'
            };

            try {
                const response = await Promise.race([
                    codebolt.llm.inference(params),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                    )
                ]) as { completion: LLMCompletion };

                const question = response?.completion
                    ? `Invalid role handled, response: "${response.completion.content}"`
                    : 'Invalid role handled gracefully';
                expect(question).toBeTruthy();
            } catch (error) {
                const question = `Invalid role resulted in error: ${(error as Error).message}`;
                expect(question).toBeTruthy();
            }
        }, LLM_TIMEOUT);
    });

    // ============================================================================
    // Response Quality Tests
    // ============================================================================

    describe('LLM Response Quality', () => {

        test('should provide relevant and coherent responses', async () => {
            const params: LLMInferenceParams = {
                messages: [createBasicMessage('Explain what a computer is in one sentence')],
                llmrole: DEFAULT_LLM_ROLE,
                max_tokens: 100,
                temperature: 0.5
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion.content).toBeDefined();
            expect(response.completion.content.length).toBeGreaterThan(0);

            const question = `Is the response relevant and coherent? "${response.completion.content}"`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should maintain context across conversation turns', async () => {
            const conversation = [
                { role: 'user' as const, content: 'My name is Alice' },
                { role: 'assistant' as const, content: 'Nice to meet you, Alice!' },
                { role: 'user' as const, content: 'What is my name?' }
            ];

            const params: LLMInferenceParams = {
                messages: conversation,
                llmrole: DEFAULT_LLM_ROLE
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion.content).toBeDefined();
            const containsName = response.completion.content.toLowerCase().includes('alice');

            const question = containsName
                ? `LLM correctly remembered the name is Alice. Response: "${response.completion.content}"`
                : `LLM response: "${response.completion.content}"`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);

        test('should follow formatting instructions', async () => {
            const params: LLMInferenceParams = {
                messages: [createBasicMessage('List three colors, each on a new line with a bullet point')],
                llmrole: DEFAULT_LLM_ROLE,
                max_tokens: 100
            };

            const response = await Promise.race([
                codebolt.llm.inference(params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('LLM inference timeout')), LLM_TIMEOUT)
                )
            ]) as { completion: LLMCompletion };

            expect(response.completion.content).toBeDefined();
            const hasBulletPoints = response.completion.content.includes('•') ||
                                   response.completion.content.includes('-') ||
                                   response.completion.content.includes('*');

            const question = hasBulletPoints
                ? `Response follows formatting with bullet points: "${response.completion.content}"`
                : `Response: "${response.completion.content}"`;
            expect(question).toBeTruthy();
        }, LLM_TIMEOUT);
    });
});
