/**
 * Test Suite for Job Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('Job Module', () => {
    beforeAll(async () => {
        console.log('[Job Module] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[Job Module] Connection ready');
    });

    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should create a job group', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.job.createJobGroup({
            name: 'Test Job Group',
            description: 'Test job group for comprehensive testing'
        });

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.group).toBeDefined();

        // AskUserQuestion: Verify job group creation
        console.log('✅ AskUserQuestion: Was the job group created successfully?');
        console.log('   Group ID:', response.group?.id);
        console.log('   Group Name:', response.group?.name);
    });

    test('should create a job', async () => {
        const codebolt = sharedCodebolt();

        // First create a job group
        const groupResponse = await codebolt.job.createJobGroup({
            name: `Test Group for Job ${Date.now()}`
        });

        const groupId = groupResponse.group?.id || '';

        const response = await codebolt.job.createJob(groupId, {
            title: 'Test Job',
            description: 'Test job description',
            status: 'todo',
            priority: 'medium'
        });

        expect(response).toBeDefined();
        expect(response.job).toBeDefined();
        expect(response.job.title).toBe('Test Job');

        // AskUserQuestion: Verify job creation
        console.log('✅ AskUserQuestion: Was the job created successfully?');
        console.log('   Job ID:', response.job?.id);
        console.log('   Job Title:', response.job?.title);
    });

    test('should list jobs', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.job.listJobs({});

        expect(response).toBeDefined();
        expect(Array.isArray(response.jobs)).toBe(true);

        // AskUserQuestion: Verify job listing
        console.log('✅ AskUserQuestion: Were jobs listed successfully?');
        console.log('   Total Jobs:', response.jobs?.length || 0);
    });

    test('should add job dependency', async () => {
        const codebolt = sharedCodebolt();

        // Create a job group
        const groupResponse = await codebolt.job.createJobGroup({
            name: `Dependency Test Group ${Date.now()}`
        });
        const groupId = groupResponse.group?.id || '';

        // Create two jobs
        const job1Response = await codebolt.job.createJob(groupId, {
            title: 'Prerequisite Job',
            status: 'todo'
        });
        const job1Id = job1Response.job?.id || '';

        const job2Response = await codebolt.job.createJob(groupId, {
            title: 'Dependent Job',
            status: 'todo'
        });
        const job2Id = job2Response.job?.id || '';

        // Add dependency
        const response = await codebolt.job.addDependency(job2Id, job1Id, 'blocking');

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify dependency creation
        console.log('✅ AskUserQuestion: Was the job dependency added successfully?');
        console.log('   From Job:', job2Id);
        console.log('   To Job:', job1Id);
    });

    test('should manage job pheromones', async () => {
        const codebolt = sharedCodebolt();

        // Create a job group and job
        const groupResponse = await codebolt.job.createJobGroup({
            name: `Pheromone Test Group ${Date.now()}`
        });
        const groupId = groupResponse.group?.id || '';

        const jobResponse = await codebolt.job.createJob(groupId, {
            title: 'Test Job for Pheromone',
            status: 'todo'
        });
        const jobId = jobResponse.job?.id || '';

        // Add pheromone type
        const addTypeResponse = await codebolt.job.addPheromoneType({
            name: 'difficulty',
            decayRate: 0.1,
            defaultIntensity: 1.0
        });

        expect(addTypeResponse).toBeDefined();

        // Deposit pheromone
        const depositResponse = await codebolt.job.depositPheromone(jobId, {
            type: 'difficulty',
            intensity: 0.8
        });

        expect(depositResponse).toBeDefined();

        // AskUserQuestion: Verify pheromone operations
        console.log('✅ AskUserQuestion: Were pheromone operations successful?');
        console.log('   Pheromone Type Added:', addTypeResponse.success);
        console.log('   Pheromone Deposited:', depositResponse.success);
    });

    test('should manage job locking', async () => {
        const codebolt = sharedCodebolt();

        // Create a job group and job
        const groupResponse = await codebolt.job.createJobGroup({
            name: `Lock Test Group ${Date.now()}`
        });
        const groupId = groupResponse.group?.id || '';

        const jobResponse = await codebolt.job.createJob(groupId, {
            title: 'Test Job for Locking',
            status: 'ready'
        });
        const jobId = jobResponse.job?.id || '';

        // Acquire lock
        const lockResponse = await codebolt.job.lockJob(
            jobId,
            'test-agent-123',
            'Test Agent'
        );

        expect(lockResponse).toBeDefined();
        expect(lockResponse.locked).toBe(true);

        // Check if locked
        const checkResponse = await codebolt.job.isJobLocked(jobId);
        expect(checkResponse.locked).toBe(true);

        // Release lock
        const releaseResponse = await codebolt.job.unlockJob(jobId, 'test-agent-123');
        expect(releaseResponse.success).toBe(true);

        // AskUserQuestion: Verify job locking
        console.log('✅ AskUserQuestion: Was job locking mechanism working correctly?');
        console.log('   Lock Acquired:', lockResponse.locked);
        console.log('   Lock Checked:', checkResponse.locked);
        console.log('   Lock Released:', releaseResponse.success);
    });

    test('should manage job bids', async () => {
        const codebolt = sharedCodebolt();

        // Create a job group and job
        const groupResponse = await codebolt.job.createJobGroup({
            name: `Bid Test Group ${Date.now()}`
        });
        const groupId = groupResponse.group?.id || '';

        const jobResponse = await codebolt.job.createJob(groupId, {
            title: 'Test Job for Bidding',
            status: 'ready'
        });
        const jobId = jobResponse.job?.id || '';

        // Add a bid
        const bidResponse = await codebolt.job.addBid(jobId, {
            agentId: 'test-agent-123',
            agentName: 'Test Agent',
            estimatedDuration: 60,
            confidence: 0.9
        });

        expect(bidResponse).toBeDefined();

        // List bids
        const listResponse = await codebolt.job.listBids(jobId);
        expect(Array.isArray(listResponse.bids)).toBe(true);

        // AskUserQuestion: Verify bid operations
        console.log('✅ AskUserQuestion: Were bid operations successful?');
        console.log('   Bid Added:', bidResponse.success);
        console.log('   Total Bids:', listResponse.bids?.length || 0);
    });
});
