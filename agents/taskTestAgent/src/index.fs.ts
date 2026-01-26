import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    await codebolt.chat.sendMessage("----------------------------------------------------------------");
    await codebolt.chat.sendMessage("Starting FS Module Tests");
    await codebolt.chat.sendMessage("----------------------------------------------------------------");

    const TEST_ROOT = "/Users/ravirawat/Documents/cbtest/quaint-coffee"; // Or a specific scalable path if needed
    const TEST_FOLDER_NAME = "test_fs_audit_agent";
    const TEST_FILE_NAME = "test_file.txt";
    const TEST_FILE_CONTENT = "Hello CodeBolt FS!";
    const TEST_FILE_CONTENT_UPDATED = "Hello CodeBolt FS Updated!";
    const SEARCH_QUERY = "CodeBolt";

    try {
        // 1. Create Folder
        await codebolt.chat.sendMessage(`\n[Test 1] Creating folder: ${TEST_FOLDER_NAME} at ${TEST_ROOT}`);
        const createFolderRes = await codebolt.fs.createFolder(TEST_FOLDER_NAME, TEST_ROOT);
        await codebolt.chat.sendMessage("Result: " + JSON.stringify(createFolderRes));

        const TEST_FOLDER_PATH = `${TEST_ROOT}/${TEST_FOLDER_NAME}`;
        const TEST_FILE_PATH = `${TEST_FOLDER_PATH}/${TEST_FILE_NAME}`;

        // 2. Create File
        await codebolt.chat.sendMessage(`\n[Test 2] Creating file: ${TEST_FILE_NAME} at ${TEST_FOLDER_PATH}`);
        const createFileRes = await codebolt.fs.createFile(TEST_FILE_NAME, TEST_FILE_CONTENT, TEST_FOLDER_PATH);
        await codebolt.chat.sendMessage("Result: " + JSON.stringify(createFileRes));

        // 3. Read File
        await codebolt.chat.sendMessage(`\n[Test 3] Reading file: ${TEST_FILE_PATH}`);
        const readFileRes = await codebolt.fs.readFile(TEST_FILE_PATH);
        await codebolt.chat.sendMessage("Result: " + JSON.stringify(readFileRes));

        // 4. Update File
        await codebolt.chat.sendMessage(`\n[Test 4] Updating file: ${TEST_FILE_NAME} at ${TEST_FOLDER_PATH}`);
        const updateFileRes = await codebolt.fs.updateFile(TEST_FILE_NAME, TEST_FOLDER_PATH, TEST_FILE_CONTENT_UPDATED);
        await codebolt.chat.sendMessage("Result: " + JSON.stringify(updateFileRes));

        // 5. Read File (Verify Update)
        await codebolt.chat.sendMessage(`\n[Test 5] Reading file to verify update: ${TEST_FILE_PATH}`);
        const readFileRes2 = await codebolt.fs.readFile(TEST_FILE_PATH);
        await codebolt.chat.sendMessage("Result: " + JSON.stringify(readFileRes2));

        // 6. List Files
        await codebolt.chat.sendMessage(`\n[Test 6] Listing files in: ${TEST_FOLDER_PATH}`);
        const listFileRes = await codebolt.fs.listFile(TEST_FOLDER_PATH, false);
        await codebolt.chat.sendMessage("Result: " + JSON.stringify(listFileRes));

        // 7. List Directory (Advanced)
        await codebolt.chat.sendMessage(`\n[Test 7] Listing directory (advanced) in: ${TEST_FOLDER_PATH}`);
        const listDirRes = await codebolt.fs.listDirectory({ path: TEST_FOLDER_PATH, detailed: true });
        await codebolt.chat.sendMessage("Result: " + JSON.stringify(listDirRes));

        // 8. Write To File(Direct)
        // Note: writeToFile usually takes relative path in some contexts, strictly following arg definitions
        await codebolt.chat.sendMessage(`\n[Test 8] Write to file (direct): ${TEST_FILE_PATH}`);
        const writeToFileRes = await codebolt.fs.writeToFile(TEST_FILE_PATH, "Direct Write Content");
        await codebolt.chat.sendMessage("Result: " + JSON.stringify(writeToFileRes));

        // 9. Grep Search
        await codebolt.chat.sendMessage(`\n[Test 9] Grep Search for '${SEARCH_QUERY}' in ${TEST_FOLDER_PATH}`);
        const grepRes = await codebolt.fs.grepSearch(TEST_FOLDER_PATH, "CodeBolt");
        await codebolt.chat.sendMessage("Result: " + JSON.stringify(grepRes));

        // 10. File Search
        await codebolt.chat.sendMessage(`\n[Test 10] File Search for '${TEST_FILE_NAME}'`);
        const fileSearchRes = await codebolt.fs.fileSearch(TEST_FILE_NAME);
        await codebolt.chat.sendMessage("Result: " + JSON.stringify(fileSearchRes));

        // 11. Read Many Files
        await codebolt.chat.sendMessage(`\n[Test 11] Read Many Files: ${TEST_FILE_PATH}`);
        const readManyRes = await codebolt.fs.readManyFiles({ paths: [TEST_FILE_PATH] });
        await codebolt.chat.sendMessage("Result: " + JSON.stringify(readManyRes));

        // 12. List Code Definition Names
        await codebolt.chat.sendMessage(`\n[Test 12] List Code Definitions in: ${TEST_FILE_PATH}`);
        const listCodeDefsRes = await codebolt.fs.listCodeDefinitionNames(TEST_FILE_PATH);
        await codebolt.chat.sendMessage("Result: " + JSON.stringify(listCodeDefsRes));

        // 13. Search Files (Regex)
        await codebolt.chat.sendMessage(`\n[Test 13] Search Files (Regex) in ${TEST_FOLDER_PATH}`);
        const searchFilesRes = await codebolt.fs.searchFiles(TEST_FOLDER_PATH, ".*", "*.txt");
        await codebolt.chat.sendMessage("Result: " + JSON.stringify(searchFilesRes));

        // 14. Delete File
        await codebolt.chat.sendMessage(`\n[Test 14] Deleting file: ${TEST_FILE_NAME} at ${TEST_FOLDER_PATH}`);
        const deleteFileRes = await codebolt.fs.deleteFile(TEST_FILE_NAME, TEST_FOLDER_PATH);
        await codebolt.chat.sendMessage("Result: " + JSON.stringify(deleteFileRes));

        // 15. Delete Folder
        await codebolt.chat.sendMessage(`\n[Test 15] Deleting folder: ${TEST_FOLDER_NAME} at ${TEST_ROOT}`);
        const deleteFolderRes = await codebolt.fs.deleteFolder(TEST_FOLDER_NAME, TEST_ROOT);
        await codebolt.chat.sendMessage("Result: " + JSON.stringify(deleteFolderRes));


        await codebolt.chat.sendMessage("----------------------------------------------------------------");
        await codebolt.chat.sendMessage("FS Module Tests Completed");
        await codebolt.chat.sendMessage("----------------------------------------------------------------");

    } catch (error) {
        await codebolt.chat.sendMessage("!!!! FS TEST FAILED !!!!");
        await codebolt.chat.sendMessage(JSON.stringify(error));
    }
});



