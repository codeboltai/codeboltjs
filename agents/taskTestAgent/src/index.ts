import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";
import { FileMessage, FilePayload } from '@codebolt/types/wstypes/app-to-ui-ws/fileMessageSchemas';
import { GetAppStateResponse, StateServiceResponse } from '@codebolt/types/wstypes/app-to-agent-ws/stateServiceResponses';

// Helper function to log test results
const logTest = (testName: string, success: boolean, data?: any, error?: any) => {
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`\n${status} - ${testName}`);

    let message = `${status} - ${testName}`;

    if (data) {
        const dataStr = JSON.stringify(data, null, 2);
        console.log('Data:', dataStr);
        message += `\nData: ${dataStr}`;
    }

    if (error) {
        const errorStr = error instanceof Error
            ? `${error.message}\nStack: ${error.stack}`
            : JSON.stringify(error, null, 2);
        console.error('Error:', errorStr);
        message += `\nError: ${errorStr}`;
    }

    codebolt.chat.sendMessage(message, {});
};

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    console.log('🚀 Starting Filesystem Module Test Suite');
    codebolt.chat.sendMessage("🚀 Starting Filesystem Module Test Suite", {});

    const testResults: { [key: string]: boolean } = {};
    const testFolder = '/tmp/codebolt-fs-test';
    const testFile = 'test-file.txt';
    const testFilePath = `${testFolder}/${testFile}`;

    try {
        // ========================================
        // TEST 1: Create Folder
        // ========================================
        try {
            console.log('\n� TEST 1: Creating a test folder...');
            const createFolderResponse = await codebolt.fs.createFolder('codebolt-fs-test', '/tmp');
            testResults['createFolder'] = !!createFolderResponse.success;
            logTest('Create Folder', testResults['createFolder'], {
                success: createFolderResponse.success,
                folderPath: createFolderResponse.path
            });
        } catch (error) {
            testResults['createFolder'] = false;
            logTest('Create Folder', false, null, error);
        }

        // ========================================
        // TEST 2: Create File
        // ========================================
        try {
            console.log('\n📄 TEST 2: Creating a test file...');
            const createFileResponse = await codebolt.fs.createFile(
                testFile,
                'Hello, CodeBolt! This is a test file.',
                testFolder
            );
            testResults['createFile'] = !!createFileResponse.success;
            logTest('Create File', testResults['createFile'], {
                success: createFileResponse.success,
                filePath: createFileResponse.path
            });
        } catch (error) {
            testResults['createFile'] = false;
            logTest('Create File', false, null, error);
        }

        // ========================================
        // TEST 3: Read File
        // ========================================
        try {
            console.log('\n📖 TEST 3: Reading the test file...');
            const readFileResponse = await codebolt.fs.readFile(testFilePath);
            testResults['readFile'] = !!readFileResponse.success && !!readFileResponse.content;
            logTest('Read File', testResults['readFile'], {
                success: readFileResponse.success,
                contentLength: readFileResponse.content?.length,
                preview: readFileResponse.content?.substring(0, 50)
            });
        } catch (error) {
            testResults['readFile'] = false;
            logTest('Read File', false, null, error);
        }

        // ========================================
        // TEST 4: Update File
        // ========================================
        try {
            console.log('\n✏️ TEST 4: Updating the test file...');
            const updateFileResponse = await codebolt.fs.updateFile(
                testFile,
                testFolder,
                'Updated content: CodeBolt filesystem test!'
            );
            testResults['updateFile'] = !!updateFileResponse.success;
            logTest('Update File', testResults['updateFile'], {
                success: updateFileResponse.success,
                filePath: updateFileResponse.path
            });
        } catch (error) {
            testResults['updateFile'] = false;
            logTest('Update File', false, null, error);
        }

        // ========================================
        // TEST 5: Write to File
        // ========================================
        try {
            console.log('\n✍️ TEST 5: Writing to file using writeToFile...');
            const writeResponse = await codebolt.fs.writeToFile(
                testFilePath,
                'Content written via writeToFile method.'
            );
            testResults['writeToFile'] = !!writeResponse.success;
            logTest('Write to File', testResults['writeToFile'], {
                success: writeResponse.success
            });
        } catch (error) {
            testResults['writeToFile'] = false;
            logTest('Write to File', false, null, error);
        }

        // ========================================
        // TEST 6: List Files
        // ========================================
        try {
            console.log('\n� TEST 6: Listing files in test folder...');
            const listResponse = await codebolt.fs.listFile(testFolder, false);
            testResults['listFile'] = !!listResponse.success && !!listResponse.files;
            logTest('List Files', testResults['listFile'], {
                success: listResponse.success,
                fileCount: listResponse.files?.length,
                files: listResponse.files
            });
        } catch (error) {
            testResults['listFile'] = false;
            logTest('List Files', false, null, error);
        }

        // ========================================
        // TEST 7: List Directory
        // ========================================
        try {
            console.log('\n📂 TEST 7: Listing directory contents...');
            const listDirResponse = await codebolt.fs.listDirectory({
                path: testFolder,
                show_hidden: false,
                detailed: true,
                limit: 100
            });
            testResults['listDirectory'] = !!listDirResponse.success;
            logTest('List Directory', testResults['listDirectory'], {
                success: listDirResponse.success,
                entryCount: listDirResponse.entries?.length
            });
        } catch (error) {
            testResults['listDirectory'] = false;
            logTest('List Directory', false, null, error);
        }

        // ========================================
        // TEST 8: File Search
        // ========================================
        try {
            console.log('\n� TEST 8: Searching for files...');
            const searchResponse = await codebolt.fs.fileSearch('test-file');
            testResults['fileSearch'] = !!searchResponse.success;
            logTest('File Search', testResults['fileSearch'], {
                success: searchResponse.success,
                resultsCount: searchResponse.results?.length
            });
        } catch (error) {
            testResults['fileSearch'] = false;
            logTest('File Search', false, null, error);
        }

        // ========================================
        // TEST 9: Grep Search
        // ========================================
        try {
            console.log('\n� TEST 9: Performing grep search...');
            const grepResponse = await codebolt.fs.grepSearch(
                testFolder,
                'CodeBolt',
                '*.txt',
                undefined,
                false
            );
            testResults['grepSearch'] = !!grepResponse.success;
            logTest('Grep Search', testResults['grepSearch'], {
                success: grepResponse.success,
                matchCount: grepResponse.results?.length
            });
        } catch (error) {
            testResults['grepSearch'] = false;
            logTest('Grep Search', false, null, error);
        }

        // ========================================
        // TEST 10: Search Files
        // ========================================
        try {
            console.log('\n🔍 TEST 10: Searching files with regex...');
            const searchFilesResponse = await codebolt.fs.searchFiles(
                testFolder,
                'CodeBolt',
                '*.txt'
            );
            testResults['searchFiles'] = !!searchFilesResponse.success;
            logTest('Search Files', testResults['searchFiles'], {
                success: searchFilesResponse.success,
                resultsCount: searchFilesResponse.results?.length
            });
        } catch (error) {
            testResults['searchFiles'] = false;
            logTest('Search Files', false, null, error);
        }

        // ========================================
        // TEST 11: Read Many Files
        // ========================================
        try {
            console.log('\n📚 TEST 11: Reading multiple files...');
            const readManyResponse = await codebolt.fs.readManyFiles({
                paths: [testFolder],
                include: ['*.txt'],
                recursive: false,
                max_files: 10,
                include_metadata: true
            });
            testResults['readManyFiles'] = !!readManyResponse.success;
            logTest('Read Many Files', testResults['readManyFiles'], {
                success: readManyResponse.success,
                filesRead: readManyResponse.successfullyRead
            });
        } catch (error) {
            testResults['readManyFiles'] = false;
            logTest('Read Many Files', false, null, error);
        }

        // ========================================
        // TEST 12: List Code Definition Names
        // ========================================
        try {
            console.log('\n🏷️ TEST 12: Listing code definition names...');
            const codeDefsResponse = await codebolt.fs.listCodeDefinitionNames(testFolder);
            testResults['listCodeDefinitionNames'] = !!codeDefsResponse.success;
            logTest('List Code Definition Names', testResults['listCodeDefinitionNames'], {
                success: codeDefsResponse.success,
                definitionsCount: codeDefsResponse.definitions?.length
            });
        } catch (error) {
            testResults['listCodeDefinitionNames'] = false;
            logTest('List Code Definition Names', false, null, error);
        }

        // ========================================
        // TEST 13: Edit File with Diff
        // ========================================
        try {
            console.log('\n🔧 TEST 13: Editing file with diff...');
            const editResponse = await codebolt.fs.editFileWithDiff(
                testFilePath,
                'Add new line at the end',
                'test-diff-1',
                'Add a new line to the file'
            );
            testResults['editFileWithDiff'] = !!editResponse.success;
            logTest('Edit File with Diff', testResults['editFileWithDiff'], {
                success: editResponse.success,
                result: editResponse.result
            });
        } catch (error) {
            testResults['editFileWithDiff'] = false;
            logTest('Edit File with Diff', false, null, error);
        }

        // ========================================
        // TEST 14: Delete File
        // ========================================
        try {
            console.log('\n🗑️ TEST 14: Deleting the test file...');
            const deleteFileResponse = await codebolt.fs.deleteFile(testFile, testFolder);
            testResults['deleteFile'] = !!deleteFileResponse.success;
            logTest('Delete File', testResults['deleteFile'], {
                success: deleteFileResponse.success,
                deletedPath: deleteFileResponse.path
            });
        } catch (error) {
            testResults['deleteFile'] = false;
            logTest('Delete File', false, null, error);
        }

        // ========================================
        // TEST 15: Delete Folder
        // ========================================
        try {
            console.log('\n�️ TEST 15: Deleting the test folder...');
            const deleteFolderResponse = await codebolt.fs.deleteFolder('codebolt-fs-test', '/tmp');
            testResults['deleteFolder'] = !!deleteFolderResponse.success;
            logTest('Delete Folder', testResults['deleteFolder'], {
                success: deleteFolderResponse.success,
                deletedPath: deleteFolderResponse.path
            });
        } catch (error) {
            testResults['deleteFolder'] = false;
            logTest('Delete Folder', false, null, error);
        }

        // ========================================
        // SUMMARY
        // ========================================
        const totalTests = Object.keys(testResults).length;
        const passedTests = Object.values(testResults).filter(result => result).length;
        const failedTests = totalTests - passedTests;

        const summaryMessage = `
📊 Filesystem Module Test Suite Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Tests: ${totalTests}
✅ Passed: ${passedTests}
❌ Failed: ${failedTests}
Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test Results:
${Object.entries(testResults).map(([test, result]) => `${result ? '✅' : '❌'} ${test}`).join('\n')}
        `;

        console.log(summaryMessage);
        codebolt.chat.sendMessage(summaryMessage, {});

        return {
            success: true,
            message: 'Filesystem module test suite completed',
            results: testResults,
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                successRate: `${((passedTests / totalTests) * 100).toFixed(2)}%`
            }
        };

    } catch (error) {
        console.error('❌ Test suite failed with error:', error);
        const errorMessage = `Test suite failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        codebolt.chat.sendMessage(errorMessage, {});

        return {
            success: false,
            message: errorMessage,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
});



