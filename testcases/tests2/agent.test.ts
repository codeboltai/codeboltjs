/**
 * Comprehensive Test Suite for Agent Module
 *
 * This test suite covers ALL methods in the agent module:
 * - findAgent: Find agents by task description
 * - startAgent: Start an agent with a specific task
 * - getAgentsList: Get list of available agents
 * - getAgentsDetail: Get detailed information about specific agents
 *
 * Each test includes:
 * - Use of the shared CodeboltSDK instance
 * - Descriptive test names
 * - Proper timeout handling
 * - AskUserQuestion verification at the END
 * - Cleanup procedures
 */

const codebolt = require("../dist");

/**
 * Helper function to wait for user verification using AskUserQuestion
 *
 * This function simulates the AskUserQuestion notification that would be
 * triggered in a real environment to verify test results.
 */
async function verifyWithUser(testName: string, details: any) {
    try {
        // In the actual implementation, this would trigger a user notification
        // For testing purposes, we log the verification request
        console.log(`\n=== VERIFICATION REQUEST FOR: ${testName} ===`);
        console.log('Details:', JSON.stringify(details, null, 2));
        console.log('Please verify the above result manually.\n');

        // This would integrate with the notification system in production:
        // await codebolt.notify.userNotification({
        //     type: 'question',
        //     message: `Verify test: ${testName}`,
        //     data: details
        // });
    } catch (error) {
        console.log('Verification request error:', error);
    }
}

/**
 * Helper function to create a timeout promise
 */
function createTimeout(ms: number, message: string = 'Operation timed out') {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(message)), ms);
    });
}

