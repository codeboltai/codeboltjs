/**
 * Test Suite for Agent Deliberation Module
 *
 * This test suite covers agent deliberation workflows including:
 * - Creating deliberation sessions
 * - Responding to deliberations
 * - Voting on proposals
 * - Getting winners
 * - Managing deliberation state
 */

import Codebolt from '../src/core/Codebolt';

const codebolt = new Codebolt();

describe('Agent Deliberation Module', () => {
    beforeAll(async () => {
        await codebolt.waitForReady();
    }, 30000);

    afterAll(() => {
        console.log('Agent Deliberation tests completed');
    });

    // ============================================================================
    // DELIBERATION SESSION MANAGEMENT
    // ============================================================================

    describe('Deliberation Session Management', () => {
        test('should create a deliberation session', async () => {
            const response = await codebolt.agentDeliberation.create({
                topic: 'Select best approach for user authentication',
                participants: ['agent-1', 'agent-2', 'agent-3'],
                timeout: 300000
            });

            expect(response).toBeDefined();
            expect(response.deliberation).toBeDefined();
            expect(response.deliberation?.id).toBeDefined();

            console.log('AskUserQuestion: Was the deliberation session created successfully?');
            console.log('   Session ID:', response.deliberation?.id);
        });

        test('should get deliberation session details', async () => {
            // First create a session
            const createResponse = await codebolt.agentDeliberation.create({
                topic: 'Test deliberation for details'
            });

            const deliberationId = createResponse.deliberation?.id || '';

            const response = await codebolt.agentDeliberation.get({
                deliberationId
            });

            expect(response).toBeDefined();
            expect(response.deliberation).toBeDefined();
            expect(response.deliberation?.id).toBe(deliberationId);

            console.log('AskUserQuestion: Were the session details retrieved successfully?');
            console.log('   Session Topic:', response.deliberation?.topic);
        });

        test('should list active deliberation sessions', async () => {
            const response = await codebolt.agentDeliberation.list({
                status: 'active'
            });

            expect(response).toBeDefined();
            expect(Array.isArray(response.deliberations)).toBe(true);

            console.log('AskUserQuestion: Were the active sessions listed successfully?');
            console.log('   Active Sessions:', response.deliberations?.length || 0);
        });

        test('should update a deliberation session', async () => {
            // Create a session first
            const createResponse = await codebolt.agentDeliberation.create({
                topic: 'Test deliberation for update'
            });

            const deliberationId = createResponse.deliberation?.id || '';

            const response = await codebolt.agentDeliberation.update({
                deliberationId,
                status: 'completed'
            });

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            console.log('AskUserQuestion: Was the deliberation updated successfully?');
        });
    });

    // ============================================================================
    // RESPONDING TO DELIBERATIONS
    // ============================================================================

    describe('Responding to Deliberations', () => {
        test('should add a response to deliberation', async () => {
            // Create a deliberation first
            const createResponse = await codebolt.agentDeliberation.create({
                topic: 'Best approach for data storage',
                participants: ['agent-1', 'agent-2']
            });

            const deliberationId = createResponse.deliberation?.id || '';

            const response = await codebolt.agentDeliberation.respond({
                deliberationId,
                agentId: 'agent-1',
                response: 'I recommend using PostgreSQL for better relational data handling',
                confidence: 0.85
            });

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            console.log('AskUserQuestion: Was the response added successfully?');
        });

        test('should add multiple responses from different agents', async () => {
            const createResponse = await codebolt.agentDeliberation.create({
                topic: 'Multiple agent responses test',
                participants: ['agent-1', 'agent-2', 'agent-3']
            });

            const deliberationId = createResponse.deliberation?.id || '';

            // Add responses from different agents
            const response1 = await codebolt.agentDeliberation.respond({
                deliberationId,
                agentId: 'agent-1',
                response: 'Approach 1: Use PostgreSQL'
            });

            const response2 = await codebolt.agentDeliberation.respond({
                deliberationId,
                agentId: 'agent-2',
                response: 'Approach 2: Use MongoDB'
            });

            expect(response1.success).toBe(true);
            expect(response2.success).toBe(true);

            console.log('AskUserQuestion: Were multiple responses added successfully?');
        });
    });

    // ============================================================================
    // VOTING MECHANISM
    // ============================================================================

    describe('Voting Mechanism', () => {
        test('should cast a vote', async () => {
            // Create deliberation
            const createResponse = await codebolt.agentDeliberation.create({
                topic: 'Test voting mechanism',
                participants: ['agent-1', 'agent-2', 'agent-3']
            });

            const deliberationId = createResponse.deliberation?.id || '';

            const response = await codebolt.agentDeliberation.vote({
                deliberationId,
                agentId: 'agent-2',
                vote: 'approve',
                reasoning: 'This approach looks good'
            });

            expect(response).toBeDefined();
            expect(response.vote).toBeDefined();
            expect(response.vote?.agentId).toBe('agent-2');

            console.log('AskUserQuestion: Was the vote cast successfully?');
            console.log('   Vote:', response.vote?.vote);
        });

        test('should cast multiple votes', async () => {
            const createResponse = await codebolt.agentDeliberation.create({
                topic: 'Test multiple votes',
                participants: ['agent-1', 'agent-2', 'agent-3', 'agent-4']
            });

            const deliberationId = createResponse.deliberation?.id || '';

            // Cast multiple votes
            const vote1 = await codebolt.agentDeliberation.vote({
                deliberationId,
                agentId: 'agent-2',
                vote: 'approve'
            });

            const vote2 = await codebolt.agentDeliberation.vote({
                deliberationId,
                agentId: 'agent-3',
                vote: 'approve'
            });

            const vote3 = await codebolt.agentDeliberation.vote({
                deliberationId,
                agentId: 'agent-4',
                vote: 'reject'
            });

            expect(vote1.success).toBe(true);
            expect(vote2.success).toBe(true);
            expect(vote3.success).toBe(true);

            console.log('AskUserQuestion: Were multiple votes cast successfully?');
        });
    });

    // ============================================================================
    // WINNER DETERMINATION
    // ============================================================================

    describe('Winner Determination', () => {
        test('should get the winner of a deliberation', async () => {
            // Create deliberation with votes
            const createResponse = await codebolt.agentDeliberation.create({
                topic: 'Test winner determination',
                participants: ['agent-1', 'agent-2', 'agent-3'],
                requiredVotes: 2
            });

            const deliberationId = createResponse.deliberation?.id || '';

            // Add votes
            await codebolt.agentDeliberation.vote({
                deliberationId,
                agentId: 'agent-2',
                vote: 'approve'
            });

            await codebolt.agentDeliberation.vote({
                deliberationId,
                agentId: 'agent-3',
                vote: 'approve'
            });

            const response = await codebolt.agentDeliberation.getWinner({
                deliberationId
            });

            expect(response).toBeDefined();
            expect(response.winner).toBeDefined();

            console.log('AskUserQuestion: Was the winner determined successfully?');
            console.log('   Winning Agent:', response.winner?.agentId);
            console.log('   Total Votes:', response.winner?.totalVotes);
        });

        test('should handle no winner scenario', async () => {
            const createResponse = await codebolt.agentDeliberation.create({
                topic: 'Test no winner scenario',
                participants: ['agent-1', 'agent-2']
            });

            const deliberationId = createResponse.deliberation?.id || '';

            const response = await codebolt.agentDeliberation.getWinner({
                deliberationId
            });

            expect(response).toBeDefined();

            console.log('AskUserQuestion: Handled no winner scenario correctly?');
            console.log('   Has Winner:', response.winner !== undefined);
        });
    });

    // ============================================================================
    // DELIBERATION SUMMARY
    // ============================================================================

    describe('Deliberation Summary', () => {
        test('should generate a summary of deliberation', async () => {
            // Create a deliberation with activity
            const createResponse = await codebolt.agentDeliberation.create({
                topic: 'Test summary generation',
                participants: ['agent-1', 'agent-2']
            });

            const deliberationId = createResponse.deliberation?.id || '';

            // Add some responses
            await codebolt.agentDeliberation.respond({
                deliberationId,
                agentId: 'agent-1',
                response: 'Response from agent 1'
            });

            await codebolt.agentDeliberation.respond({
                deliberationId,
                agentId: 'agent-2',
                response: 'Response from agent 2'
            });

            const response = await codebolt.agentDeliberation.summary({
                deliberationId
            });

            expect(response).toBeDefined();
            expect(response.summary).toBeDefined();

            console.log('AskUserQuestion: Was the summary generated successfully?');
            console.log('   Summary:', response.summary?.text);
        });

        test('should get summary with key points', async () => {
            const createResponse = await codebolt.agentDeliberation.create({
                topic: 'Test key points extraction'
            });

            const deliberationId = createResponse.deliberation?.id || '';

            const response = await codebolt.agentDeliberation.summary({
                deliberationId,
                includeKeyPoints: true,
                includeVotes: true
            });

            expect(response).toBeDefined();

            console.log('AskUserQuestion: Was the detailed summary generated?');
            console.log('   Key Points:', response.summary?.keyPoints?.length || 0);
        });
    });

    // ============================================================================
    // DELIBERATION LISTING & FILTERING
    // ============================================================================

    describe('Deliberation Listing & Filtering', () => {
        test('should list all deliberations', async () => {
            const response = await codebolt.agentDeliberation.list();

            expect(response).toBeDefined();
            expect(Array.isArray(response.deliberations)).toBe(true);

            console.log('AskUserQuestion: Were all deliberations listed?');
            console.log('   Total Deliberations:', response.deliberations?.length || 0);
        });

        test('should list deliberations with filters', async () => {
            const response = await codebolt.agentDeliberation.list({
                status: 'active',
                limit: 10,
                offset: 0
            });

            expect(response).toBeDefined();

            console.log('AskUserQuestion: Were filtered deliberations listed?');
            console.log('   Filtered Count:', response.deliberations?.length || 0);
        });

        test('should list deliberations by date range', async () => {
            const response = await codebolt.agentDeliberation.list({
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date().toISOString()
            });

            expect(response).toBeDefined();

            console.log('AskUserQuestion: Were deliberations filtered by date?');
            console.log('   Results:', response.deliberations?.length || 0);
        });
    });

    // ============================================================================
    // COMPLEX WORKFLOWS
    // ============================================================================

    describe('Complex Deliberation Workflows', () => {
        test('should handle complete deliberation workflow', async () => {
            // Step 1: Create deliberation
            const createResponse = await codebolt.agentDeliberation.create({
                topic: 'Complete workflow test',
                participants: ['agent-1', 'agent-2', 'agent-3'],
                requiredVotes: 2
            });

            const deliberationId = createResponse.deliberation?.id || '';

            // Step 2: Add responses
            await codebolt.agentDeliberation.respond({
                deliberationId,
                agentId: 'agent-1',
                response: 'Option A proposal'
            });

            await codebolt.agentDeliberation.respond({
                deliberationId,
                agentId: 'agent-2',
                response: 'Option B proposal'
            });

            // Step 3: Vote
            await codebolt.agentDeliberation.vote({
                deliberationId,
                agentId: 'agent-2',
                vote: 'approve'
            });

            await codebolt.agentDeliberation.vote({
                deliberationId,
                agentId: 'agent-3',
                vote: 'approve'
            });

            // Step 4: Get winner
            const winnerResponse = await codebolt.agentDeliberation.getWinner({
                deliberationId
            });

            // Step 5: Generate summary
            const summaryResponse = await codebolt.agentDeliberation.summary({
                deliberationId
            });

            expect(createResponse.success).toBe(true);
            expect(winnerResponse.winner).toBeDefined();
            expect(summaryResponse.summary).toBeDefined();

            console.log('AskUserQuestion: Did the complete workflow succeed?');
            console.log('   Winner:', winnerResponse.winner?.agentId);
        });

        test('should handle parallel deliberations', async () => {
            // Create multiple deliberations in parallel
            const deliberations = await Promise.all([
                codebolt.agentDeliberation.create({
                    topic: 'Parallel deliberation 1',
                    participants: ['agent-1', 'agent-2']
                }),
                codebolt.agentDeliberation.create({
                    topic: 'Parallel deliberation 2',
                    participants: ['agent-3', 'agent-4']
                }),
                codebolt.agentDeliberation.create({
                    topic: 'Parallel deliberation 3',
                    participants: ['agent-1', 'agent-5']
                })
            ]);

            expect(deliberations).toHaveLength(3);
            deliberations.forEach(d => {
                expect(d.deliberation?.id).toBeDefined();
            });

            console.log('AskUserQuestion: Were parallel deliberations created?');
            console.log('   Created:', deliberations.length);
        });
    });
});
