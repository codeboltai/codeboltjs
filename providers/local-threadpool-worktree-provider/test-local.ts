/**
 * Local test file for GitWorktreeProviderService
 * This allows testing provider methods directly, bypassing socket communication.
 * 
 * Usage: 
 *   pnpm test:local         - Run all tests (worktree only)
 *   pnpm test:interactive   - Create worktree and keep it
 *   pnpm test:server        - Test agent server connection and messages
 */

import { GitWorktreeProviderService } from './dist/services/GitWorktreeProviderService.js';
import { startAgentServer, stopAgentServer, isPortInUse, testServerHealth } from './dist/utils/agentServer.js';
import type { ProviderInitVars, RawMessageForAgent } from '@codebolt/types/provider';
import type { ChildProcess } from 'child_process';
import WebSocket from 'ws';

// Configuration
const TEST_CONFIG = {
    // Change this to your test project path (a git repository)
    projectPath: process.env.TEST_PROJECT_PATH || '/Users/ravirawat/Documents/cbtest/Main-Swarm-test',
    environmentName: process.env.TEST_ENV_NAME || `test-env-${Date.now()}`,
    agentServerPort: parseInt(process.env.AGENT_SERVER_PORT || '3005'), // Use a different port for testing
    agentServerHost: 'localhost',
};

// Simple logger
const logger = {
    log: (...args: any[]) => console.log('[TEST]', ...args),
    error: (...args: any[]) => console.error('[ERROR]', ...args),
    warn: (...args: any[]) => console.warn('[WARN]', ...args),
    info: (...args: any[]) => console.log('[INFO]', ...args),
};

/**
 * Create a GitWorktreeProviderService instance for local testing
 */
function createProviderService() {
    return new GitWorktreeProviderService({
        agentServerPort: TEST_CONFIG.agentServerPort,
        agentServerHost: TEST_CONFIG.agentServerHost,
        worktreeBaseDir: '.worktree',
        timeouts: {
            agentServerStartup: 30000,
            wsConnection: 10000,
            gitOperations: 30000,
            cleanup: 15000,
        },
    });
}

/**
 * Test worktree creation
 */
async function testCreateWorktree(provider: GitWorktreeProviderService) {
    logger.log('=== Testing Worktree Creation ===');

    try {
        const worktreeInfo = await provider.createWorktree(
            TEST_CONFIG.projectPath,
            TEST_CONFIG.environmentName
        );

        logger.log('Worktree created successfully:');
        logger.log('  Path:', worktreeInfo.path);
        logger.log('  Branch:', worktreeInfo.branch);
        logger.log('  IsCreated:', worktreeInfo.isCreated);

        return worktreeInfo;
    } catch (error) {
        logger.error('Failed to create worktree:', error);
        throw error;
    }
}

/**
 * Test getting project structure
 */
async function testGetProject(provider: GitWorktreeProviderService, parentId: string = 'root') {
    logger.log('=== Testing Get Project Structure ===');
    logger.log('  ParentId:', parentId);

    try {
        const children = await provider.onGetProject(parentId);

        logger.log(`Found ${children.length} items:`);
        children.slice(0, 10).forEach((item: any) => {
            logger.log(`  - ${item.isFolder ? '[DIR]' : '[FILE]'} ${item.name}`);
        });

        if (children.length > 10) {
            logger.log(`  ... and ${children.length - 10} more items`);
        }

        return children;
    } catch (error) {
        logger.error('Failed to get project structure:', error);
        throw error;
    }
}

/**
 * Test reading a file
 */
async function testReadFile(provider: GitWorktreeProviderService, filePath: string) {
    logger.log('=== Testing Read File ===');
    logger.log('  FilePath:', filePath);

    try {
        const content = await provider.onReadFile(filePath);

        logger.log(`File content (first 200 chars):`);
        logger.log(content.substring(0, 200) + (content.length > 200 ? '...' : ''));

        return content;
    } catch (error) {
        logger.error('Failed to read file:', error);
        throw error;
    }
}

/**
 * Test writing a file
 */
async function testWriteFile(provider: GitWorktreeProviderService, filePath: string, content: string) {
    logger.log('=== Testing Write File ===');
    logger.log('  FilePath:', filePath);

    try {
        await provider.onWriteFile(filePath, content);
        logger.log('File written successfully');

        // Verify by reading it back
        const readContent = await provider.onReadFile(filePath);
        if (readContent === content) {
            logger.log('File content verified successfully');
        } else {
            logger.warn('File content mismatch!');
        }
    } catch (error) {
        logger.error('Failed to write file:', error);
        throw error;
    }
}