/**
 * Helper function to run operations with timeout
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMsg: string = 'Operation timed out'): Promise<T> {
    return Promise.race([
        promise,
        createTimeout(timeoutMs, timeoutMsg)
    ]);
}

// ============================================================================
// Test Suite Configuration
// ============================================================================

describe('Agent Module Tests', () => {
    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[AgentTests] Setting up test environment...');
        await codebolt.activate();
        console.log('[AgentTests] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[AgentTests] Tests completed');
    });

    // ============================================================================
    // findAgent Tests
    // ============================================================================

    describe('findAgent', () => {
        test('should find an agent for a simple task with default parameters', async () => {
            await codebolt.activate();

            const task = 'Create a simple REST API endpoint';
            const response = await withTimeout(
                codebolt.agent.findAgent(task),
                15000,
                'findAgent operation timed out'
            );

            // Verify response structure
            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.type).toBe('findAgentByTaskResponse');
            expect(response.agents).toBeDefined();
            expect(Array.isArray(response.agents)).toBe(true);

            // Verify agent data
            if (response.agents.length > 0) {
                const agent = response.agents[0];
                expect(agent.type).toBe('function');
                expect(agent.function).toBeDefined();
                expect(agent.function.name).toBeDefined();
                expect(agent.function.description).toBeDefined();
            }

            // Ask user to verify at the END
            await verifyWithUser('findAgent - Simple Task', {
                task: task,
                agentsFound: response.agents.length,
                firstAgent: response.agents.length > 0 ? response.agents[0].function.name : 'none'
            });
        });

        test('should find an agent with custom maxResult parameter', async () => {
            await codebolt.activate();

            const task = 'Write unit tests for a React component';
            const maxResult = 3;
            const response = await withTimeout(
                codebolt.agent.findAgent(task, maxResult),
                15000,
                'findAgent with maxResult timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.agents).toBeDefined();

            // Verify we got multiple results if available
            expect(response.agents.length).toBeLessThanOrEqual(maxResult);

            await verifyWithUser('findAgent - Custom MaxResult', {
                task: task,
                maxResult: maxResult,
                actualResults: response.agents.length
            });
        });

        test('should find an agent with agent filter list', async () => {
            await codebolt.activate();

            const task = 'Debug a JavaScript application';
            const agents = ['codebolt_agent', 'debugger_agent'];
            const response = await withTimeout(
                codebolt.agent.findAgent(task, 1, agents),
                15000,
                'findAgent with agent filter timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.agents).toBeDefined();

            await verifyWithUser('findAgent - Agent Filter', {
                task: task,
                agentFilter: agents,
                agentsFound: response.agents.length
            });
        });

        test('should find an agent with LOCAL_ONLY location', async () => {
            await codebolt.activate();

            const { AgentLocation } = require('../dist');
            const task = 'Analyze code quality';
            const response = await withTimeout(
                codebolt.agent.findAgent(task, 1, [], AgentLocation.LOCAL_ONLY),
                15000,
                'findAgent with LOCAL_ONLY timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.agents).toBeDefined();

            await verifyWithUser('findAgent - Local Only', {
                task: task,
                location: 'LOCAL_ONLY',
                agentsFound: response.agents.length
            });
        });

        test('should find an agent with REMOTE_ONLY location', async () => {
            await codebolt.activate();

            const { AgentLocation } = require('../dist');
            const task = 'Generate API documentation';
            const response = await withTimeout(
                codebolt.agent.findAgent(task, 1, [], AgentLocation.REMOTE_ONLY),
                15000,
                'findAgent with REMOTE_ONLY timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.agents).toBeDefined();

            await verifyWithUser('findAgent - Remote Only', {
                task: task,
                location: 'REMOTE_ONLY',
                agentsFound: response.agents.length
            });
        });

        test('should find an agent with USE_AI filter method', async () => {
            await codebolt.activate();

            const { FilterUsing } = require('../dist');
            const task = 'Create a database schema';
            const response = await withTimeout(
                codebolt.agent.findAgent(task, 1, [], undefined, FilterUsing.USE_AI),
                20000,
                'findAgent with USE_AI timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.agents).toBeDefined();

            await verifyWithUser('findAgent - Use AI', {
                task: task,
                filterMethod: 'USE_AI',
                agentsFound: response.agents.length
            });
        });

        test('should find an agent with USE_VECTOR_DB filter method', async () => {
            await codebolt.activate();

            const { FilterUsing } = require('../dist');
            const task = 'Implement user authentication';
            const response = await withTimeout(
                codebolt.agent.findAgent(task, 1, [], undefined, FilterUsing.USE_VECTOR_DB),
                15000,
                'findAgent with USE_VECTOR_DB timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.agents).toBeDefined();

            await verifyWithUser('findAgent - Use Vector DB', {
                task: task,
                filterMethod: 'USE_VECTOR_DB',
                agentsFound: response.agents.length
            });
        });

        test('should find an agent with USE_BOTH filter method', async () => {
            await codebolt.activate();

            const { FilterUsing } = require('../dist');
            const task = 'Optimize database queries';
            const response = await withTimeout(
                codebolt.agent.findAgent(task, 1, [], undefined, FilterUsing.USE_BOTH),
                20000,
                'findAgent with USE_BOTH timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.agents).toBeDefined();

            await verifyWithUser('findAgent - Use Both', {
                task: task,
                filterMethod: 'USE_BOTH',
                agentsFound: response.agents.length
            });
        });

        test('should handle complex multi-step task description', async () => {
            await codebolt.activate();

            const task = 'Design and implement a microservice architecture with API gateway, service discovery, and load balancing';
            const response = await withTimeout(
                codebolt.agent.findAgent(task),
                15000,
                'findAgent with complex task timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.agents).toBeDefined();

            await verifyWithUser('findAgent - Complex Task', {
                task: task,
                agentsFound: response.agents.length,
                agentNames: response.agents.map(a => a.function.name)
            });
        });

        test('should handle empty task gracefully', async () => {
            await codebolt.activate();

            const task = '';
            const response = await withTimeout(
                codebolt.agent.findAgent(task),
                15000,
                'findAgent with empty task timed out'
            );

            // Should still return a valid response structure
            expect(response).toBeDefined();

            await verifyWithUser('findAgent - Empty Task', {
                task: task,
                success: response.success,
                agentsFound: response.agents ? response.agents.length : 0
            });
        });
    });

    // ============================================================================
    // startAgent Tests
    // ============================================================================

    describe('startAgent', () => {
        test('should start an agent with a simple task', async () => {
            await codebolt.activate();

            // First, find an agent
            const findResponse = await codebolt.agent.findAgent('List files in directory', 1);

            if (findResponse.agents && findResponse.agents.length > 0) {
                const agentId = findResponse.agents[0].function.name;
                const task = 'List all TypeScript files in the current directory';

                const response = await withTimeout(
                    codebolt.agent.startAgent(agentId, task),
                    30000,
                    'startAgent operation timed out'
                );

                // Verify response structure
                expect(response).toBeDefined();
                expect(response.success).toBe(true);
                expect(response.type).toBe('taskCompletionResponse');
                expect(response.agentId).toBeDefined();
                expect(response.task).toBeDefined();

                // Ask user to verify at the END
                await verifyWithUser('startAgent - Simple Task', {
                    agentId: agentId,
                    task: task,
                    result: response.result,
                    success: response.success
                });
            } else {
                console.log('No agents found for testing startAgent');
                await verifyWithUser('startAgent - Simple Task', {
                    message: 'No agents available for testing'
                });
            }
        });

        test('should start an agent with a complex task', async () => {
            await codebolt.activate();

            const findResponse = await codebolt.agent.findAgent('Create a REST API', 1);

            if (findResponse.agents && findResponse.agents.length > 0) {
                const agentId = findResponse.agents[0].function.name;
                const task = 'Create a REST API with endpoints for CRUD operations on a user resource';

                const response = await withTimeout(
                    codebolt.agent.startAgent(agentId, task),
                    45000,
                    'startAgent with complex task timed out'
                );

                expect(response).toBeDefined();
                expect(response.success).toBe(true);
                expect(response.agentId).toBe(agentId);

                await verifyWithUser('startAgent - Complex Task', {
                    agentId: agentId,
                    task: task,
                    result: response.result,
                    success: response.success
                });
            } else {
                console.log('No agents found for testing startAgent with complex task');
                await verifyWithUser('startAgent - Complex Task', {
                    message: 'No agents available for testing'
                });
            }
        });

        test('should start agent with timeout handling', async () => {
            await codebolt.activate();

            const findResponse = await codebolt.agent.findAgent('Quick test', 1);

            if (findResponse.agents && findResponse.agents.length > 0) {
                const agentId = findResponse.agents[0].function.name;
                const task = 'Perform a quick syntax check';

                // Test with shorter timeout to verify timeout handling
                try {
                    const response = await withTimeout(
                        codebolt.agent.startAgent(agentId, task),
                        20000,
                        'Agent task timed out as expected'
                    );

                    expect(response).toBeDefined();

                    await verifyWithUser('startAgent - Timeout Test', {
                        agentId: agentId,
                        task: task,
                        completed: true,
                        success: response.success
                    });
                } catch (error: any) {
                    // Timeout is acceptable for this test
                    expect(error.message).toContain('timed out');

                    await verifyWithUser('startAgent - Timeout Test', {
                        agentId: agentId,
                        task: task,
                        timedOut: true,
                        error: error.message
                    });
                }
            } else {
                console.log('No agents found for timeout test');
                await verifyWithUser('startAgent - Timeout Test', {
                    message: 'No agents available for testing'
                });
            }
        });

        test('should handle starting agent with empty task', async () => {
            await codebolt.activate();

            const findResponse = await codebolt.agent.findAgent('Test', 1);

            if (findResponse.agents && findResponse.agents.length > 0) {
                const agentId = findResponse.agents[0].function.name;
                const task = '';

                const response = await withTimeout(
                    codebolt.agent.startAgent(agentId, task),
                    15000,
                    'startAgent with empty task timed out'
                );

                expect(response).toBeDefined();

                await verifyWithUser('startAgent - Empty Task', {
                    agentId: agentId,
                    task: task,
                    success: response.success,
                    result: response.result
                });
            } else {
                await verifyWithUser('startAgent - Empty Task', {
                    message: 'No agents available for testing'
                });
            }
        });

        test('should handle starting agent with very long task', async () => {
            await codebolt.activate();

            const findResponse = await codebolt.agent.findAgent('Code analysis', 1);

            if (findResponse.agents && findResponse.agents.length > 0) {
                const agentId = findResponse.agents[0].function.name;
                const longTask = 'Analyze the following codebase: ' +
                    '1. Review all TypeScript files for code quality issues\n' +
                    '2. Check for potential security vulnerabilities\n' +
                    '3. Identify performance bottlenecks\n' +
                    '4. Suggest refactoring opportunities\n' +
                    '5. Generate a comprehensive report with recommendations\n' +
                    '6. Create documentation for any issues found\n' +
                    '7. Provide code examples for fixes\n' +
                    '8. Prioritize issues by severity\n' +
                    '9. Estimate effort required for each fix\n' +
                    '10. Create a roadmap for implementing the fixes';

                const response = await withTimeout(
                    codebolt.agent.startAgent(agentId, longTask),
                    60000,
                    'startAgent with long task timed out'
                );

                expect(response).toBeDefined();
                expect(response.task).toBeDefined();

                await verifyWithUser('startAgent - Long Task', {
                    agentId: agentId,
                    taskLength: longTask.length,
                    success: response.success,
                    resultPreview: response.result ? String(response.result).substring(0, 100) : 'none'
                });
            } else {
                await verifyWithUser('startAgent - Long Task', {
                    message: 'No agents available for testing'
                });
            }
        });
    });

    // ============================================================================
    // getAgentsList Tests
    // ============================================================================

    describe('getAgentsList', () => {
        test('should get list of DOWNLOADED agents', async () => {
            await codebolt.activate();

            const { Agents } = require('../dist');
            const response = await withTimeout(
                codebolt.agent.getAgentsList(Agents.DOWNLOADED),
                15000,
                'getAgentsList for DOWNLOADED agents timed out'
            );

            // Verify response structure
            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.type).toBe('listAgentsResponse');
            expect(response.agents).toBeDefined();
            expect(Array.isArray(response.agents)).toBe(true);

            // Verify agent structure if agents exist
            if (response.agents.length > 0) {
                const agent = response.agents[0];
                expect(agent.type).toBe('function');
                expect(agent.function).toBeDefined();
                expect(agent.function.name).toBeDefined();
                expect(agent.function.description).toBeDefined();
            }

            // Ask user to verify at the END
            await verifyWithUser('getAgentsList - Downloaded', {
                agentType: 'DOWNLOADED',
                totalAgents: response.agents.length,
                agentNames: response.agents.map(a => a.function.name)
            });
        });

        test('should get list of LOCAL agents', async () => {
            await codebolt.activate();

            const { Agents } = require('../dist');
            const response = await withTimeout(
                codebolt.agent.getAgentsList(Agents.LOCAL),
                15000,
                'getAgentsList for LOCAL agents timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.agents).toBeDefined();
            expect(Array.isArray(response.agents)).toBe(true);

            await verifyWithUser('getAgentsList - Local', {
                agentType: 'LOCAL',
                totalAgents: response.agents.length,
                agentNames: response.agents.map(a => a.function.name)
            });
        });

        test('should get list of ALL agents', async () => {
            await codebolt.activate();

            const { Agents } = require('../dist');
            const response = await withTimeout(
                codebolt.agent.getAgentsList(Agents.ALL),
                20000,
                'getAgentsList for ALL agents timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.agents).toBeDefined();
            expect(Array.isArray(response.agents)).toBe(true);

            await verifyWithUser('getAgentsList - All', {
                agentType: 'ALL',
                totalAgents: response.agents.length,
                agentNames: response.agents.map(a => a.function.name)
            });
        });

        test('should handle getAgentsList with default parameters', async () => {
            await codebolt.activate();

            const response = await withTimeout(
                codebolt.agent.getAgentsList(),
                15000,
                'getAgentsList with defaults timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.agents).toBeDefined();

            await verifyWithUser('getAgentsList - Defaults', {
                totalAgents: response.agents.length,
                agentNames: response.agents.map(a => a.function.name)
            });
        });

        test('should verify agent details in list', async () => {
            await codebolt.activate();

            const { Agents } = require('../dist');
            const response = await withTimeout(
                codebolt.agent.getAgentsList(Agents.DOWNLOADED),
                15000,
                'getAgentsList for detail verification timed out'
            );

            expect(response).toBeDefined();
            expect(response.agents).toBeDefined();

            // Verify detailed structure of agents
            const agentDetails = response.agents.map(agent => ({
                name: agent.function.name,
                description: agent.function.description,
                hasParameters: !!agent.function.parameters,
                parameterCount: agent.function.parameters ?
                    Object.keys(agent.function.parameters.properties || {}).length : 0
            }));

            await verifyWithUser('getAgentsList - Detail Verification', {
                totalAgents: response.agents.length,
                agentDetails: agentDetails
            });
        });
    });

    // ============================================================================
    // getAgentsDetail Tests
    // ============================================================================

    describe('getAgentsDetail', () => {
        test('should get details for specific agents', async () => {
            await codebolt.activate();

            // First get a list of agents
            const listResponse = await codebolt.agent.getAgentsList();

            if (listResponse.agents && listResponse.agents.length > 0) {
                // Get details for first 3 agents
                const agentList = listResponse.agents.slice(0, 3).map(a => a.function.name);

                const response = await withTimeout(
                    codebolt.agent.getAgentsDetail(agentList),
                    15000,
                    'getAgentsDetail timed out'
                );

                // Verify response structure
                expect(response).toBeDefined();
                expect(response.success).toBe(true);
                expect(response.type).toBe('agentsDetailResponse');
                expect(response.payload).toBeDefined();
                expect(response.payload.agents).toBeDefined();
                expect(Array.isArray(response.payload.agents)).toBe(true);

                // Verify agent detail structure
                if (response.payload.agents.length > 0) {
                    const agent = response.payload.agents[0];
                    expect(agent.id).toBeDefined();
                    expect(agent.name).toBeDefined();
                    expect(agent.description).toBeDefined();
                    expect(agent.isLocal).toBeDefined();
                    expect(typeof agent.isLocal).toBe('boolean');
                    expect(agent.version).toBeDefined();
                    expect(agent.status).toBeDefined();
                }

                // Ask user to verify at the END
                await verifyWithUser('getAgentsDetail - Specific Agents', {
                    requestedAgents: agentList,
                    detailsReceived: response.payload.agents.length,
                    agentDetails: response.payload.agents.map(a => ({
                        id: a.id,
                        name: a.name,
                        isLocal: a.isLocal,
                        version: a.version,
                        status: a.status
                    }))
                });
            } else {
                console.log('No agents found for testing getAgentsDetail');
                await verifyWithUser('getAgentsDetail - Specific Agents', {
                    message: 'No agents available for testing'
                });
            }
        });

        test('should get details with empty agent list', async () => {
            await codebolt.activate();

            const response = await withTimeout(
                codebolt.agent.getAgentsDetail([]),
                15000,
                'getAgentsDetail with empty list timed out'
            );

            expect(response).toBeDefined();
            expect(response.payload).toBeDefined();
            expect(response.payload.agents).toBeDefined();
            expect(Array.isArray(response.payload.agents)).toBe(true);

            await verifyWithUser('getAgentsDetail - Empty List', {
                requestedAgents: [],
                detailsReceived: response.payload.agents.length
            });
        });

        test('should get details for all available agents', async () => {
            await codebolt.activate();

            // First get all agents
            const listResponse = await codebolt.agent.getAgentsList();

            if (listResponse.agents && listResponse.agents.length > 0) {
                const allAgentNames = listResponse.agents.map(a => a.function.name);

                const response = await withTimeout(
                    codebolt.agent.getAgentsDetail(allAgentNames),
                    20000,
                    'getAgentsDetail for all agents timed out'
                );

                expect(response).toBeDefined();
                expect(response.payload).toBeDefined();
                expect(response.payload.agents).toBeDefined();

                await verifyWithUser('getAgentsDetail - All Agents', {
                    requestedCount: allAgentNames.length,
                    detailsReceived: response.payload.agents.length,
                    agentSummary: response.payload.agents.map(a => ({
                        name: a.name,
                        isLocal: a.isLocal,
                        capabilities: a.capabilities ? a.capabilities.length : 0
                    }))
                });
            } else {
                await verifyWithUser('getAgentsDetail - All Agents', {
                    message: 'No agents available for testing'
                });
            }
        });

        test('should verify detailed agent information structure', async () => {
            await codebolt.activate();

            const listResponse = await codebolt.agent.getAgentsList();

            if (listResponse.agents && listResponse.agents.length > 0) {
                const agentList = [listResponse.agents[0].function.name];

                const response = await withTimeout(
                    codebolt.agent.getAgentsDetail(agentList),
                    15000,
                    'getAgentsDetail for structure verification timed out'
                );

                expect(response).toBeDefined();
                expect(response.payload).toBeDefined();

                if (response.payload.agents.length > 0) {
                    const agent = response.payload.agents[0];

                    // Verify all expected fields
                    const detailVerification = {
                        hasId: !!agent.id,
                        hasName: !!agent.name,
                        hasDescription: !!agent.description,
                        hasIsLocal: typeof agent.isLocal === 'boolean',
                        hasVersion: !!agent.version,
                        hasStatus: !!agent.status,
                        hasUniqueId: !!agent.unique_id,
                        hasCapabilities: Array.isArray(agent.capabilities),
                        capabilityCount: agent.capabilities ? agent.capabilities.length : 0
                    };

                    await verifyWithUser('getAgentsDetail - Structure Verification', {
                        agentName: agent.name,
                        details: detailVerification,
                        fullAgent: agent
                    });
                }
            } else {
                await verifyWithUser('getAgentsDetail - Structure Verification', {
                    message: 'No agents available for testing'
                });
            }
        });

        test('should handle getAgentsDetail with default parameters', async () => {
            await codebolt.activate();

            const response = await withTimeout(
                codebolt.agent.getAgentsDetail(),
                15000,
                'getAgentsDetail with defaults timed out'
            );

            expect(response).toBeDefined();
            expect(response.payload).toBeDefined();
            expect(response.payload.agents).toBeDefined();

            await verifyWithUser('getAgentsDetail - Defaults', {
                detailsReceived: response.payload.agents.length,
                agentNames: response.payload.agents.map(a => a.name)
            });
        });
    });

    // ============================================================================
    // Integration Tests
    // ============================================================================

    describe('Agent Integration Tests', () => {
        test('should complete full workflow: find -> start -> verify', async () => {
            await codebolt.activate();

            const task = 'Create a simple test file';

            // Step 1: Find an agent
            const findResponse = await withTimeout(
                codebolt.agent.findAgent(task),
                15000,
                'Integration test: findAgent timed out'
            );

            expect(findResponse.success).toBe(true);
            expect(findResponse.agents.length).toBeGreaterThan(0);

            // Step 2: Start the agent
            const agentId = findResponse.agents[0].function.name;
            const startResponse = await withTimeout(
                codebolt.agent.startAgent(agentId, task),
                30000,
                'Integration test: startAgent timed out'
            );

            expect(startResponse.success).toBe(true);

            // Ask user to verify the complete workflow
            await verifyWithUser('Integration - Full Workflow', {
                task: task,
                agentFound: agentId,
                agentStarted: startResponse.success,
                result: startResponse.result
            });
        });

        test('should handle multiple agent operations in sequence', async () => {
            await codebolt.activate();

            const tasks = [
                'List files',
                'Check syntax',
                'Format code'
            ];

            const results = [];

            for (const task of tasks) {
                const findResponse = await codebolt.agent.findAgent(task);
                if (findResponse.agents && findResponse.agents.length > 0) {
                    const agentId = findResponse.agents[0].function.name;
                    const startResponse = await codebolt.agent.startAgent(agentId, task);
                    results.push({
                        task,
                        agentId,
                        success: startResponse.success
                    });
                }
            }

            await verifyWithUser('Integration - Sequential Operations', {
                totalTasks: tasks.length,
                completedTasks: results.length,
                results: results
            });
        });

        test('should compare agent lists with different types', async () => {
            await codebolt.activate();

            const { Agents } = require('../dist');

            const [downloaded, local, all] = await Promise.all([
                codebolt.agent.getAgentsList(Agents.DOWNLOADED),
                codebolt.agent.getAgentsList(Agents.LOCAL),
                codebolt.agent.getAgentsList(Agents.ALL)
            ]);

            const comparison = {
                downloaded: downloaded.agents.length,
                local: local.agents.length,
                all: all.agents.length,
                downloadedAgents: downloaded.agents.map(a => a.function.name),
                localAgents: local.agents.map(a => a.function.name),
                allAgents: all.agents.map(a => a.function.name)
            };

            await verifyWithUser('Integration - List Comparison', {
                comparison: comparison,
                expectations: {
                    allShouldBeLargest: comparison.all >= comparison.downloaded && comparison.all >= comparison.local
                }
            });
        });
    });

    // ============================================================================
    // Error Handling Tests
    // ============================================================================

    describe('Agent Error Handling', () => {
        test('should handle findAgent with invalid parameters gracefully', async () => {
            await codebolt.activate();

            try {
                const response = await codebolt.agent.findAgent(
                    null as any,
                    -1 as any,
                    ['invalid_agent'] as any
                );

                // Should still return a response structure
                expect(response).toBeDefined();

                await verifyWithUser('Error Handling - Invalid Parameters', {
                    responseReceived: true,
                    success: response.success
                });
            } catch (error: any) {
                // Error handling is also acceptable
                expect(error).toBeDefined();

                await verifyWithUser('Error Handling - Invalid Parameters', {
                    errorCaught: true,
                    errorMessage: error.message
                });
            }
        });

        test('should handle startAgent with non-existent agent', async () => {
            await codebolt.activate();

            const fakeAgentId = 'non_existent_agent_12345';
            const task = 'Test task';

            try {
                const response = await codebolt.agent.startAgent(fakeAgentId, task);

                expect(response).toBeDefined();

                await verifyWithUser('Error Handling - Non-existent Agent', {
                    agentId: fakeAgentId,
                    responseReceived: true,
                    success: response.success
                });
            } catch (error: any) {
                expect(error).toBeDefined();

                await verifyWithUser('Error Handling - Non-existent Agent', {
                    agentId: fakeAgentId,
                    errorCaught: true,
                    errorMessage: error.message
                });
            }
        });

        test('should handle timeout on slow operations', async () => {
            await codebolt.activate();

            // This test verifies timeout handling
            const task = 'Perform a very complex analysis that might take a long time';

            try {
                const response = await withTimeout(
                    codebolt.agent.findAgent(task),
                    5000,
                    'Operation timed out as expected'
                );

                await verifyWithUser('Error Handling - Timeout', {
                    task: task,
                    completed: true,
                    hasResponse: !!response
                });
            } catch (error: any) {
                await verifyWithUser('Error Handling - Timeout', {
                    task: task,
                    timedOut: true,
                    errorMessage: error.message
                });
            }
        });
    });
});
