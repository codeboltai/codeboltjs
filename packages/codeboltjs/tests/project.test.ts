/**
 * Test Suite for Project Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    resetTestState,
    clearMockData,
} from './setup';

describe('Project Module', () => {
    beforeAll(async () => {
        console.log('[Project Module] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[Project Module] Connection ready');
    });

    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should get project settings', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.project.getProjectSettings();

        expect(response).toBeDefined();

        // AskUserQuestion: Verify project settings
        console.log('✅ AskUserQuestion: Were project settings retrieved successfully?');
        console.log('   Settings Keys:', Object.keys(response.settings || {}).length);
    });

    test('should get project path', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.project.getProjectPath();

        expect(response).toBeDefined();
        expect(response.path).toBeDefined();

        // AskUserQuestion: Verify project path
        console.log('✅ AskUserQuestion: Was the project path retrieved successfully?');
        console.log('   Path:', response.path);
    });

    test('should get repo map', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.project.getRepoMap({
            includeDetails: true
        });

        expect(response).toBeDefined();

        // AskUserQuestion: Verify repo map
        console.log('✅ AskUserQuestion: Was the repo map retrieved successfully?');
    });

    test('should get editor file status', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.project.getEditorFileStatus();

        expect(response).toBeDefined();

        // AskUserQuestion: Verify editor file status
        console.log('✅ AskUserQuestion: Was the editor file status retrieved successfully?');
        console.log('   Open Files:', response.files?.length || 0);
    });
});
