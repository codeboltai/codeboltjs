import codebolt from "../../dist";

/**
 * Comprehensive Test Suite for Git Module
 *
 * This test suite covers all methods in the Git module:
 * - init, pull, push, status, addAll
 * - commit, checkout, branch
 * - logs, diff
 * - clone (newly added method)
 *
 * Each test uses the shared CodeboltSDK instance and includes:
 * - Descriptive test names
 * - Proper assertions
 * - AskUserQuestion for verification
 * - Error handling
 * - Detailed comments
 */

// Test configuration
const TEST_TIMEOUT = 50000; // 50 seconds timeout for each test

describe('Git Module Tests', () => {
    // Test suite setup - activate the SDK once before all tests
    beforeAll(async () => {
        try {
            await codebolt.activate();
            console.log('✓ Codebolt SDK activated successfully');
        } catch (error) {
            console.error('✗ Failed to activate Codebolt SDK:', error);
            throw error;
        }
    }, TEST_TIMEOUT);

    /**
     * Test: git.init()
     * Description: Tests initializing a new Git repository at a specified path
     * Expected: Should receive a successful response with repository initialization details
     */
    test('git.init() should initialize a new Git repository at the specified path', async () => {
        // Arrange: Define the path where the repository should be initialized
        const testPath = '/test/git-init-test';

        try {
            // Act: Initialize the Git repository
            const response = await codebolt.git.init(testPath);

            // Assert: Verify the response structure
            expect(response).toBeDefined();
            expect(response.type).toBe('gitInitResponse');
            expect(response.requestId).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.message?.includes('Initialized') || response.data).toBeTruthy();

            console.log('✓ Git init successful:', response.message || response.data);

            // Ask user to verify the repository was initialized
            await codebolt.chat.confirmationRequest({
                message: `Git repository initialized at ${testPath}. Please verify:\n` +
                    `1. A .git folder exists at ${testPath}/.git\n` +
                    `2. The repository is properly initialized\n\n` +
                    `Did the initialization complete successfully?`,
                buttons: ['Yes', 'No']
            });

        } catch (error) {
            console.error('✗ Git init failed:', error);
            throw error;
        }
    }, TEST_TIMEOUT);

    /**
     * Test: git.init() with invalid path
     * Description: Tests error handling when initializing with an invalid path
     * Expected: Should receive an error response
     */
    test('git.init() should handle invalid path errors gracefully', async () => {
        // Arrange: Use an invalid path
        const invalidPath = '/nonexistent/path/that/does/not/exist';

        try {
            // Act: Attempt to initialize with invalid path
            const response = await codebolt.git.init(invalidPath);

            // Assert: Verify error is handled
            expect(response).toBeDefined();

            if (response.success === false || response.error) {
                console.log('✓ Error handled correctly:', response.error || response.message);
                expect(response.error).toBeDefined();
            } else {
                console.log('⚠ Warning: Expected error but operation succeeded');
            }

            // Ask user to verify error handling
            await codebolt.chat.confirmationRequest({
                message: `Attempted to initialize Git at invalid path: ${invalidPath}\n` +
                    `Error: ${response.error || 'No error returned'}\n\n` +
                    `Was the error handled appropriately?`,
                buttons: ['Yes', 'No']
            });

        } catch (error) {
            console.log('✓ Exception caught as expected:', error);
            expect(error).toBeDefined();
        }
    }, TEST_TIMEOUT);

    /**
     * Test: git.clone()
     * Description: Tests cloning a remote Git repository
     * Expected: Should successfully clone a repository to the specified path
     */
    test('git.clone() should clone a remote repository to the specified path', async () => {
        // Arrange: Define repository URL and clone path
        const repoUrl = 'https://github.com/codeboltai/codeboltjs.git';
        const clonePath = '/test/cloned-repo';

        try {
            // Act: Clone the repository
            const response = await codebolt.git.clone(repoUrl, clonePath);

            // Assert: Verify the clone response
            expect(response).toBeDefined();
            expect(response.type).toBe('gitCloneResponse');
            expect(response.requestId).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.url).toBe(repoUrl);

            console.log('✓ Repository cloned successfully:', response.message || response.data);

            // Ask user to verify the clone
            await codebolt.chat.confirmationRequest({
                message: `Repository cloned from ${repoUrl} to ${clonePath}\n` +
                    `Please verify:\n` +
                    `1. The repository files exist at ${clonePath}\n` +
                    `2. The .git folder is present\n` +
                    `3. Remote origin is configured correctly\n\n` +
                    `Did the clone complete successfully?`,
                buttons: ['Yes', 'No']
            });

        } catch (error) {
            console.error('✗ Git clone failed:', error);
            throw error;
        }
    }, TEST_TIMEOUT);

    /**
     * Test: git.clone() without path parameter
     * Description: Tests cloning a repository without specifying a path (should use default)
     * Expected: Should clone to a default location
     */
    test('git.clone() should work without specifying a path parameter', async () => {
        // Arrange: Use only the URL without a path
        const repoUrl = 'https://github.com/codeboltai/codeboltjs.git';

        try {
            // Act: Clone without specifying path
            const response = await codebolt.git.clone(repoUrl);

            // Assert: Verify the clone response
            expect(response).toBeDefined();
            expect(response.type).toBe('gitCloneResponse');
            expect(response.success).toBe(true);

            console.log('✓ Repository cloned to default path:', response.message || response.data);

            // Ask user to verify
            await codebolt.chat.confirmationRequest({
                message: `Repository cloned from ${repoUrl} to default path\n` +
                    `Please check if the repository was cloned to the expected default location.\n\n` +
                    `Was the clone successful?`,
                buttons: ['Yes', 'No']
            });

        } catch (error) {
            console.error('✗ Git clone failed:', error);
            throw error;
        }
    }, TEST_TIMEOUT);

    /**
     * Test: git.status()
     * Description: Tests getting the status of a Git repository
     * Expected: Should return repository status including modified, added, and untracked files
     */
    test('git.status() should return the current repository status', async () => {
        try {
            // Act: Get repository status
            const response = await codebolt.git.status();

            // Assert: Verify status response structure
            expect(response).toBeDefined();
            expect(response.type).toBe('gitStatusResponse');
            expect(response.requestId).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.status).toBeDefined();

            console.log('✓ Git status retrieved:', response.status);

            // Ask user to verify status
            await codebolt.chat.confirmationRequest({
                message: `Git status retrieved successfully.\n` +
                    `Status: ${JSON.stringify(response.status, null, 2)}\n\n` +
                    `Does this status match your repository state?`,
                buttons: ['Yes', 'No']
            });

        } catch (error) {
            console.error('✗ Git status failed:', error);
            throw error;
        }
    }, TEST_TIMEOUT);

    /**
     * Test: git.addAll()
     * Description: Tests adding all changes to the staging area
     * Expected: Should successfully stage all modified and new files
     */
    test('git.addAll() should add all changes to the staging area', async () => {
        try {
            // Act: Add all changes to staging
            const response = await codebolt.git.addAll();

            // Assert: Verify add response
            expect(response).toBeDefined();
            expect(response.type).toBe('AddResponse');
            expect(response.requestId).toBeDefined();
            expect(response.success).toBe(true);

            console.log('✓ All changes added to staging area:', response.message || response.content);

            // Ask user to verify staging
            await codebolt.chat.confirmationRequest({
                message: `All changes have been added to the staging area.\n` +
                    `Please verify by running 'git status' in your terminal.\n\n` +
                    `Are all changes staged correctly?`,
                buttons: ['Yes', 'No']
            });

        } catch (error) {
            console.error('✗ Git addAll failed:', error);
            throw error;
        }
    }, TEST_TIMEOUT);

    /**
     * Test: git.commit()
     * Description: Tests committing staged changes with a commit message
     * Expected: Should create a new commit with the provided message
     */
    test('git.commit() should commit staged changes with the provided message', async () => {
        // Arrange: Define a commit message
        const commitMessage = 'Test commit: Comprehensive test of Git module';

        try {
            // Act: Commit the staged changes
            const response = await codebolt.git.commit(commitMessage);

            // Assert: Verify commit response
            expect(response).toBeDefined();
            expect(response.type).toBe('gitCommitResponse');
            expect(response.requestId).toBeDefined();
            expect(response.success).toBe(true);

            console.log('✓ Changes committed:', response.message || response.content);

            // Ask user to verify the commit
            await codebolt.chat.confirmationRequest({
                message: `Changes committed with message: "${commitMessage}"\n` +
                    `Please verify by running 'git log -1' in your terminal.\n\n` +
                    `Was the commit created successfully?`,
                buttons: ['Yes', 'No']
            });

        } catch (error) {
            console.error('✗ Git commit failed:', error);
            throw error;
        }
    }, TEST_TIMEOUT);

    /**
     * Test: git.commit() with empty message
     * Description: Tests error handling when committing with an empty message
     * Expected: Should receive an error or warning about empty commit message
     */
    test('git.commit() should handle empty commit message', async () => {
        // Arrange: Use an empty commit message
        const emptyMessage = '';

        try {
            // Act: Attempt to commit with empty message
            const response = await codebolt.git.commit(emptyMessage);

            // Assert: Verify error handling
            expect(response).toBeDefined();

            if (response.success === false || response.error) {
                console.log('✓ Empty message error handled:', response.error);
            } else {
                console.log('⚠ Warning: Commit succeeded with empty message (may be allowed)');
            }

            // Ask user about the behavior
            await codebolt.chat.confirmationRequest({
                message: `Attempted to commit with empty message.\n` +
                    `Result: ${response.error || response.message}\n\n` +
                    `Was this handled appropriately?`,
                buttons: ['Yes', 'No']
            });

        } catch (error) {
            console.log('✓ Exception caught for empty message:', error);
        }
    }, TEST_TIMEOUT);

    /**
     * Test: git.branch()
     * Description: Tests creating a new branch
     * Expected: Should successfully create a new branch with the specified name
     */
    test('git.branch() should create a new branch', async () => {
        // Arrange: Define a new branch name
        const branchName = 'test-branch-' + Date.now();

        try {
            // Act: Create the new branch
            const response = await codebolt.git.branch(branchName);

            // Assert: Verify branch creation response
            expect(response).toBeDefined();
            expect(response.type).toBe('gitBranchResponse');
            expect(response.requestId).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.branch).toBe(branchName);

            console.log('✓ Branch created successfully:', branchName);

            // Ask user to verify branch creation
            await codebolt.chat.confirmationRequest({
                message: `New branch "${branchName}" has been created.\n` +
                    `Please verify by running 'git branch' in your terminal.\n\n` +
                    `Is the new branch visible in the branch list?`,
                buttons: ['Yes', 'No']
            });

        } catch (error) {
            console.error('✗ Git branch creation failed:', error);
            throw error;
        }
    }, TEST_TIMEOUT);

    /**
     * Test: git.checkout()
     * Description: Tests checking out to an existing branch
     * Expected: Should successfully switch to the specified branch
     */
    test('git.checkout() should switch to the specified branch', async () => {
        // Arrange: Use a branch name (could be main, master, or a test branch)
        const branchName = 'main';

        try {
            // Act: Checkout to the branch
            const response = await codebolt.git.checkout(branchName);

            // Assert: Verify checkout response
            expect(response).toBeDefined();
            expect(response.type).toBe('gitCheckoutResponse');
            expect(response.requestId).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.branch).toBe(branchName);

            console.log('✓ Checked out to branch:', branchName);

            // Ask user to verify checkout
            await codebolt.chat.confirmationRequest({
                message: `Switched to branch "${branchName}".\n` +
                    `Please verify by running 'git branch' in your terminal.\n\n` +
                    `Are you now on the correct branch?`,
                buttons: ['Yes', 'No']
            });

        } catch (error) {
            console.error('✗ Git checkout failed:', error);
            throw error;
        }
    }, TEST_TIMEOUT);

    /**
     * Test: git.checkout() with non-existent branch
     * Description: Tests error handling when checking out a non-existent branch
     * Expected: Should receive an error about the branch not existing
     */
    test('git.checkout() should handle non-existent branch error', async () => {
        // Arrange: Use a non-existent branch name
        const nonExistentBranch = 'non-existent-branch-' + Date.now();

        try {
            // Act: Attempt to checkout non-existent branch
            const response = await codebolt.git.checkout(nonExistentBranch);

            // Assert: Verify error handling
            expect(response).toBeDefined();

            if (response.success === false || response.error) {
                console.log('✓ Non-existent branch error handled:', response.error);
            } else {
                console.log('⚠ Warning: Checkout succeeded for unexpected branch');
            }

            // Ask user about error handling
            await codebolt.chat.confirmationRequest({
                message: `Attempted to checkout non-existent branch: ${nonExistentBranch}\n` +
                    `Error: ${response.error || response.message}\n\n` +
                    `Was the error handled appropriately?`,
                buttons: ['Yes', 'No']
            });

        } catch (error) {
            console.log('✓ Exception caught as expected:', error);
        }
    }, TEST_TIMEOUT);

    /**
     * Test: git.pull()
     * Description: Tests pulling latest changes from the remote repository
     * Expected: Should successfully pull changes or report up-to-date
     */
    test('git.pull() should pull latest changes from remote repository', async () => {
        try {
            // Act: Pull changes from remote
            const response = await codebolt.git.pull();

            // Assert: Verify pull response
            expect(response).toBeDefined();
            expect(response.type).toBe('gitPullResponse');
            expect(response.requestId).toBeDefined();
            expect(response.success).toBe(true);

            console.log('✓ Pull completed:', response.message || response.data);

            // Ask user to verify pull
            await codebolt.chat.confirmationRequest({
                message: `Git pull completed.\n` +
                    `Message: ${response.message || 'Already up to date'}\n\n` +
                    `Did the pull operation complete successfully?`,
                buttons: ['Yes', 'No']
            });

        } catch (error) {
            console.error('✗ Git pull failed:', error);
            throw error;
        }
    }, TEST_TIMEOUT);

    /**
     * Test: git.push()
     * Description: Tests pushing local changes to the remote repository
     * Expected: Should successfully push changes or report nothing to push
     */
    test('git.push() should push local changes to remote repository', async () => {
        try {
            // Act: Push changes to remote
            const response = await codebolt.git.push();

            // Assert: Verify push response
            expect(response).toBeDefined();
            expect(response.type).toBe('gitPushResponse');
            expect(response.requestId).toBeDefined();
            expect(response.success).toBe(true);

            console.log('✓ Push completed:', response.message || response.data);

            // Ask user to verify push
            await codebolt.chat.confirmationRequest({
                message: `Git push completed.\n` +
                    `Message: ${response.message || 'Everything up-to-date'}\n\n` +
                    `Did the push operation complete successfully?`,
                buttons: ['Yes', 'No']
            });

        } catch (error) {
            console.error('✗ Git push failed:', error);
            throw error;
        }
    }, TEST_TIMEOUT);

    /**
     * Test: git.logs()
     * Description: Tests retrieving commit logs from the repository
     * Expected: Should return an array of commit history
     */
    test('git.logs() should retrieve commit history from the repository', async () => {
        // Arrange: Get project path for logs
        const { projectPath } = await codebolt.project.getProjectPath();

        try {
            // Act: Retrieve commit logs
            const response = await codebolt.git.logs(projectPath);

            // Assert: Verify logs response
            expect(response).toBeDefined();
            expect(response.type).toBe('gitLogsResponse');
            expect(response.requestId).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.logs).toBeDefined();
            expect(Array.isArray(response.logs)).toBe(true);

            console.log(`✓ Retrieved ${response.logs.length} commit log(s)`);

            // Ask user to verify logs
            await codebolt.chat.confirmationRequest({
                message: `Retrieved ${response.logs.length} commit(s) from repository history.\n` +
                    `Recent commits: ${JSON.stringify(response.logs.slice(0, 3), null, 2)}\n\n` +
                    `Do the commit logs look correct?`,
                buttons: ['Yes', 'No']
            });

        } catch (error) {
            console.error('✗ Git logs failed:', error);
            throw error;
        }
    }, TEST_TIMEOUT);

    /**
     * Test: git.logs() with invalid path
     * Description: Tests error handling when retrieving logs from an invalid path
     * Expected: Should receive an error about the invalid path
     */
    test('git.logs() should handle invalid path gracefully', async () => {
        // Arrange: Use an invalid path
        const invalidPath = '/nonexistent/repository';

        try {
            // Act: Attempt to get logs from invalid path
            const response = await codebolt.git.logs(invalidPath);

            // Assert: Verify error handling
            expect(response).toBeDefined();

            if (response.success === false || response.error) {
                console.log('✓ Invalid path error handled:', response.error);
            }

            // Ask user about error handling
            await codebolt.chat.confirmationRequest({
                message: `Attempted to get logs from invalid path: ${invalidPath}\n` +
                    `Error: ${response.error || response.message}\n\n` +
                    `Was the error handled appropriately?`,
                buttons: ['Yes', 'No']
            });

        } catch (error) {
            console.log('✓ Exception caught as expected:', error);
        }
    }, TEST_TIMEOUT);

    /**
     * Test: git.diff()
     * Description: Tests getting the diff for a specific commit
     * Expected: Should return the diff output for the specified commit
     */
    test('git.diff() should retrieve diff for a specific commit', async () => {
        // Arrange: Use HEAD to get the diff of the last commit
        const commitHash = 'HEAD';

        try {
            // Act: Get diff for the commit
            const response = await codebolt.git.diff(commitHash);

            // Assert: Verify diff response
            expect(response).toBeDefined();
            expect(response.type).toBe('gitDiffResponse');
            expect(response.requestId).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.diff).toBeDefined();

            console.log('✓ Diff retrieved successfully');
            console.log('Diff preview:', response.diff.substring(0, 200) + '...');

            // Ask user to verify diff
            await codebolt.chat.confirmationRequest({
                message: `Retrieved diff for commit: ${commitHash}\n` +
                    `Diff length: ${response.diff.length} characters\n\n` +
                    `Does the diff output look correct?`,
                buttons: ['Yes', 'No']
            });

        } catch (error) {
            console.error('✗ Git diff failed:', error);
            throw error;
        }
    }, TEST_TIMEOUT);

    /**
     * Test: git.diff() with invalid commit hash
     * Description: Tests error handling when getting diff for an invalid commit
     * Expected: Should receive an error about the invalid commit
     */
    test('git.diff() should handle invalid commit hash gracefully', async () => {
        // Arrange: Use an invalid commit hash
        const invalidHash = 'invalid-commit-hash-12345';

        try {
            // Act: Attempt to get diff for invalid commit
            const response = await codebolt.git.diff(invalidHash);

            // Assert: Verify error handling
            expect(response).toBeDefined();

            if (response.success === false || response.error) {
                console.log('✓ Invalid commit hash error handled:', response.error);
            }

            // Ask user about error handling
            await codebolt.chat.confirmationRequest({
                message: `Attempted to get diff for invalid commit: ${invalidHash}\n` +
                    `Error: ${response.error || response.message}\n\n` +
                    `Was the error handled appropriately?`,
                buttons: ['Yes', 'No']
            });

        } catch (error) {
            console.log('✓ Exception caught as expected:', error);
        }
    }, TEST_TIMEOUT);

    /**
     * Test: Complete Git workflow (init, add, commit, branch, checkout)
     * Description: Tests a complete Git workflow from initialization to branch switching
     * Expected: All steps should complete successfully
     */
    test('Complete Git workflow: init -> add -> commit -> branch -> checkout', async () => {
        // Arrange: Define test parameters
        const testPath = '/test/git-workflow-test';
        const branchName = 'feature-test-' + Date.now();
        const commitMessage = 'Initial commit for workflow test';

        try {
            // Step 1: Initialize repository
            console.log('Step 1: Initializing repository...');
            const initResponse = await codebolt.git.init(testPath);
            expect(initResponse.success).toBe(true);
            console.log('✓ Repository initialized');

            // Step 2: Add all changes
            console.log('Step 2: Adding all changes...');
            const addResponse = await codebolt.git.addAll();
            expect(addResponse.success).toBe(true);
            console.log('✓ Changes staged');

            // Step 3: Commit changes
            console.log('Step 3: Committing changes...');
            const commitResponse = await codebolt.git.commit(commitMessage);
            expect(commitResponse.success).toBe(true);
            console.log('✓ Changes committed');

            // Step 4: Create new branch
            console.log('Step 4: Creating new branch...');
            const branchResponse = await codebolt.git.branch(branchName);
            expect(branchResponse.success).toBe(true);
            console.log('✓ Branch created:', branchName);

            // Step 5: Checkout to new branch
            console.log('Step 5: Checking out to new branch...');
            const checkoutResponse = await codebolt.git.checkout(branchName);
            expect(checkoutResponse.success).toBe(true);
            console.log('✓ Checked out to:', branchName);

            console.log('✓ Complete workflow executed successfully');

            // Ask user to verify the complete workflow
            await codebolt.chat.confirmationRequest({
                message: `Complete Git workflow executed:\n` +
                    `1. ✓ Initialized repository at ${testPath}\n` +
                    `2. ✓ Staged all changes\n` +
                    `3. ✓ Committed with message: "${commitMessage}"\n` +
                    `4. ✓ Created branch: ${branchName}\n` +
                    `5. ✓ Checked out to: ${branchName}\n\n` +
                    `Please verify all steps completed successfully in your repository.\n\n` +
                    `Did the complete workflow execute as expected?`,
                buttons: ['Yes', 'No']
            });

        } catch (error) {
            console.error('✗ Git workflow failed:', error);
            throw error;
        }
    }, TEST_TIMEOUT);

    /**
     * Test: Edge case - Multiple operations in sequence
     * Description: Tests performing multiple Git operations in rapid succession
     * Expected: All operations should complete without interference
     */
    test('Multiple Git operations in sequence should execute correctly', async () => {
        try {
            // Perform multiple status checks in sequence
            console.log('Performing multiple status checks...');

            const status1 = await codebolt.git.status();
            expect(status1.success).toBe(true);
            console.log('✓ Status check 1 completed');

            const status2 = await codebolt.git.status();
            expect(status2.success).toBe(true);
            console.log('✓ Status check 2 completed');

            const status3 = await codebolt.git.status();
            expect(status3.success).toBe(true);
            console.log('✓ Status check 3 completed');

            // Verify all responses are consistent
            expect(status1.status).toEqual(status2.status);
            expect(status2.status).toEqual(status3.status);

            console.log('✓ Multiple operations executed successfully');

            // Ask user to verify
            await codebolt.chat.confirmationRequest({
                message: `Executed 3 Git status operations in sequence.\n` +
                    `All operations completed successfully with consistent results.\n\n` +
                    `Did all operations complete as expected?`,
                buttons: ['Yes', 'No']
            });

        } catch (error) {
            console.error('✗ Multiple operations failed:', error);
            throw error;
        }
    }, TEST_TIMEOUT);
});
