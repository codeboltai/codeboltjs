import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import * as net from 'net';
import WebSocket from 'ws';
import codebolt from "@codebolt/codeboltjs";

import {
  IProviderService,
  ProviderInitVars,
  ProviderStartResult,
  DiffResult,
  DiffFile,
  AgentServerConnection,
  WorktreeInfo,
  CleanupResult,
  ProviderConfig,
  AgentStartMessage,
  AgentServerMessage
} from '../interfaces/IProviderService';


// Promisify exec for async/await usage
const execAsync = promisify(exec);

/**
 * Git WorkTree Provider Service Implementation
 */
export class GitWorktreeProviderService implements IProviderService {
  private worktreeInfo: WorktreeInfo = {
    path: null,
    branch: null,
    isCreated: false
  };

  private agentServerConnection: AgentServerConnection = {
    process: null,
    wsConnection: null,
    serverUrl: 'ws://localhost:3001',
    isConnected: false
  };

  private config: ProviderConfig;

  constructor(config: ProviderConfig = {}) {
    this.config = {
      agentServerPort: 3001,
      agentServerHost: 'localhost',
      worktreeBaseDir: '.worktree',
      timeouts: {
        agentServerStartup: 30000,
        wsConnection: 10000,
        gitOperations: 30000,
        cleanup: 15000
      },
      ...config
    };

    // Use npx to run the published agent server package
    // No need to set agentServerPath as we'll use npx @codebolt/agentserver
    
    // Update server URL based on config
    this.agentServerConnection.serverUrl = 
      `ws://${this.config.agentServerHost}:${this.config.agentServerPort}`;
    
    // Setup process cleanup handlers
    this.setupProcessCleanupHandlers();
  }

  /**
   * Check if a port is already in use
   */
  private async isPortInUse(port: number, host: string = 'localhost'): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.listen(port, host, () => {
        server.once('close', () => {
          resolve(false);
        });
        server.close();
      });
      
      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  /**
   * Check if agent server is already running by testing port and health
   */
  private async isAgentServerRunning(): Promise<boolean> {
    try {
      const portInUse = await this.isPortInUse(
        this.config.agentServerPort!,
        this.config.agentServerHost!
      );
      
      if (!portInUse) {
        console.log(`[Git WorkTree Provider] Port ${this.config.agentServerPort} is not in use`);
        return false;
      }
      
      console.log(`[Git WorkTree Provider] Port ${this.config.agentServerPort} is in use, testing server health...`);
      
      // Test if we can actually connect to the server
      const isHealthy = await this.testServerHealth();
      if (isHealthy) {
        console.log(`[Git WorkTree Provider] Agent server is running and healthy`);
        return true;
      } else {
        console.log(`[Git WorkTree Provider] Port is in use but server is not responding correctly`);
        return false;
      }
      
    } catch (error) {
      console.warn('[Git WorkTree Provider] Error checking if agent server is running:', error);
      return false;
    }
  }

