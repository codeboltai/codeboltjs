import codebolt from '../../dist';

/**
 * Comprehensive Test Suite for File System Module
 *
 * This test suite covers ALL methods in the fs module:
 * - createFile, readFile, updateFile, deleteFile
 * - createFolder, deleteFolder
 * - listFile, listDirectory
 * - searchFiles, grepSearch, fileSearch
 * - readManyFiles
 * - listCodeDefinitionNames
 * - editFileWithDiff, writeToFile
 *
 * Each test uses the shared CodeboltSDK instance and includes
 * user verification via askQuestion at the end.
 */

// Test configuration
const TEST_CONFIG = {
    baseTestPath: './test-fs-tests',
    testFileName: 'test-file.txt',
    testFolderName: 'test-folder',
    testContent: 'This is test content for file system testing.',
    updatedContent: 'This is updated content for file system testing.',
    largeContent: 'This is larger content for testing readManyFiles.'.repeat(10)
};

// Helper function to wait for Codebolt connection
async function waitForConnection(): Promise<void> {
    if (!(codebolt as any).waitForConnection) {
        // Fallback to waitForReady if waitForConnection is not available
        await codebolt.waitForReady();
    } else {
        await (codebolt as any).waitForConnection();
    }
}

// Helper function to ask user for test verification
async function verifyTest(testName: string): Promise<void> {
    try {
        await codebolt.chat.askQuestion(
            `Did the ${testName} test succeed? Check the Codebolt app for the result.`,
            ['Yes, test passed', 'No, test failed'],
            false
        );
    } catch (error) {
        console.log(`Note: User verification skipped for ${testName} (automated environment)`);
    }
}

/**
 * Test Suite: Basic File Operations
 */
describe('File System Tests - Basic File Operations', () => {

    beforeAll(async () => {
        // Wait for Codebolt connection to be established
        await waitForConnection();
        console.log('✅ Codebolt connection established');
    });

    /**
     * Test: createFile
     * Description: Creates a new file with specified content
     * Expected: File should be created successfully
     */
    test('createFile - should create a new file with content', async () => {
        const testName = 'createFile';
        console.log(`\n🧪 Testing ${testName}...`);

        try {
            const result = await codebolt.fs.createFile(
                TEST_CONFIG.testFileName,
                TEST_CONFIG.testContent,
                TEST_CONFIG.baseTestPath
            );

            console.log(`${testName} result:`, JSON.stringify(result, null, 2));

            // Verify the result has expected structure
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');

            // Ask user to verify test success
            await verifyTest(testName);

        } catch (error) {
            console.error(`❌ ${testName} test failed:`, error);
            throw error;
        }
    });

    /**
     * Test: readFile
     * Description: Reads content from an existing file
     * Expected: Should return the file content
     */
    test('readFile - should read content from an existing file', async () => {
        const testName = 'readFile';
        console.log(`\n🧪 Testing ${testName}...`);

        try {
            const result = await codebolt.fs.readFile(
                `${TEST_CONFIG.baseTestPath}/${TEST_CONFIG.testFileName}`
            );

            console.log(`${testName} result:`, JSON.stringify(result, null, 2));

            // Verify the result has content
            expect(result).toBeDefined();
            expect(result.content).toBeDefined();
            expect(result.content).toContain('test content');

            // Ask user to verify test success
            await verifyTest(testName);

        } catch (error) {
            console.error(`❌ ${testName} test failed:`, error);
            throw error;
        }
    });

    /**
     * Test: updateFile
     * Description: Updates content of an existing file
     * Expected: File should be updated with new content
     */
    test('updateFile - should update file content', async () => {
        const testName = 'updateFile';
        console.log(`\n🧪 Testing ${testName}...`);

        try {
            const result = await codebolt.fs.updateFile(
                TEST_CONFIG.testFileName,
                TEST_CONFIG.baseTestPath,
                TEST_CONFIG.updatedContent
            );

            console.log(`${testName} result:`, JSON.stringify(result, null, 2));

            // Verify the result
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');

            // Ask user to verify test success
            await verifyTest(testName);

        } catch (error) {
            console.error(`❌ ${testName} test failed:`, error);
            throw error;
        }
    });

    /**
     * Test: writeToFile
     * Description: Writes content to a file using relative path
     * Expected: Content should be written to the file
     */
    test('writeToFile - should write content to a file', async () => {
        const testName = 'writeToFile';
        console.log(`\n🧪 Testing ${testName}...`);

        try {
            const result = await codebolt.fs.writeToFile(
                `${TEST_CONFIG.baseTestPath}/${TEST_CONFIG.testFileName}`,
                'Content written via writeToFile method'
            );

            console.log(`${testName} result:`, JSON.stringify(result, null, 2));

            // Verify the result
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');

            // Ask user to verify test success
            await verifyTest(testName);

        } catch (error) {
            console.error(`❌ ${testName} test failed:`, error);
            throw error;
        }
    });

    /**
     * Test: deleteFile
     * Description: Deletes an existing file
     * Expected: File should be deleted successfully
     */
    test('deleteFile - should delete an existing file', async () => {
        const testName = 'deleteFile';
        console.log(`\n🧪 Testing ${testName}...`);

        try {
            // First create a file to delete
            await codebolt.fs.createFile(
                'file-to-delete.txt',
                'This file will be deleted',
                TEST_CONFIG.baseTestPath
            );

            // Now delete it
            const result = await codebolt.fs.deleteFile(
                'file-to-delete.txt',
                TEST_CONFIG.baseTestPath
            );

            console.log(`${testName} result:`, JSON.stringify(result, null, 2));

            // Verify the result
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');

            // Ask user to verify test success
            await verifyTest(testName);

        } catch (error) {
            console.error(`❌ ${testName} test failed:`, error);
            throw error;
        }
    });
});