/**
 * Test getting diff files
 */
async function testGetDiffFiles(provider: GitWorktreeProviderService) {
    logger.log('=== Testing Get Diff Files ===');

    try {
        const diffResult = await provider.onGetDiffFiles();

        logger.log('Diff result:');
        logger.log('  Files:', JSON.stringify(diffResult, null, 2).substring(0, 500));

        return diffResult;
    } catch (error) {
        logger.error('Failed to get diff files:', error);
        throw error;
    }
}

/**
 * Test worktree removal
 */
async function testRemoveWorktree(provider: GitWorktreeProviderService) {
    logger.log('=== Testing Worktree Removal ===');

    try {
        const result = await provider.removeWorktree(TEST_CONFIG.projectPath);
        logger.log('Worktree removal result:', result);
        return result;
    } catch (error) {
        logger.error('Failed to remove worktree:', error);
        throw error;
    }
}

// ================================
// Agent Server Tests
// ================================

/**
 * Test starting the agent server
 */
async function testStartAgentServer(): Promise<ChildProcess> {
    logger.log('=== Testing Agent Server Start ===');
    logger.log('  Port:', TEST_CONFIG.agentServerPort);

    try {
        // Check if port is already in use
        const portInUse = await isPortInUse({ port: TEST_CONFIG.agentServerPort });
        if (portInUse) {
            logger.warn(`Port ${TEST_CONFIG.agentServerPort} is already in use!`);
            throw new Error(`Port ${TEST_CONFIG.agentServerPort} is already in use`);
        }

        const processRef = await startAgentServer({
            logger,
            port: TEST_CONFIG.agentServerPort
        });

        logger.log('Agent server started successfully');
        logger.log('  PID:', processRef.pid);

        // Wait a bit for server to fully initialize
        await new Promise(resolve => setTimeout(resolve, 2000));

        return processRef;
    } catch (error) {
        logger.error('Failed to start agent server:', error);
        throw error;
    }
}

/**
 * Test agent server health using HTTP endpoint (avoids WebSocket disconnect noise)
 */
async function testAgentServerHealth() {
    logger.log('=== Testing Agent Server Health ===');

    try {
        const healthUrl = `http://${TEST_CONFIG.agentServerHost}:${TEST_CONFIG.agentServerPort}/health`;
        logger.log('  Checking:', healthUrl);

        const response = await fetch(healthUrl);
        const isHealthy = response.ok;

        logger.log('Server health check result:', isHealthy);
        logger.log('  Status:', response.status, response.statusText);

        if (!isHealthy) {
            throw new Error(`Agent server is not healthy: ${response.status}`);
        }

        return isHealthy;
    } catch (error) {
        logger.error('Health check failed:', error);
        throw error;
    }
}

/**
 * Test WebSocket connection to agent server
 */
async function testWebSocketConnection(): Promise<WebSocket> {
    logger.log('=== Testing WebSocket Connection ===');

    return new Promise((resolve, reject) => {
        const serverUrl = `ws://${TEST_CONFIG.agentServerHost}:${TEST_CONFIG.agentServerPort}`;
        const queryParams = new URLSearchParams({
            clientType: 'app',
            appId: `test-provider-${TEST_CONFIG.environmentName}`,
            projectName: TEST_CONFIG.environmentName,
            currentProject: TEST_CONFIG.projectPath,
        });

        const wsUrl = `${serverUrl}?${queryParams.toString()}`;
        logger.log('  Connecting to:', wsUrl);

        const ws = new WebSocket(wsUrl);

        const timeout = setTimeout(() => {
            ws.close();
            reject(new Error('WebSocket connection timeout'));
        }, 10000);

        ws.on('open', () => {
            clearTimeout(timeout);
            logger.log('WebSocket connected successfully');
            resolve(ws);
        });

        ws.on('error', (error) => {
            clearTimeout(timeout);
            logger.error('WebSocket connection error:', error);
            reject(error);
        });

        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                logger.log('Received message:', JSON.stringify(message).substring(0, 200));
            } catch {
                logger.log('Received raw message:', data.toString().substring(0, 200));
            }
        });
    });
}

/**
 * Test sending a message to the agent server
 */
