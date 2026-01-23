import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    console.log("----------------------------------------------------------------");
    console.log("Starting FS Module Tests");
    console.log("----------------------------------------------------------------");

    const TEST_ROOT = process.cwd(); // Or a specific scalable path if needed
    const TEST_FOLDER_NAME = "test_fs_audit_agent";
    const TEST_FILE_NAME = "test_file.txt";
    const TEST_FILE_CONTENT = "Hello CodeBolt FS!";
    const TEST_FILE_CONTENT_UPDATED = "Hello CodeBolt FS Updated!";
    const SEARCH_QUERY = "CodeBolt";

    try {
        // 1. Create Folder
        console.log(`\n[Test 1] Creating folder: ${TEST_FOLDER_NAME} at ${TEST_ROOT}`);
        const createFolderRes = await codebolt.fs.createFolder(TEST_FOLDER_NAME, TEST_ROOT);
        console.log("Result:", createFolderRes);

        const TEST_FOLDER_PATH = `${TEST_ROOT}/${TEST_FOLDER_NAME}`;
        const TEST_FILE_PATH = `${TEST_FOLDER_PATH}/${TEST_FILE_NAME}`;

        // 2. Create File
        console.log(`\n[Test 2] Creating file: ${TEST_FILE_NAME} at ${TEST_FOLDER_PATH}`);
        const createFileRes = await codebolt.fs.createFile(TEST_FILE_NAME, TEST_FILE_CONTENT, TEST_FOLDER_PATH);
        console.log("Result:", createFileRes);

        // 3. Read File
        console.log(`\n[Test 3] Reading file: ${TEST_FILE_PATH}`);
        const readFileRes = await codebolt.fs.readFile(TEST_FILE_PATH);
        console.log("Result:", readFileRes);

        // 4. Update File
        console.log(`\n[Test 4] Updating file: ${TEST_FILE_NAME} at ${TEST_FOLDER_PATH}`);
        const updateFileRes = await codebolt.fs.updateFile(TEST_FILE_NAME, TEST_FOLDER_PATH, TEST_FILE_CONTENT_UPDATED);
        console.log("Result:", updateFileRes);

        // 5. Read File (Verify Update)
        console.log(`\n[Test 5] Reading file to verify update: ${TEST_FILE_PATH}`);
        const readFileRes2 = await codebolt.fs.readFile(TEST_FILE_PATH);
        console.log("Result:", readFileRes2);

        // 6. List Files
        console.log(`\n[Test 6] Listing files in: ${TEST_FOLDER_PATH}`);
        const listFileRes = await codebolt.fs.listFile(TEST_FOLDER_PATH, false);
        console.log("Result:", listFileRes);

        // 7. List Directory (Advanced)
        console.log(`\n[Test 7] Listing directory (advanced) in: ${TEST_FOLDER_PATH}`);
        const listDirRes = await codebolt.fs.listDirectory({ path: TEST_FOLDER_PATH, detailed: true });
        console.log("Result:", listDirRes);

        // 8. Write To File (Direct)
        // Note: writeToFile usually takes relative path in some contexts, strictly following arg definitions
        console.log(`\n[Test 8] Write to file (direct): ${TEST_FILE_PATH}`);
        const writeToFileRes = await codebolt.fs.writeToFile(TEST_FILE_PATH, "Direct Write Content");
        console.log("Result:", writeToFileRes);

        // 9. Grep Search
        console.log(`\n[Test 9] Grep Search for '${SEARCH_QUERY}' in ${TEST_FOLDER_PATH}`);
        const grepRes = await codebolt.fs.grepSearch(TEST_FOLDER_PATH, "CodeBolt");
        console.log("Result:", grepRes);

        // 10. File Search
        console.log(`\n[Test 10] File Search for '${TEST_FILE_NAME}'`);
        const fileSearchRes = await codebolt.fs.fileSearch(TEST_FILE_NAME);
        console.log("Result:", fileSearchRes);

        // 11. Read Many Files
        console.log(`\n[Test 11] Read Many Files: ${TEST_FILE_PATH}`);
        const readManyRes = await codebolt.fs.readManyFiles({ paths: [TEST_FILE_PATH] });
        console.log("Result:", readManyRes);

        // 12. List Code Definition Names
        console.log(`\n[Test 12] List Code Definitions in: ${TEST_FILE_PATH}`);
        const listCodeDefsRes = await codebolt.fs.listCodeDefinitionNames(TEST_FILE_PATH);
        console.log("Result:", listCodeDefsRes);

        // 13. Search Files (Regex)
        console.log(`\n[Test 13] Search Files (Regex) in ${TEST_FOLDER_PATH}`);
        const searchFilesRes = await codebolt.fs.searchFiles(TEST_FOLDER_PATH, ".*", "*.txt");
        console.log("Result:", searchFilesRes);

        // 14. Delete File
        console.log(`\n[Test 14] Deleting file: ${TEST_FILE_NAME} at ${TEST_FOLDER_PATH}`);
        const deleteFileRes = await codebolt.fs.deleteFile(TEST_FILE_NAME, TEST_FOLDER_PATH);
        console.log("Result:", deleteFileRes);

        // 15. Delete Folder
        console.log(`\n[Test 15] Deleting folder: ${TEST_FOLDER_NAME} at ${TEST_ROOT}`);
        const deleteFolderRes = await codebolt.fs.deleteFolder(TEST_FOLDER_NAME, TEST_ROOT);
        console.log("Result:", deleteFolderRes);


        console.log("----------------------------------------------------------------");
        console.log("FS Module Tests Completed");
        console.log("----------------------------------------------------------------");

    } catch (error) {
        console.error("!!!! FS TEST FAILED !!!!");
        console.error(error);
    }
});