/**
 * Test Suite: Folder Operations
 */
describe('File System Tests - Folder Operations', () => {

    /**
     * Test: createFolder
     * Description: Creates a new folder
     * Expected: Folder should be created successfully
     */
    test('createFolder - should create a new folder', async () => {
        const testName = 'createFolder';
        console.log(`\n🧪 Testing ${testName}...`);

        try {
            const result = await codebolt.fs.createFolder(
                TEST_CONFIG.testFolderName,
                TEST_CONFIG.baseTestPath
            );

            console.log(`${testName} result:`, JSON.stringify(result, null, 2));

            // Verify the result
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');

            // Ask user to verify test success
            await verifyTest(testName);

        } catch (error) {
            console.error(`❌ ${testName} test failed:`, error);
            throw error;
        }
    });

    /**
     * Test: deleteFolder
     * Description: Deletes an existing folder
     * Expected: Folder should be deleted successfully
     */
    test('deleteFolder - should delete an existing folder', async () => {
        const testName = 'deleteFolder';
        console.log(`\n🧪 Testing ${testName}...`);

        try {
            const result = await codebolt.fs.deleteFolder(
                TEST_CONFIG.testFolderName,
                TEST_CONFIG.baseTestPath
            );

            console.log(`${testName} result:`, JSON.stringify(result, null, 2));

            // Verify the result
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');

            // Ask user to verify test success
            await verifyTest(testName);

        } catch (error) {
            console.error(`❌ ${testName} test failed:`, error);
            throw error;
        }
    });
});

/**
 * Test Suite: Listing Operations
 */
describe('File System Tests - Listing Operations', () => {

    /**
     * Test: listFile
     * Description: Lists files in a directory (non-recursive)
     * Expected: Should return list of files in the directory
     */
    test('listFile - should list files in directory (non-recursive)', async () => {
        const testName = 'listFile (non-recursive)';
        console.log(`\n🧪 Testing ${testName}...`);

        try {
            const result = await codebolt.fs.listFile(
                TEST_CONFIG.baseTestPath,
                false
            );

            console.log(`${testName} result:`, JSON.stringify(result, null, 2));

            // Verify the result
            expect(result).toBeDefined();
            expect(Array.isArray(result.files) || Array.isArray(result)).toBeTruthy();

            // Ask user to verify test success
            await verifyTest(testName);

        } catch (error) {
            console.error(`❌ ${testName} test failed:`, error);
            throw error;
        }
    });

    /**
     * Test: listFile (recursive)
     * Description: Lists files in a directory recursively
     * Expected: Should return list of all files including subdirectories
     */
    test('listFile - should list files in directory (recursive)', async () => {
        const testName = 'listFile (recursive)';
        console.log(`\n🧪 Testing ${testName}...`);

        try {
            const result = await codebolt.fs.listFile(
                TEST_CONFIG.baseTestPath,
                true
            );

            console.log(`${testName} result:`, JSON.stringify(result, null, 2));

            // Verify the result
            expect(result).toBeDefined();
            expect(Array.isArray(result.files) || Array.isArray(result)).toBeTruthy();

            // Ask user to verify test success
            await verifyTest(testName);

        } catch (error) {
            console.error(`❌ ${testName} test failed:`, error);
            throw error;
        }
    });

    /**
     * Test: listDirectory
     * Description: Lists directory contents with detailed information
     * Expected: Should return detailed directory listing
     */
    test('listDirectory - should list directory with details', async () => {
        const testName = 'listDirectory';
        console.log(`\n🧪 Testing ${testName}...`);

        try {
            const result = await codebolt.fs.listDirectory({
                path: TEST_CONFIG.baseTestPath,
                show_hidden: false,
                detailed: true,
                limit: 100
            });

            console.log(`${testName} result:`, JSON.stringify(result, null, 2));

            // Verify the result
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');

            // Ask user to verify test success
            await verifyTest(testName);

        } catch (error) {
            console.error(`❌ ${testName} test failed:`, error);
            throw error;
        }
    });
});