async function testSendMessage(ws: WebSocket, message: any): Promise<void> {
    logger.log('=== Testing Send Message ===');
    logger.log('  Message type:', message.type);

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Send message timeout'));
        }, 5000);

        try {
            const messageStr = JSON.stringify(message);
            logger.log('  Sending:', messageStr.substring(0, 200));

            ws.send(messageStr, (error) => {
                clearTimeout(timeout);
                if (error) {
                    logger.error('Failed to send message:', error);
                    reject(error);
                } else {
                    logger.log('Message sent successfully');
                    resolve();
                }
            });
        } catch (error) {
            clearTimeout(timeout);
            logger.error('Error sending message:', error);
            reject(error);
        }
    });
}

/**
 * Test receiving messages from the agent server
 */
async function testReceiveMessages(ws: WebSocket, waitTime: number = 5000): Promise<any[]> {
    logger.log('=== Testing Receive Messages ===');
    logger.log(`  Waiting ${waitTime}ms for messages...`);

    return new Promise((resolve) => {
        const messages: any[] = [];

        const messageHandler = (data: any) => {
            try {
                const message = JSON.parse(data.toString());
                messages.push(message);
                logger.log('  Received:', message.type || 'unknown', JSON.stringify(message).substring(0, 100));
            } catch {
                messages.push({ raw: data.toString() });
                logger.log('  Received raw:', data.toString().substring(0, 100));
            }
        };

        ws.on('message', messageHandler);

        setTimeout(() => {
            ws.off('message', messageHandler);
            logger.log(`Received ${messages.length} messages`);
            resolve(messages);
        }, waitTime);
    });
}

/**
 * Test full agent server flow
 */
async function runAgentServerTests() {
    logger.log('========================================');
    logger.log('Starting Agent Server Tests');
    logger.log('========================================');
    logger.log('Port:', TEST_CONFIG.agentServerPort);
    logger.log('Host:', TEST_CONFIG.agentServerHost);
    logger.log('');

    let agentServerProcess: ChildProcess | null = null;
    let ws: WebSocket | null = null;

    try {
        // Test 1: Start agent server
        agentServerProcess = await testStartAgentServer();

        // Test 2: Check server health
        await testAgentServerHealth();

        // Test 3: Connect via WebSocket
        ws = await testWebSocketConnection();

        // Test 4: Send a ping message
        await testSendMessage(ws, {
            type: 'ping',
            timestamp: Date.now(),
        });

        // Test 5: Send a test message (agent-like message)
        await testSendMessage(ws, {
            type: 'agentMessage',
            action: 'chat',
            data: {
                message: 'Hello from local test!',
                timestamp: new Date().toISOString(),
            },
            messageId: `test-msg-${Date.now()}`,
        });

        // Test 6: Listen for responses
        const messages = await testReceiveMessages(ws, 3000);
        logger.log('');
        logger.log('Messages received summary:', messages.length, 'messages');

        logger.log('');
        logger.log('========================================');
        logger.log('Agent Server Tests Completed!');
        logger.log('========================================');

    } catch (error) {
        logger.error('Agent server test failed:', error);
        throw error;
    } finally {
        // Cleanup
        if (ws) {
            logger.log('Closing WebSocket connection...');
            ws.close();
        }

        if (agentServerProcess) {
            logger.log('Stopping agent server...');
            await stopAgentServer({ logger, processRef: agentServerProcess });
        }
    }
}

/**
 * Combined test: Worktree + Agent Server
 */
