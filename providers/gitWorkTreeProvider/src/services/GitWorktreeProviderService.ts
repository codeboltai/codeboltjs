import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
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

    // Set agent server path relative to this file
    this.config.agentServerPath = this.config.agentServerPath || 
      path.resolve(__dirname, '../../../remoteexecutor/updatedAgentServer/dist/server.mjs');
    
    // Update server URL based on config
    this.agentServerConnection.serverUrl = 
      `ws://${this.config.agentServerHost}:${this.config.agentServerPort}`;
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
      
      // Start agent server
      console.log('[Git WorkTree Provider] Starting agent server...');
      await this.startAgentServer();
      
      // Connect to agent server WebSocket
      console.log('[Git WorkTree Provider] Connecting to agent server...');
      await this.connectToAgentServer(worktreeInfo.path!, initvars.environmentName);
      
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
  async onProviderAgentStart(initvars: AgentStartMessage): Promise<void> {
    console.log('[Git WorkTree Provider] Agent start requested, forwarding to agent server:', initvars);
    
    // Check if we have a connection to the agent server
    if (!this.agentServerConnection.isConnected || !this.agentServerConnection.wsConnection) {
      throw new Error('Agent server is not connected. Cannot forward agent start message.');
    }
    
    // Prepare the message to send to agent server
    const agentMessage: AgentServerMessage = {
      type: 'agentStart',
      action: 'startAgent',
      data: {
        userMessage: initvars.userMessage || '',
        task: initvars.task || '',
        context: initvars.context || {},
        worktreePath: this.worktreeInfo.path,
        environmentName: this.worktreeInfo.branch,
        originalMessage: initvars
      },
      messageId: `agent-start-${Date.now()}`,
      timestamp: Date.now()
    };
    
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
      // Close WebSocket connection
      if (this.agentServerConnection.wsConnection) {
        console.log('[Git WorkTree Provider] Closing WebSocket connection...');
        this.agentServerConnection.wsConnection.close();
        this.agentServerConnection.wsConnection = null;
        this.agentServerConnection.isConnected = false;
      }
      
      // Stop agent server
      await this.stopAgentServer();
      
      // Remove worktree
      const { projectPath } = await codebolt.project.getProjectPath();
      if (projectPath) {
        await this.removeWorktree(projectPath);
      }
      
    } catch (error) {
      console.error('[Git WorkTree Provider] Error during cleanup:', error);
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
   * Start the updatedAgentServer
   */
  async startAgentServer(): Promise<void> {
    console.log('[Git WorkTree Provider] Starting updatedAgentServer...');
    
    if (!fs.existsSync(this.config.agentServerPath!)) {
      throw new Error(`Agent server not found at: ${this.config.agentServerPath}`);
    }
    
    return new Promise((resolve, reject) => {
      this.agentServerConnection.process = spawn('node', [this.config.agentServerPath!, '--noui'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false
      });
      
      let serverStarted = false;
      
      this.agentServerConnection.process.stdout?.on('data', (data) => {
        const output = data.toString();
        console.log('[Git WorkTree Provider] Agent Server:', output);
        
        // Check if server has started successfully
        if (output.includes('Server started successfully') && !serverStarted) {
          serverStarted = true;
          resolve();
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
      });
      
      // Timeout
      setTimeout(() => {
        if (!serverStarted) {
          reject(new Error('Agent server startup timeout'));
        }
      }, this.config.timeouts?.agentServerStartup || 30000);
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
      
      this.agentServerConnection.wsConnection.on('open', () => {
        console.log('[Git WorkTree Provider] WebSocket connection established');
        this.agentServerConnection.isConnected = true;
        resolve();
      });
      
      this.agentServerConnection.wsConnection.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('[Git WorkTree Provider] WebSocket message received:', message.type || 'unknown');
          
          // Handle different message types
          switch (message.type) {
            case 'registered':
              console.log('[Git WorkTree Provider] Successfully registered with agent server');
              break;
              
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
      
      // Timeout
      setTimeout(() => {
        if (this.agentServerConnection.wsConnection?.readyState !== WebSocket.OPEN) {
          reject(new Error('WebSocket connection timeout'));
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
      return true;
    }

    console.log('[Git WorkTree Provider] Stopping agent server...');
    
    return new Promise<boolean>((resolve) => {
      this.agentServerConnection.process!.kill('SIGTERM');
      
      // Wait for graceful shutdown, then force kill if needed
      const timeout = setTimeout(() => {
        if (this.agentServerConnection.process && !this.agentServerConnection.process.killed) {
          console.log('[Git WorkTree Provider] Force killing agent server...');
          this.agentServerConnection.process.kill('SIGKILL');
        }
        resolve(true);
      }, 5000);
      
      this.agentServerConnection.process?.on('exit', () => {
        clearTimeout(timeout);
        this.agentServerConnection.process = null;
        resolve(true);
      });
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
}
