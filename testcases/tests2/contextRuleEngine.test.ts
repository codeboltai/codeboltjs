/**
 * Test Suite for ContextRuleEngine Module
 */

import {
    sharedCodebolt,
    waitForConnection,
} from './setup';

describe('ContextRuleEngine Module', () => {
    beforeAll(async () => {
        console.log('[ContextRuleEngine] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[ContextRuleEngine] Connection ready');
    });

    describe('ContextRuleEngine Module', () => {
        test('should create rule engine', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.contextRuleEngine.create({
                name: 'test-rule-engine',
                description: 'Test rule engine',
                rules: [
                    {
                        condition: 'variables.urgent === true',
                        action: 'include',
                        memoryType: 'episodic'
                    }
                ]
            });

            expect(response).toBeDefined();
            expect(response.ruleEngine).toBeDefined();

            // AskUserQuestion: Verify rule engine creation
            console.log('✅ AskUserQuestion: Was the rule engine created successfully?');
            console.log('   Engine ID:', response.ruleEngine?.id);
        });

        test('should list rule engines', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.contextRuleEngine.list();

            expect(response).toBeDefined();
            expect(Array.isArray(response.ruleEngines)).toBe(true);

            // AskUserQuestion: Verify rule engine listing
            console.log('✅ AskUserQuestion: Were rule engines listed successfully?');
            console.log('   Total Engines:', response.ruleEngines?.length || 0);
        });

        test('should evaluate rules', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.contextRuleEngine.evaluate({
                variables: {
                    urgent: true,
                    priority: 'high'
                }
            });

            expect(response).toBeDefined();
            expect(Array.isArray(response.results)).toBe(true);

            // AskUserQuestion: Verify rule evaluation
            console.log('✅ AskUserQuestion: Were rules evaluated successfully?');
            console.log('   Results:', response.results?.length || 0);
        });
    });
});