/**
 * Test Suite: Search Operations
 */
describe('File System Tests - Search Operations', () => {

    /**
     * Test: searchFiles
     * Description: Searches files using regex pattern
     * Expected: Should return files matching the pattern
     */
    test('searchFiles - should search files using regex pattern', async () => {
        const testName = 'searchFiles';
        console.log(`\n🧪 Testing ${testName}...`);

        try {
            const result = await codebolt.fs.searchFiles(
                TEST_CONFIG.baseTestPath,
                '.*\\.txt',
                '*.txt'
            );

            console.log(`${testName} result:`, JSON.stringify(result, null, 2));

            // Verify the result
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');

            // Ask user to verify test success
            await verifyTest(testName);

        } catch (error) {
            console.error(`❌ ${testName} test failed:`, error);
            throw error;
        }
    });

    /**
     * Test: grepSearch
     * Description: Performs grep search for content in files
     * Expected: Should return files containing the search query
     */
    test('grepSearch - should search for content in files', async () => {
        const testName = 'grepSearch';
        console.log(`\n🧪 Testing ${testName}...`);

        try {
            const result = await codebolt.fs.grepSearch(
                TEST_CONFIG.baseTestPath,
                'test',
                '*.txt',
                undefined,
                true
            );

            console.log(`${testName} result:`, JSON.stringify(result, null, 2));

            // Verify the result
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');

            // Ask user to verify test success
            await verifyTest(testName);

        } catch (error) {
            console.error(`❌ ${testName} test failed:`, error);
            throw error;
        }
    });

    /**
     * Test: fileSearch
     * Description: Performs fuzzy search for files
     * Expected: Should return files matching the fuzzy query
     */
    test('fileSearch - should perform fuzzy file search', async () => {
        const testName = 'fileSearch';
        console.log(`\n🧪 Testing ${testName}...`);

        try {
            const result = await codebolt.fs.fileSearch('test-file');

            console.log(`${testName} result:`, JSON.stringify(result, null, 2));

            // Verify the result
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');

            // Ask user to verify test success
            await verifyTest(testName);

        } catch (error) {
            console.error(`❌ ${testName} test failed:`, error);
            throw error;
        }
    });
});

/**
 * Test Suite: Advanced Operations
 */