async function runFullProviderTests() {
    logger.log('========================================');
    logger.log('Starting Full Provider Tests');
    logger.log('========================================');
    logger.log('Project Path:', TEST_CONFIG.projectPath);
    logger.log('Environment:', TEST_CONFIG.environmentName);
    logger.log('Agent Server Port:', TEST_CONFIG.agentServerPort);
    logger.log('');

    const provider = createProviderService();
    let agentServerProcess: ChildProcess | null = null;
    let ws: WebSocket | null = null;

    try {
        // Phase 1: Start Agent Server
        logger.log('\n--- Phase 1: Agent Server Setup ---');
        agentServerProcess = await testStartAgentServer();
        await testAgentServerHealth();

        // Phase 2: Create Worktree
        logger.log('\n--- Phase 2: Worktree Setup ---');
        const worktreeInfo = await testCreateWorktree(provider);

        // Phase 3: Connect to Agent Server
        logger.log('\n--- Phase 3: WebSocket Connection ---');
        ws = await testWebSocketConnection();

        // Phase 4: Test file operations with notifications
        logger.log('\n--- Phase 4: File Operations ---');
        const testFilePath = 'test-file-from-full-test.txt';
        await testWriteFile(provider, testFilePath, `Test content created at ${new Date().toISOString()}`);

        // Send notification about file change
        await testSendMessage(ws, {
            type: 'notification',
            action: 'fileChanged',
            data: {
                path: testFilePath,
                operation: 'create',
                worktreePath: worktreeInfo.path,
            },
        });

        // Phase 5: Get diff and notify
        logger.log('\n--- Phase 5: Git Diff ---');
        const diff = await testGetDiffFiles(provider);

        await testSendMessage(ws, {
            type: 'notification',
            action: 'diffUpdated',
            data: diff,
        });

        // Phase 6: Listen for any responses
        logger.log('\n--- Phase 6: Listening for Responses ---');
        await testReceiveMessages(ws, 2000);

        // Cleanup
        logger.log('\n--- Phase 7: Cleanup ---');
        await provider.onDeleteFile(testFilePath);
        await testRemoveWorktree(provider);

        logger.log('');
        logger.log('========================================');
        logger.log('Full Provider Tests Completed!');
        logger.log('========================================');

    } catch (error) {
        logger.error('Full provider test failed:', error);

        // Attempt cleanup
        try {
            await testRemoveWorktree(provider);
        } catch {
            logger.warn('Worktree cleanup failed');
        }

        throw error;
    } finally {
        if (ws) {
            ws.close();
        }
        if (agentServerProcess) {
            await stopAgentServer({ logger, processRef: agentServerProcess });
        }
    }
}

/**
 * Run all tests
 */
async function runAllTests() {
    logger.log('========================================');
    logger.log('Starting Local Provider Tests');
    logger.log('========================================');
    logger.log('Project Path:', TEST_CONFIG.projectPath);
    logger.log('Environment Name:', TEST_CONFIG.environmentName);
    logger.log('');

    const provider = createProviderService();

    try {
        // Test 1: Create worktree
        await testCreateWorktree(provider);

        // Test 2: Get project structure (root)
        const rootItems = await testGetProject(provider, 'root');

        // Test 3: Get project structure (subdirectory, if exists)
        const srcDir = rootItems.find((item: any) => item.name === 'src' && item.isFolder);
        if (srcDir) {
            await testGetProject(provider, srcDir.id);
        }

        // Test 4: Read a file (package.json usually exists)
        try {
            await testReadFile(provider, 'package.json');
        } catch {
            logger.warn('package.json not found, skipping read test');
        }

        // Test 5: Write a test file
        const testFilePath = 'test-file-from-local-test.txt';
        await testWriteFile(provider, testFilePath, `Test content created at ${new Date().toISOString()}`);

        // Test 6: Get diff files (after writing)
        await testGetDiffFiles(provider);

        // Test 7: Delete the test file
        logger.log('=== Cleaning up test file ===');
        await provider.onDeleteFile(testFilePath);
        logger.log('Test file deleted');

        // Test 8: Remove worktree
        await testRemoveWorktree(provider);

        logger.log('');
        logger.log('========================================');
        logger.log('All tests completed successfully!');
        logger.log('========================================');

    } catch (error) {
        logger.error('Test suite failed:', error);

        // Attempt cleanup
        try {
            await testRemoveWorktree(provider);
        } catch (cleanupError) {
            logger.warn('Cleanup failed:', cleanupError);
        }

        process.exit(1);
    }
}

/**
 * Run a specific test interactively
 * You can call individual test functions here
 */
async function runInteractive() {
    const provider = createProviderService();

    // Customize your test here:
    // Example: Just create worktree and explore

    try {
        await testCreateWorktree(provider);

        // Keep the worktree for manual inspection
        logger.log('');
        logger.log('Worktree created. You can now manually inspect it.');
        logger.log('Worktree info:', provider.getWorktreeInfo());

        // Uncomment to clean up:
        // await testRemoveWorktree(provider);

    } catch (error) {
        logger.error('Interactive test failed:', error);
        process.exit(1);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const mode = args[0] || 'all';

logger.log('Mode:', mode);
logger.log('');

switch (mode) {
    case 'interactive':
        runInteractive().catch(console.error);
        break;
    case 'server':
        runAgentServerTests().catch((error) => {
            console.error('Agent server tests failed:', error);
            process.exit(1);
        });
        break;
    case 'full':
        runFullProviderTests().catch((error) => {
            console.error('Full provider tests failed:', error);
            process.exit(1);
        });
        break;
    default:
        runAllTests().catch(console.error);
}
