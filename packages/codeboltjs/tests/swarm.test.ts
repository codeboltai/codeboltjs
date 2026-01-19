/**
 * Test Suite for Swarm Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    resetTestState,
    clearMockData,
} from './setup';

describe('Swarm Module', () => {
    beforeAll(async () => {
        console.log('[Swarm Module] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[Swarm Module] Connection ready');
    });

    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should create a swarm', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.swarm.createSwarm({
            name: 'Test Swarm',
            description: 'Test swarm for comprehensive testing',
            purpose: 'Testing swarm functionality'
        });

        expect(response).toBeDefined();
        expect(response.swarm).toBeDefined();
        expect(response.swarm.name).toBe('Test Swarm');

        // AskUserQuestion: Verify swarm creation
        console.log('✅ AskUserQuestion: Was the swarm created successfully?');
        console.log('   Swarm ID:', response.swarm?.id);
        console.log('   Swarm Name:', response.swarm?.name);
    });

    test('should list all swarms', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.swarm.listSwarms();

        expect(response).toBeDefined();
        expect(Array.isArray(response.swarms)).toBe(true);

        // AskUserQuestion: Verify swarm listing
        console.log('✅ AskUserQuestion: Were swarms listed successfully?');
        console.log('   Total Swarms:', response.swarms?.length || 0);
    });

    test('should create a team in swarm', async () => {
        const codebolt = sharedCodebolt();

        // Create a swarm first
        const swarmResponse = await codebolt.swarm.createSwarm({
            name: `Test Swarm for Team ${Date.now()}`
        });
        const swarmId = swarmResponse.swarm?.id || '';

        const response = await codebolt.swarm.createTeam(swarmId, {
            name: 'Test Team',
            description: 'Test team description',
            purpose: 'Testing team functionality'
        });

        expect(response).toBeDefined();
        expect(response.team).toBeDefined();

        // AskUserQuestion: Verify team creation
        console.log('✅ AskUserQuestion: Was the team created successfully?');
        console.log('   Team ID:', response.team?.id);
        console.log('   Team Name:', response.team?.name);
    });

    test('should create a role in swarm', async () => {
        const codebolt = sharedCodebolt();

        // Create a swarm first
        const swarmResponse = await codebolt.swarm.createSwarm({
            name: `Test Swarm for Role ${Date.now()}`
        });
        const swarmId = swarmResponse.swarm?.id || '';

        const response = await codebolt.swarm.createRole(swarmId, {
            name: 'Test Role',
            description: 'Test role description',
            permissions: ['read', 'write']
        });

        expect(response).toBeDefined();
        expect(response.role).toBeDefined();

        // AskUserQuestion: Verify role creation
        console.log('✅ AskUserQuestion: Was the role created successfully?');
        console.log('   Role ID:', response.role?.id);
        console.log('   Role Name:', response.role?.name);
    });

    test('should create a vacancy in swarm', async () => {
        const codebolt = sharedCodebolt();

        // Create a swarm first
        const swarmResponse = await codebolt.swarm.createSwarm({
            name: `Test Swarm for Vacancy ${Date.now()}`
        });
        const swarmId = swarmResponse.swarm?.id || '';

        const response = await codebolt.swarm.createVacancy(swarmId, {
            roleId: 'test-role-123',
            agentRequirements: {
                skills: ['javascript', 'testing'],
                experience: 'intermediate'
            },
            capacity: 1
        });

        expect(response).toBeDefined();
        expect(response.vacancy).toBeDefined();

        // AskUserQuestion: Verify vacancy creation
        console.log('✅ AskUserQuestion: Was the vacancy created successfully?');
        console.log('   Vacancy ID:', response.vacancy?.id);
    });

    test('should register agent to swarm', async () => {
        const codebolt = sharedCodebolt();

        // Create a swarm first
        const swarmResponse = await codebolt.swarm.createSwarm({
            name: `Test Swarm for Agent ${Date.now()}`
        });
        const swarmId = swarmResponse.swarm?.id || '';

        const response = await codebolt.swarm.registerAgent(swarmId, {
            agentId: 'test-agent-123',
            agentName: 'Test Agent',
            capabilities: ['coding', 'testing']
        });

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify agent registration
        console.log('✅ AskUserQuestion: Was the agent registered successfully?');
        console.log('   Agent ID:', response.agentId);
    });
});