  /**
   * Test if the agent server is healthy by attempting a simple connection
   */
  private async testServerHealth(): Promise<boolean> {
    return new Promise((resolve) => {
      const testSocket = new WebSocket(this.agentServerConnection.serverUrl);
      
      const timeout = setTimeout(() => {
        testSocket.close();
        resolve(false);
      }, 3000); // 3 second timeout
      
      testSocket.on('open', () => {
        clearTimeout(timeout);
        testSocket.close();
        resolve(true);
      });
      
      testSocket.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  /**
   * Setup process cleanup handlers for graceful shutdown
   */
  private setupProcessCleanupHandlers(): void {
    // Handle process termination signals
    const cleanup = async (signal: string) => {
      console.log(`[Git WorkTree Provider] Received ${signal}, initiating cleanup...`);
      try {
        await this.onCloseSignal();
      } catch (error) {
        console.error('[Git WorkTree Provider] Error during signal cleanup:', error);
      }
      process.exit(0);
    };

    // Register signal handlers
    process.on('SIGINT', () => cleanup('SIGINT'));
    process.on('SIGTERM', () => cleanup('SIGTERM'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error('[Git WorkTree Provider] Uncaught exception:', error);
      try {
        await this.onCloseSignal();
      } catch (cleanupError) {
        console.error('[Git WorkTree Provider] Error during exception cleanup:', cleanupError);
      }
      process.exit(1);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('[Git WorkTree Provider] Unhandled rejection at:', promise, 'reason:', reason);
      try {
        await this.onCloseSignal();
      } catch (cleanupError) {
        console.error('[Git WorkTree Provider] Error during rejection cleanup:', cleanupError);
      }
      process.exit(1);
    });
  }

  /**
   * Provider start handler - creates worktree, starts agent server, connects WebSocket
   */
  async onProviderStart(initvars: ProviderInitVars): Promise<ProviderStartResult> {
    console.log('[Git WorkTree Provider] Starting provider with environment:', initvars.environmentName);

    const { projectPath } = await codebolt.project.getProjectPath();
    
    if (!projectPath) {
      throw new Error('Project path is not available');
    }
    
    try {
      // Create worktree
      const worktreeInfo = await this.createWorktree(projectPath, initvars.environmentName);
      
      // Check if agent server is already running
      // This prevents conflicts and unnecessary process spawning
      console.log('[Git WorkTree Provider] Checking if agent server is already running...');
      const isServerRunning = await this.isAgentServerRunning();
      
      if (isServerRunning) {
        console.log('[Git WorkTree Provider] Agent server is already running and healthy, skipping startup');
      } else {
        // Start agent server
        console.log('[Git WorkTree Provider] Starting agent server...');
        await this.startAgentServer();
        // Add a delay after starting the agent server to allow it to fully initialize
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
      
      // Connect to agent server WebSocket
      console.log('[Git WorkTree Provider] Connecting to agent server...');
      await this.connectToAgentServer(worktreeInfo.path!, initvars.environmentName);
      console.log('[Git WorkTree Provider] Connected to agent server...');
      
      return {
        success: true,
        worktreePath: worktreeInfo.path!,
        environmentName: initvars.environmentName,
        agentServerUrl: this.agentServerConnection.serverUrl
      };
      
    } catch (error) {
      console.error('[Git WorkTree Provider] Error during provider start:', error);
      throw error;
    }
  }

  /**
   * Provider agent start handler - forwards message to agent server
   */
  async onProviderAgentStart(agentMessage:any): Promise<void> {
    console.log('[Git WorkTree Provider] Agent start requested, forwarding to agent server:', agentMessage);
    
    // Check if we have a connection to the agent server
    if (!this.agentServerConnection.isConnected || !this.agentServerConnection.wsConnection) {
      throw new Error('Agent server is not connected. Cannot forward agent start message.');
    }    
    try {
      // Send message to agent server
      const success = await this.sendMessageToAgent(agentMessage);
      
      if (success) {
        console.log('[Git WorkTree Provider] Agent start message successfully forwarded to agent server');
      } else {
        throw new Error('Failed to send message to agent server');
      }
    } catch (error) {
      console.error('[Git WorkTree Provider] Error forwarding agent start message:', error);
      throw error;
    }
  }

  /**
   * Get diff files from worktree
   */
  async onGetDiffFiles(): Promise<DiffResult> {
    console.log('[Git WorkTree Provider] Getting diff files from worktree');
    
    try {
      const { projectPath } = await codebolt.project.getProjectPath();
      
      if (!projectPath) {
        throw new Error('Project path is not available');
      }
      
      if (!this.worktreeInfo.path || !this.worktreeInfo.isCreated) {
        throw new Error('No worktree available - provider not initialized');
      }
      
      // Get git status from the worktree
      const statusCommand = 'git status --porcelain';
      console.log('[Git WorkTree Provider] Getting git status:', statusCommand);
      
      const { stdout: statusOutput } = await execAsync(statusCommand, {
        cwd: this.worktreeInfo.path,
        timeout: this.config.timeouts?.gitOperations || 15000
      });
      
      // Get full diff from the worktree
      const diffCommand = 'git diff HEAD';
      console.log('[Git WorkTree Provider] Getting git diff:', diffCommand);
      
      const { stdout: rawDiff } = await execAsync(diffCommand, {
        cwd: this.worktreeInfo.path,
        timeout: this.config.timeouts?.gitOperations || 15000
      });
      
      // Parse git status output
      const statusLines = statusOutput.trim().split('\n').filter(line => line.trim());
      const files: DiffFile[] = [];
      
      for (const line of statusLines) {
        if (!line.trim()) continue;
        
        const status = line.substring(0, 2);
        const filename = line.substring(3);
        
        // Determine file status
        let fileStatus: 'added' | 'modified' | 'deleted' | 'renamed' = 'modified';
        if (status.includes('A')) fileStatus = 'added';
        else if (status.includes('D')) fileStatus = 'deleted';
        else if (status.includes('R')) fileStatus = 'renamed';
        
        // Extract file-specific diff content
        const filePattern = new RegExp(
          `diff --git a/${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} b/${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?(?=(?:diff --git)|$)`,
          'g'
        );
        const fileDiffMatch = rawDiff.match(filePattern);
        const fileDiff = fileDiffMatch ? fileDiffMatch[0] : '';
        
        // Count insertions and deletions from diff
        const insertions = (fileDiff.match(/^\+(?!\+\+)/gm) || []).length;
        const deletions = (fileDiff.match(/^-(?!--)/gm) || []).length;
        
        files.push({
          file: filename,
          changes: insertions + deletions,
          insertions,
          deletions,
          binary: false, // TODO: Detect binary files
          status: fileStatus,
          diff: fileDiff
        });
      }
      
      const result: DiffResult = {
        files,
        insertions: files.reduce((sum, file) => sum + file.insertions, 0),
        deletions: files.reduce((sum, file) => sum + file.deletions, 0),
        changed: files.length,
        rawDiff
      };
      
      console.log('[Git WorkTree Provider] Found', result.changed, 'changed files');
      console.log('[Git WorkTree Provider] Total insertions:', result.insertions);
      console.log('[Git WorkTree Provider] Total deletions:', result.deletions);
      
      return result;
      
    } catch (error: any) {
      console.error('[Git WorkTree Provider] Error getting diff files:', error.message);
      if (error.stdout) console.error('[Git WorkTree Provider] stdout:', error.stdout);
      if (error.stderr) console.error('[Git WorkTree Provider] stderr:', error.stderr);
      throw new Error(`Failed to get diff files: ${error.message}`);
    }
  }

  /**
   * Close signal handler - cleanup everything
   */
  async onCloseSignal(): Promise<void> {
    console.log('[Git WorkTree Provider] Received close signal, cleaning up...');
    
    try {
      // Close WebSocket connection first
      if (this.agentServerConnection.wsConnection) {
        console.log('[Git WorkTree Provider] Closing WebSocket connection...');
        try {
          this.agentServerConnection.wsConnection.close();
        } catch (wsError) {
          console.warn('[Git WorkTree Provider] Error closing WebSocket:', wsError);
        }
        this.agentServerConnection.wsConnection = null;
        this.agentServerConnection.isConnected = false;
      }
      
      // Stop agent server process with timeout
      console.log('[Git WorkTree Provider] Stopping agent server process...');
      await this.stopAgentServer();
      
      // Remove worktree
      const { projectPath } = await codebolt.project.getProjectPath();
      // let projectPath ="/Users/ravirawat/Documents/cbtest/fond-amber"
      if (projectPath) {
        await this.removeWorktree(projectPath);
      }
      
      console.log('[Git WorkTree Provider] Cleanup completed successfully');
      
    } catch (error) {
      console.error('[Git WorkTree Provider] Error during cleanup:', error);
      
      // Force kill any remaining processes as a last resort
      if (this.agentServerConnection.process && !this.agentServerConnection.process.killed) {
        console.warn('[Git WorkTree Provider] Force killing remaining agent server process...');
        try {
          this.agentServerConnection.process.kill('SIGKILL');
          this.agentServerConnection.process = null;
        } catch (killError) {
          console.error('[Git WorkTree Provider] Failed to force kill process:', killError);
        }
      }
      
      // Don't throw error during cleanup to avoid blocking shutdown
    }
  }

  /**
   * Create patch request handler - not implemented
   */
  onCreatePatchRequest(): void {
    throw new Error("Function not implemented.");
  }

  /**
   * Create pull request handler - not implemented
   */
  onCreatePullRequestRequest(): void {
    throw new Error("Function not implemented.");
  }

  /**
   * Handle incoming WebSocket messages
   */
  async onMessage(userMessage:any): Promise<void> {
  

    try {
      // Forward the message to the agent server if connected
      if (this.agentServerConnection.isConnected && this.agentServerConnection.wsConnection) {
      
        const success = await this.sendMessageToAgent(userMessage);
        if (!success) {
          console.warn('[GitWorktreeProviderService] Failed to forward message to agent server');
        }
      } else {
        console.warn('[GitWorktreeProviderService] Agent server not connected, cannot forward message');
      }
    } catch (error) {
      console.error('[GitWorktreeProviderService] Error processing message:', error);
      throw error;
    }
  }

  /**
   * Start the updatedAgentServer
   */
  async startAgentServer(): Promise<void> {
    console.log('[Git WorkTree Provider] Starting updatedAgentServer...');
    
    // Double-check if we already have a running process
    if (this.agentServerConnection.process && !this.agentServerConnection.process.killed) {
      console.log('[Git WorkTree Provider] Agent server process already exists, skipping startup');
      return;
    }
    
    // No need to check file existence since we're using npx package
    
    return new Promise((resolve, reject) => {
      this.agentServerConnection.process = spawn('npx', ['--yes', '@codebolt/agentserver', '--noui'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false
      });
      
      let serverStarted = false;
      
      this.agentServerConnection.process.stdout?.on('data', (data) => {
        const output = data.toString();
        console.log('[Git WorkTree Provider] Agent Server:', output);
        resolve();
        
        // Check if server has started successfully
        if (output.includes('Server started successfully') && !serverStarted) {
          serverStarted = true;
        }
      });
      
      this.agentServerConnection.process.stderr?.on('data', (data) => {
        console.error('[Git WorkTree Provider] Agent Server Error:', data.toString());
      });
      
      this.agentServerConnection.process.on('error', (error) => {
        console.error('[Git WorkTree Provider] Failed to start agent server:', error);
        reject(error);
      });
      
      this.agentServerConnection.process.on('exit', (code, signal) => {
        console.log(`[Git WorkTree Provider] Agent server exited with code ${code}, signal ${signal}`);
        this.agentServerConnection.process = null;
        this.agentServerConnection.isConnected = false;
        
        // Close WebSocket connection if process exits unexpectedly
        if (this.agentServerConnection.wsConnection) {
          console.log('[Git WorkTree Provider] Closing WebSocket due to agent server exit');
          this.agentServerConnection.wsConnection.close();
          this.agentServerConnection.wsConnection = null;
        }
      });
      
      // Timeout
      // setTimeout(() => {
      //   if (!serverStarted) {
      //     reject(new Error('Agent server startup timeout'));
      //   }
      // }, this.config.timeouts?.agentServerStartup || 30000);
    });
  }

  /**
   * Connect to the agent server WebSocket
   */
  async connectToAgentServer(worktreePath: string, environmentName: string): Promise<void> {
    console.log('[Git WorkTree Provider] Connecting to agent server WebSocket...');
    
    const wsUrl = `${this.agentServerConnection.serverUrl}?clientType=app&appId=git-worktree-${environmentName}&currentProject=${encodeURIComponent(worktreePath)}&projectName=${encodeURIComponent(environmentName)}`;
    
    return new Promise((resolve, reject) => {
      this.agentServerConnection.wsConnection = new WebSocket(wsUrl);
      let isRegistered = false;
      
      this.agentServerConnection.wsConnection.on('open', () => {
        console.log('[Git WorkTree Provider] WebSocket connection established, waiting for registration...');
        this.agentServerConnection.isConnected = true;
        // Don't resolve here - wait for 'registered' message
      });
      
      this.agentServerConnection.wsConnection.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('[Git WorkTree Provider] WebSocket message received:', message.type || 'unknown');
          
          // Check for registration message
          if (message.type === 'registered' && !isRegistered) {
            console.log('[Git WorkTree Provider] Successfully registered with agent server');
            isRegistered = true;
            resolve();
            return;
          }
          
          // Forward all messages to codebolt websocket
          codebolt.websocket?.send(data.toString())
          
          // Handle different message types
          switch (message.type) {
            case 'agentStartResponse':
              console.log('[Git WorkTree Provider] Agent start response:', message.data?.status || 'unknown');
              if (message.data?.error) {
                console.error('[Git WorkTree Provider] Agent start error:', message.data.error);
              }
              break;
              
            case 'agentMessage':
              console.log('[Git WorkTree Provider] Agent message:', message.data?.message || 'no message');
              break;
              
            case 'notification':
              console.log('[Git WorkTree Provider] Agent notification:', message.action, message.data);
              break;
              
            case 'error':
              console.error('[Git WorkTree Provider] Agent server error:', message.message || 'unknown error');
              break;
              
            default:
              console.log('[Git WorkTree Provider] Unhandled message type:', message.type, message);
          }
        } catch (error) {
          console.error('[Git WorkTree Provider] Error parsing WebSocket message:', error);
        }
      });
      
      this.agentServerConnection.wsConnection.on('error', (error: Error) => {
        console.error('[Git WorkTree Provider] WebSocket error:', error);
        this.agentServerConnection.isConnected = false;
        reject(error);
      });
      
      this.agentServerConnection.wsConnection.on('close', () => {
        console.log('[Git WorkTree Provider] WebSocket connection closed');
        this.agentServerConnection.wsConnection = null;
        this.agentServerConnection.isConnected = false;
      });
      
      // Timeout - now checks for both connection and registration
      setTimeout(() => {
        if (!isRegistered) {
          reject(new Error('WebSocket registration timeout - did not receive "registered" message'));
        }
      }, this.config.timeouts?.wsConnection || 10000);
    });
  }

  /**
   * Send message to agent server via WebSocket
   */
  async sendMessageToAgent(message: AgentServerMessage): Promise<boolean> {
    console.log('[Git WorkTree Provider] Sending message to agent server:', message.type);
    
    if (!this.agentServerConnection.wsConnection || !this.agentServerConnection.isConnected) {
      console.error('[Git WorkTree Provider] WebSocket connection not available');
      return false;
    }
    
    if (this.agentServerConnection.wsConnection.readyState !== WebSocket.OPEN) {
      console.error('[Git WorkTree Provider] WebSocket connection is not open');
      return false;
    }
    
    return new Promise((resolve) => {
      try {
        const messageStr = JSON.stringify(message);
        this.agentServerConnection.wsConnection!.send(messageStr);
        
        console.log('[Git WorkTree Provider] Message sent successfully to agent server');
        resolve(true);
        
      } catch (error) {
        console.error('[Git WorkTree Provider] Error sending message to agent server:', error);
        resolve(false);
      }
    });
  }

  /**
   * Stop agent server process
   */
  async stopAgentServer(): Promise<boolean> {
    if (!this.agentServerConnection.process) {
      console.log('[Git WorkTree Provider] No agent server process to stop');
      return true;
    }

    console.log('[Git WorkTree Provider] Stopping agent server process...');
    
    return new Promise<boolean>((resolve) => {
      const process = this.agentServerConnection.process!;
      let resolved = false;
      
      let cleanup = () => {
        if (!resolved) {
          resolved = true;
          this.agentServerConnection.process = null;
          console.log('[Git WorkTree Provider] Agent server process stopped');
          resolve(true);
        }
      };
      
      // Listen for process exit
      process.on('exit', (code, signal) => {
        console.log(`[Git WorkTree Provider] Agent server exited with code ${code}, signal ${signal}`);
        cleanup();
      });
      
      // Listen for process error
      process.on('error', (error) => {
        console.error('[Git WorkTree Provider] Agent server process error during shutdown:', error);
        cleanup();
      });
      
      try {
        // Try graceful shutdown first
        console.log('[Git WorkTree Provider] Sending SIGTERM to agent server...');
        process.kill('SIGTERM');
      } catch (error) {
        console.warn('[Git WorkTree Provider] Error sending SIGTERM:', error);
        // Process might already be dead, continue with cleanup
        cleanup();
        return;
      }
      
      // Wait for graceful shutdown, then force kill if needed
      const gracefulTimeout = setTimeout(() => {
        if (process && !process.killed && !resolved) {
          console.log('[Git WorkTree Provider] Graceful shutdown timeout, force killing agent server...');
          try {
            process.kill('SIGKILL');
          } catch (killError) {
            console.error('[Git WorkTree Provider] Error force killing process:', killError);
          }
          
          // Give it a moment for the kill signal to take effect
          setTimeout(() => {
            cleanup();
          }, 1000);
        }
      }, 5000);
      
      // Final timeout to ensure we don't hang indefinitely
      const finalTimeout = setTimeout(() => {
        console.warn('[Git WorkTree Provider] Process cleanup timeout reached, proceeding...');
        clearTimeout(gracefulTimeout);
        cleanup();
      }, 10000);
      
      // Clear timeouts when process exits
      const originalCleanup = cleanup;
      const enhancedCleanup = () => {
        clearTimeout(gracefulTimeout);
        clearTimeout(finalTimeout);
        originalCleanup();
      };
      
      // Replace the cleanup function
      cleanup = enhancedCleanup;
    });
  }

  /**
   * Create git worktree
   */
  async createWorktree(projectPath: string, environmentName: string): Promise<WorktreeInfo> {
    // Create .worktree directory inside project if it doesn't exist
    const worktreeBaseDir = path.join(projectPath, this.config.worktreeBaseDir!);
    if (!fs.existsSync(worktreeBaseDir)) {
      console.log('[Git WorkTree Provider] Creating .worktree directory at:', worktreeBaseDir);
      fs.mkdirSync(worktreeBaseDir, { recursive: true });
    }
    
    // Create worktree path inside .worktree folder
    const worktreePath = path.join(worktreeBaseDir, environmentName);
    console.log('[Git WorkTree Provider] Creating worktree at:', worktreePath);
    
    // Validate that we're in a git repository
    console.log('[Git WorkTree Provider] Validating git repository...');
    
    try {
      await execAsync('git rev-parse --git-dir', { 
        cwd: projectPath,
        timeout: 10000
      });
      console.log('[Git WorkTree Provider] Valid git repository found, proceeding...');
    } catch (error: any) {
      throw new Error('Not a valid git repository. Please initialize git first.');
    }
    
    // Create a branch name using just the environment name
    const worktreeBranch = environmentName;
    console.log('[Git WorkTree Provider] Creating worktree branch:', worktreeBranch);
    
    // Execute git worktree add command with new branch creation
    const command = `git worktree add -b "${worktreeBranch}" "${worktreePath}"`;
    console.log('[Git WorkTree Provider] Executing command:', command);
    
    try {
      const { stdout, stderr } = await execAsync(command, { 
        cwd: projectPath,
        timeout: this.config.timeouts?.gitOperations || 30000
      });
      
      console.log('[Git WorkTree Provider] Worktree created successfully at:', worktreePath);
      if (stdout) console.log('[Git WorkTree Provider] Command output:', stdout.trim());
      if (stderr) console.log('[Git WorkTree Provider] Command stderr:', stderr.trim());
      
      // Update worktree info
      this.worktreeInfo = {
        path: worktreePath,
        branch: worktreeBranch,
        isCreated: true
      };
      
      return this.worktreeInfo;
      
    } catch (error: any) {
      console.error('[Git WorkTree Provider] Failed to create worktree:', error.message);
      if (error.stdout) console.error('[Git WorkTree Provider] stdout:', error.stdout);
      if (error.stderr) console.error('[Git WorkTree Provider] stderr:', error.stderr);
      throw new Error(`Git worktree creation failed: ${error.message}`);
    }
  }

  /**
   * Remove git worktree
   */
  async removeWorktree(projectPath: string): Promise<boolean> {
    if (!this.worktreeInfo.path || !this.worktreeInfo.isCreated) {
      console.log('[Git WorkTree Provider] No worktree to clean up');
      return true;
    }

    console.log('[Git WorkTree Provider] Removing worktree at:', this.worktreeInfo.path);
    
    try {
      const removeCommand = `git worktree remove "${this.worktreeInfo.path}"`;
      const { stdout, stderr } = await execAsync(removeCommand, { 
        cwd: projectPath,
        timeout: this.config.timeouts?.cleanup || 15000
      });
      
      console.log('[Git WorkTree Provider] Successfully removed worktree:', this.worktreeInfo.path);
      if (stdout) console.log('[Git WorkTree Provider] Remove output:', stdout.trim());
      if (stderr) console.log('[Git WorkTree Provider] Remove stderr:', stderr.trim());
      
      // Also delete the created branch
      if (this.worktreeInfo.branch) {
        try {
          console.log('[Git WorkTree Provider] Deleting worktree branch:', this.worktreeInfo.branch);
          const deleteBranchCommand = `git branch -D "${this.worktreeInfo.branch}"`;
          const { stdout: branchStdout, stderr: branchStderr } = await execAsync(deleteBranchCommand, { 
            cwd: projectPath,
            timeout: 10000
          });
          
          console.log('[Git WorkTree Provider] Successfully deleted branch:', this.worktreeInfo.branch);
          if (branchStdout) console.log('[Git WorkTree Provider] Branch delete output:', branchStdout.trim());
          if (branchStderr) console.log('[Git WorkTree Provider] Branch delete stderr:', branchStderr.trim());
          
        } catch (branchError: any) {
          console.warn('[Git WorkTree Provider] Failed to delete branch:', this.worktreeInfo.branch, branchError.message);
        }
      }
      
      // Reset worktree info
      this.worktreeInfo = {
        path: null,
        branch: null,
        isCreated: false
      };
      
      return true;
      
    } catch (error: any) {
      console.warn('[Git WorkTree Provider] Failed to remove worktree:', this.worktreeInfo.path, error.message);
      
      // Try force removal if normal removal fails
      try {
        const forceRemoveCommand = `git worktree remove --force "${this.worktreeInfo.path}"`;
        const { stdout, stderr } = await execAsync(forceRemoveCommand, { 
          cwd: projectPath,
          timeout: this.config.timeouts?.cleanup || 15000
        });
        
        console.log('[Git WorkTree Provider] Force removed worktree:', this.worktreeInfo.path);
        if (stdout) console.log('[Git WorkTree Provider] Force remove output:', stdout.trim());
        if (stderr) console.log('[Git WorkTree Provider] Force remove stderr:', stderr.trim());
        
        // Reset worktree info after successful force removal
        this.worktreeInfo = {
          path: null,
          branch: null,
          isCreated: false
        };
        
        return true;
        
      } catch (forceError: any) {
        console.error('[Git WorkTree Provider] Failed to force remove worktree:', forceError.message);
        if (forceError.stdout) console.error('[Git WorkTree Provider] Force stdout:', forceError.stdout);
        if (forceError.stderr) console.error('[Git WorkTree Provider] Force stderr:', forceError.stderr);
        return false;
      }
    }
  }

  /**
   * Get current worktree information
   */
  getWorktreeInfo(): WorktreeInfo {
    return { ...this.worktreeInfo };
  }

  /**
   * Get agent server connection information
   */
  getAgentServerConnection(): AgentServerConnection {
    return {
      process: this.agentServerConnection.process,
      wsConnection: this.agentServerConnection.wsConnection,
      serverUrl: this.agentServerConnection.serverUrl,
      isConnected: this.agentServerConnection.isConnected
    };
  }

  /**
   * Check if provider is initialized
   */
  isInitialized(): boolean {
    return this.worktreeInfo.isCreated && this.agentServerConnection.isConnected;
  }

  /**
   * Handle agent messages from raw WebSocket
   */
  handleAgentMessage(message: any): void {
    console.log('[Git WorkTree Provider Service] Handling agent message:', message);
    // Forward agent messages or handle them as needed
    // This could be used for agent-to-agent communication
  }

  /**
   * Handle notifications from raw WebSocket
   */
  handleNotification(action: string, data: any): void {
    console.log('[Git WorkTree Provider Service] Handling notification:', action, data);
    // Handle server notifications like status updates, progress, etc.
    switch (action) {
      case 'statusUpdate':
        console.log('[Git WorkTree Provider Service] Status update:', data);
        break;
      case 'progressUpdate':
        console.log('[Git WorkTree Provider Service] Progress update:', data);
        break;
      default:
        console.log('[Git WorkTree Provider Service] Unknown notification action:', action, data);
    }
  }

  /**
   * Handle unknown message types from raw WebSocket
   */
  handleUnknownMessage(message: any): void {
    console.log('[Git WorkTree Provider Service] Handling unknown message type:', message.type, message);
    // Handle any custom message types that might be added in the future
    // or provide extensibility for custom protocol messages
  }
}
