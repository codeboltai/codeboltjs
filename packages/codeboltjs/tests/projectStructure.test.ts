/**
 * Test Suite for ProjectStructure Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('ProjectStructure Module', () => {
    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment for ProjectStructure module...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] All ProjectStructure module tests completed');
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should get project metadata', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.projectStructure.getMetadata();

        expect(response).toBeDefined();
        expect(response.metadata).toBeDefined();

        // AskUserQuestion: Verify metadata retrieval
        console.log('✅ AskUserQuestion: Was the project metadata retrieved successfully?');
        console.log('   Metadata Keys:', Object.keys(response.metadata || {}).length);
    });

    test('should get packages', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.projectStructure.getPackages();

        expect(response).toBeDefined();
        expect(Array.isArray(response.packages)).toBe(true);

        // AskUserQuestion: Verify packages retrieval
        console.log('✅ AskUserQuestion: Were packages retrieved successfully?');
        console.log('   Total Packages:', response.packages?.length || 0);
    });

    test('should create package', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.projectStructure.createPackage({
            name: `test-package-${Date.now()}`,
            path: '/test/path',
            version: '1.0.0',
            type: 'application'
        });

        expect(response).toBeDefined();
        expect(response.package).toBeDefined();

        // AskUserQuestion: Verify package creation
        console.log('✅ AskUserQuestion: Was the package created successfully?');
        console.log('   Package ID:', response.package?.id);
    });

    test('should add API route', async () => {
        const codebolt = sharedCodebolt();

        // First create a package
        const packageResponse = await codebolt.projectStructure.createPackage({
            name: `test-package-api-${Date.now()}`,
            path: '/test/path'
        });
        const packageId = packageResponse.package?.id || '';

        // Add API route
        const response = await codebolt.projectStructure.addApiRoute(packageId, {
            path: '/test/api/route',
            method: 'GET',
            handler: 'testHandler'
        });

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify API route addition
        console.log('✅ AskUserQuestion: Was the API route added successfully?');
        console.log('   Success:', response.success);
    });
});
