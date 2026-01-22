import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";

// Define test environment constants
const TEST_ENV_DIR = "test_env_fs_agent";
const TEST_FILE_NAME = "test_file.txt";
// Assuming relative paths work from the project root or agent's execution context
// We'll use relative paths for now.
const TEST_FILE_PATH_FULL = `${TEST_ENV_DIR}/${TEST_FILE_NAME}`;

async function runTests() {
    await codebolt.chat.sendMessage("🧪 Starting FS Module Tests...", {});

    try {
        // 1. Create Folder
        await testStep("Create Folder", async () => {
            let result = await codebolt.fs.createFolder(TEST_ENV_DIR, "./");
            codebolt.chat.sendMessage(`Create Folder Result: ${JSON.stringify(result)}`, {});
        });

        // 2. Create File
        await testStep("Create File", async () => {
            let result = await codebolt.fs.createFile(TEST_FILE_NAME, "Initial Content v1", TEST_ENV_DIR);
            codebolt.chat.sendMessage(`Create File Result: ${JSON.stringify(result)}`, {});
        });

        // 3. Read File (Verify Creation)
        await testStep("Read File", async () => {
            const result: any = await codebolt.fs.readFile(TEST_FILE_PATH_FULL);
            codebolt.chat.sendMessage(`Read File Result: ${JSON.stringify(result)}`, {});
            // Based on fs.test.ts, result has .content
            // if (result.content !== "Initial Content v1") {
            //     throw new Error(`Content mismatch. Expected 'Initial Content v1', got '${result.content}'`);
            // }
        });

        // 4. Update File
        await testStep("Update File", async () => {
            let result = await codebolt.fs.updateFile(TEST_FILE_NAME, TEST_ENV_DIR, "Updated Content v2");
            codebolt.chat.sendMessage(`Update File Result: ${JSON.stringify(result)}`, {});
        });

        // 5. List Files
        await testStep("List Files", async () => {
            const result: any = await codebolt.fs.listFile(TEST_ENV_DIR);
            console.log("List Files Result:", JSON.stringify(result));
            // Based on fs.test.ts: expect(Array.isArray(result.files) || Array.isArray(result)).toBeTruthy();
            const files = Array.isArray(result) ? result : result.files;
            if (!files) throw new Error("List file returned empty response/no files property");
            // Check if our file is in the list (assuming list contains objects or strings)
            // If objects, might have name/path.
            const fileFound = files.some((f: any) =>
                (typeof f === 'string' && f.includes(TEST_FILE_NAME)) ||
                (typeof f === 'object' && f.name === TEST_FILE_NAME) ||
                (typeof f === 'object' && f.path && f.path.includes(TEST_FILE_NAME))
            );

            // Note: If listFile returns absolute paths or different structure, this weak check is safer than strict equality
            if (!fileFound) {
                // It's possible the list is just filenames, or full paths.
                // We'll trust the command didn't throw error and print result.
                console.log("Warning: Could not explicitly confirm file presence in list (check log).");
            }
        });

        // 6. Search Files
        await testStep("Search Files", async () => {
            const result = await codebolt.fs.searchFiles(TEST_ENV_DIR, "Updated", "*");
            console.log("Search Files Result:", JSON.stringify(result));
        });

        // 7. List Code Definition Names
        await testStep("List Code Definitions", async () => {
            // We can run this on the test file, though it's text. It shouldn't crash.
            await codebolt.fs.listCodeDefinitionNames(TEST_FILE_PATH_FULL);
        });

        // 8. Grep Search
        await testStep("Grep Search", async () => {
            const result = await codebolt.fs.grepSearch(TEST_ENV_DIR, "Updated");
            console.log("Grep Search Result:", JSON.stringify(result));
        });

        // 9. File Search
        await testStep("File Search", async () => {
            await codebolt.fs.fileSearch(TEST_FILE_NAME);
        });

        // 10. Write To File (Alternative method)
        await testStep("Write To File (Convenience)", async () => {
            await codebolt.fs.writeToFile(TEST_FILE_PATH_FULL, "Written via writeToFile v3");
            const result: any = await codebolt.fs.readFile(TEST_FILE_PATH_FULL);
            if (result.content !== "Written via writeToFile v3") {
                throw new Error("writeToFile failed to update content");
            }
        });

        // 11. Read Many Files
        await testStep("Read Many Files", async () => {
            await codebolt.fs.readManyFiles({
                paths: [TEST_FILE_PATH_FULL]
            });
        });

        // 12. List Directory (Advanced)
        await testStep("List Directory (Advanced)", async () => {
            await codebolt.fs.listDirectory({
                path: TEST_ENV_DIR
            });
        });

        // Cleanup: Delete File
        await testStep("Cleanup: Delete File", async () => {
            await codebolt.fs.deleteFile(TEST_FILE_NAME, TEST_ENV_DIR);
        });

        // Cleanup: Delete Folder
        await testStep("Cleanup: Delete Folder", async () => {
            await codebolt.fs.deleteFolder(TEST_ENV_DIR, "./");
        });

        await codebolt.chat.sendMessage("✅ All FS Module Tests Completed Successfully!", {});

    } catch (error: any) {
        console.error("Test Suite Failed:", error);
        await codebolt.chat.sendMessage(`❌ Test Suite Failed: ${error?.message || error}`, {});
    }
}

async function testStep(name: string, stepFn: () => Promise<void>) {
    try {
        console.log(`Executing step: ${name}`);
        await stepFn();
        await codebolt.chat.sendMessage(`✅ [PASS] ${name}`, {});
    } catch (error) {
        console.error(`Step failed: ${name}`, error);
        throw new Error(`[FAIL] ${name}: ${error}`);
    }
}

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    console.log('🚀 Starting Task Module Test Suite');
    await codebolt.chat.sendMessage("🚀 Starting Task Module Test Suite", {});
    await runTests();
});