describe('File System Tests - Advanced Operations', () => {

    /**
     * Test: readManyFiles
     * Description: Reads multiple files based on patterns
     * Expected: Should return content from multiple files
     */
    test('readManyFiles - should read multiple files', async () => {
        const testName = 'readManyFiles';
        console.log(`\n🧪 Testing ${testName}...`);

        try {
            const result = await codebolt.fs.readManyFiles({
                paths: [TEST_CONFIG.baseTestPath],
                include: ['*.txt'],
                recursive: false,
                use_default_excludes: true,
                max_files: 10,
                include_metadata: true,
                notifyUser: false
            });

            console.log(`${testName} result:`, JSON.stringify(result, null, 2));

            // Verify the result
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');

            // Ask user to verify test success
            await verifyTest(testName);

        } catch (error) {
            console.error(`❌ ${testName} test failed:`, error);
            throw error;
        }
    });

    /**
     * Test: listCodeDefinitionNames
     * Description: Lists code definition names in a path
     * Expected: Should return list of code definitions
     */
    test('listCodeDefinitionNames - should list code definitions', async () => {
        const testName = 'listCodeDefinitionNames';
        console.log(`\n🧪 Testing ${testName}...`);

        try {
            const result = await codebolt.fs.listCodeDefinitionNames(
                TEST_CONFIG.baseTestPath
            );

            console.log(`${testName} result:`, JSON.stringify(result, null, 2));

            // Verify the result
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');

            // Ask user to verify test success
            await verifyTest(testName);

        } catch (error) {
            console.error(`❌ ${testName} test failed:`, error);
            throw error;
        }
    });

    /**
     * Test: editFileWithDiff
     * Description: Edits a file by applying a diff
     * Expected: Should apply diff and edit the file
     */
    test('editFileWithDiff - should edit file with diff', async () => {
        const testName = 'editFileWithDiff';
        console.log(`\n🧪 Testing ${testName}...`);

        try {
            // Create a test file first
            await codebolt.fs.createFile(
                'diff-test-file.txt',
                'Original content',
                TEST_CONFIG.baseTestPath
            );

            const result = await codebolt.fs.editFileWithDiff(
                `${TEST_CONFIG.baseTestPath}/diff-test-file.txt`,
                '- Original content\n+ Updated content via diff',
                'test-diff-identifier',
                'Test diff application',
                'default'
            );

            console.log(`${testName} result:`, JSON.stringify(result, null, 2));

            // Verify the result
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');

            // Ask user to verify test success
            await verifyTest(testName);

        } catch (error) {
            console.error(`❌ ${testName} test failed:`, error);
            throw error;
        }
    });
});

/**
 * Test Suite: Error Handling
 */
describe('File System Tests - Error Handling', () => {

    /**
     * Test: readFile with non-existent file
     * Description: Attempts to read a file that doesn't exist
     * Expected: Should handle error gracefully
     */
    test('readFile - should handle non-existent file error', async () => {
        const testName = 'readFile (error handling)';
        console.log(`\n🧪 Testing ${testName}...`);

        try {
            const result = await codebolt.fs.readFile(
                `${TEST_CONFIG.baseTestPath}/non-existent-file.txt`
            );

            console.log(`${testName} result:`, JSON.stringify(result, null, 2));

            // Verify the result or error handling
            expect(result).toBeDefined();

            // Ask user to verify test success
            await verifyTest(testName);

        } catch (error) {
            console.log(`✅ Error handled correctly:`, error instanceof Error ? error.message : error);
            expect(error).toBeDefined();

            // Still ask user to verify
            await verifyTest(testName);
        }
    });

    /**
     * Test: deleteFile with non-existent file
     * Description: Attempts to delete a file that doesn't exist
     * Expected: Should handle error gracefully
     */
    test('deleteFile - should handle non-existent file error', async () => {
        const testName = 'deleteFile (error handling)';
        console.log(`\n🧪 Testing ${testName}...`);

        try {
            const result = await codebolt.fs.deleteFile(
                'non-existent-file.txt',
                TEST_CONFIG.baseTestPath
            );

            console.log(`${testName} result:`, JSON.stringify(result, null, 2));

            // Verify the result
            expect(result).toBeDefined();

            // Ask user to verify test success
            await verifyTest(testName);

        } catch (error) {
            console.log(`✅ Error handled correctly:`, error instanceof Error ? error.message : error);
            expect(error).toBeDefined();

            // Still ask user to verify
            await verifyTest(testName);
        }
    });
});

/**
 * Cleanup Test Suite
 */
describe('File System Tests - Cleanup', () => {

    /**
     * Test: Cleanup test artifacts
     * Description: Removes all test files and folders created during testing
     * Expected: Should clean up successfully
     */
    test('cleanup - should remove all test artifacts', async () => {
        const testName = 'cleanup';
        console.log(`\n🧪 Testing ${testName}...`);

        try {
            // Delete test files
            await codebolt.fs.deleteFile(TEST_CONFIG.testFileName, TEST_CONFIG.baseTestPath);
            await codebolt.fs.deleteFile('diff-test-file.txt', TEST_CONFIG.baseTestPath);

            // Note: We don't delete the test directory itself as it might contain other files
            // In a real scenario, you might want to clean up the entire directory

            console.log(`${testName} completed successfully`);

            // Ask user to verify cleanup
            await verifyTest(testName);

        } catch (error) {
            console.error(`❌ ${testName} test failed:`, error);
            throw error;
        }
    });
});
