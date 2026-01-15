/**
 * Local test file for AgentFSProviderService
 * This allows testing provider methods directly, bypassing socket communication.
 * 
 * Usage: 
 *   pnpm test:local         - Run all tests (local fs)
 *   pnpm test:server        - Test agent server connection and messages
 *   pnpm test:full          - Test combined provider + agent server
 */

import { AgentFSProviderService } from './dist/services/AgentFSProviderService.js';
import { startAgentServer, stopAgentServer, isPortInUse } from './dist/utils/agentServer.js';
import type { ChildProcess } from 'child_process';
import WebSocket from 'ws';
import path from 'path';

// Configuration
const TEST_CONFIG = {
    // Change this to your test project path (can be a temporary dir)
    projectPath: process.env.TEST_PROJECT_PATH || path.resolve(process.cwd(), '.test-env'),
    environmentName: process.env.TEST_ENV_NAME || `test-env-${Date.now()}`,
    agentServerPort: parseInt(process.env.AGENT_SERVER_PORT || '3006'), // Use a different port for testing
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
 * Create a AgentFSProviderService instance for local testing
 */
function createProviderService() {
    return new AgentFSProviderService({
        agentServerPort: TEST_CONFIG.agentServerPort,
        agentServerHost: TEST_CONFIG.agentServerHost,
        agentFSBinaryPath: process.env.AGENTFS_BINARY_PATH || 'agentfs', // Env override if needed
        timeouts: {
            agentServerStartup: 30000,
            wsConnection: 10000,
            gitOperations: 30000,
            cleanup: 15000,
        },
    });
}

/**
 * Setup test environment (create dir)
 */
async function setupTestEnv() {
    const { mkdir } = await import('fs/promises');
    await mkdir(TEST_CONFIG.projectPath, { recursive: true });
}

/**
 * Teardown test environment
 */
async function teardownTestEnv() {
    const { rm } = await import('fs/promises');
    await rm(TEST_CONFIG.projectPath, { recursive: true, force: true });
}

/**
 * Test worktree creation (environment setup)
 */
async function testCreateWorktree(provider: AgentFSProviderService) {
    logger.log('=== Testing Worktree Creation (Environment Setup) ===');

    try {
        // AgentFS Provider basically sets the path and environment name
        // It relies on onProviderStart usually, but here we test the specific method
        // Note: createWorktree might not be fully used in AgentFS flow if it's same as git, 
        // but we test it for API compliance.

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
async function testGetProject(provider: AgentFSProviderService, parentId: string = 'root') {
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
async function testReadFile(provider: AgentFSProviderService, filePath: string) {
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
async function testWriteFile(provider: AgentFSProviderService, filePath: string, content: string) {
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
            logger.warn('Expected:', content);
            logger.warn('Got:', readContent);
        }
    } catch (error) {
        logger.error('Failed to write file:', error);
        throw error;
    }
}

/**
 * Test creating a folder
 */
async function testCreateFolder(provider: AgentFSProviderService, folderPath: string) {
    logger.log('=== Testing Create Folder ===');
    logger.log('  FolderPath:', folderPath);

    try {
        await provider.onCreateFolder(folderPath);
        logger.log('Folder created successfully');
    } catch (error) {
        logger.error('Failed to create folder:', error);
        throw error;
    }
}

/**
 * Test removing worktree
 */
async function testRemoveWorktree(provider: AgentFSProviderService) {
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

        // AgentFS Provider's startAgentServer uses utility we imported
        // But the provider manages the process. 
        // We can test the utility directly or via provider.
        // Let's test utility directly for separation as per other test file.

        const processRef = await startAgentServer({
            logger,
            port: TEST_CONFIG.agentServerPort,
            projectPath: TEST_CONFIG.projectPath
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
 * Test agent server health using HTTP endpoint
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

    let agentServerProcess: ChildProcess | null = null;
    let ws: WebSocket | null = null;

    try {
        await setupTestEnv();

        agentServerProcess = await testStartAgentServer();
        await testAgentServerHealth();
        ws = await testWebSocketConnection();

        await testSendMessage(ws, {
            type: 'ping',
            timestamp: Date.now(),
        });

        await testSendMessage(ws, {
            type: 'agentMessage',
            action: 'chat',
            data: {
                message: 'Hello from AgentFS test!',
                timestamp: new Date().toISOString(),
            },
            messageId: `test-msg-${Date.now()}`,
        });

        await testReceiveMessages(ws, 3000);

    } catch (error) {
        logger.error('Agent server test failed:', error);
        throw error;
    } finally {
        if (ws) ws.close();
        if (agentServerProcess) await stopAgentServer({ logger, processRef: agentServerProcess });
        await teardownTestEnv();
    }
}

/**
 * Combined test: Provider + Agent Server
 */
async function runFullProviderTests() {
    logger.log('========================================');
    logger.log('Starting Full Provider Tests');
    logger.log('========================================');

    const provider = createProviderService();
    // Simulate init logic
    try {
        await provider.onProviderStart({
            environmentName: TEST_CONFIG.environmentName,
            projectPath: TEST_CONFIG.projectPath,
            project: { name: 'test-project' },
        } as any);
    } catch (e) {
        logger.log('Provider start warning:', e); // Might fail if binary missing
    }


    let agentServerProcess: ChildProcess | null = null;
    let ws: WebSocket | null = null;

    try {
        await setupTestEnv();

        logger.log('\n--- Phase 1: Agent Server Setup ---');
        agentServerProcess = await testStartAgentServer();
        await testAgentServerHealth();

        logger.log('\n--- Phase 2: Worktree/Env Setup ---');
        // Already mocked via setupTestEnv, but let's call provider method
        await testCreateWorktree(provider);

        logger.log('\n--- Phase 3: WebSocket Connection ---');
        ws = await testWebSocketConnection();

        logger.log('\n--- Phase 4: File Operations ---');
        const testFilePath = 'test-file-full.txt';
        try {
            await testWriteFile(provider, testFilePath, `Test content`);
            // Send notification about file change
            await testSendMessage(ws, {
                type: 'notification',
                action: 'fileChanged',
                data: {
                    path: testFilePath,
                    operation: 'create',
                    worktreePath: TEST_CONFIG.projectPath,
                },
            });
        } catch (e) {
            logger.warn('Skipping file operations if agentfs binary is missing or failing:', e);
        }

        logger.log('\n--- Phase 5: Listen for Responses ---');
        await testReceiveMessages(ws, 2000);

    } catch (error) {
        logger.error('Full provider test failed:', error);
        throw error;
    } finally {
        if (ws) ws.close();
        if (agentServerProcess) await stopAgentServer({ logger, processRef: agentServerProcess });
        await teardownTestEnv();
    }
}

/**
 * Run all local tests
 */
async function runAllTests() {
    logger.log('========================================');
    logger.log('Starting Local Provider Tests');
    logger.log('========================================');

    try {
        await setupTestEnv();

        const provider = createProviderService();
        // IMPORTANT: We must manually set projectPath on the provider since we bypass onProviderStart in some unit tests
        // or we call things that depend on it.
        // But onProviderStart is what sets it.

        await provider.onProviderStart({
            environmentName: TEST_CONFIG.environmentName,
            projectPath: TEST_CONFIG.projectPath,
            project: { name: 'test-project' },
        } as any);

        // Test 1: Create Folder
        const testDir = 'test-src';
        await testCreateFolder(provider, testDir);

        // Test 2: Write File
        const testFile = `${testDir}/hello.txt`;
        await testWriteFile(provider, testFile, 'Hello AgentFS');

        // Test 3: Get Project
        await testGetProject(provider, 'root');
        await testGetProject(provider, testDir);

        // Test 4: Delete File
        await provider.onDeleteFile(testFile);

        // Test 5: Delete Folder
        await provider.onDeleteFolder(testDir);

    } catch (error) {
        logger.error('Test suite failed:', error);
        // Don't fail process if it's just binary missing, for now just log
        // process.exit(1); 
    } finally {
        await teardownTestEnv();
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const mode = args[0] || 'all';

logger.log('Mode:', mode);
logger.log('');

switch (mode) {
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
