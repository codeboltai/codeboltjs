import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';
import { createWriteStream, createReadStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import AdmZip from 'adm-zip';
import axios from 'axios';
import { formatLogMessage, sleep } from '../types';




/**
 * Agent API response interface
 */
interface AgentDetailResponse {
  id: string;
  title: string;
  avatarSrc: string;
  avatarFallback: string;
  description: string;
  longDescription: string;
  zipFilePath: string;
  tags: string[];
  version: string;
}

/**
 * Manages child processes for the server
 */
export class ChildAgentProcessManager {
  private sampleClientProcess: ChildProcess | null = null;
  private agentProcesses: Map<string, ChildProcess> = new Map();

  /**
   * Get OS-specific agent storage path
   */
  private getAgentStoragePath(): string {
    // For testing purposes, return the specified test path
    // return '/Users/ravirawat/Documents/codeboltai/codeboltjs/agents/remote-agent';
    
    // Original OS-specific logic (commented out for testing)
    
    const platform = os.platform();
    
    switch (platform) {
      case 'darwin': // macOS
        return path.join(os.homedir(), 'Library', 'Application Support', 'codebolt', '.codebolt', 'remote-agents');
      case 'win32': // Windows
        return path.join(os.homedir(), 'AppData', 'Local', 'codebolt', '.codebolt', 'remote-agents');
      case 'linux':
        return path.join(os.homedir(), '.local', 'share', 'codebolt', '.codebolt', 'remote-agents');
      default:
        // Fallback to a generic path
        return path.join(os.homedir(), '.codebolt', 'remote-agents');
    }
    
  }

  /**
   * Get the path for a specific agent
   */
  private getAgentPath(agentId: string): string {
    return path.join(this.getAgentStoragePath(), agentId);
  }

  /**
   * Get the index.js path for a specific agent
   */
  private getAgentIndexPath(agentId: string): string {
    return path.join(this.getAgentPath(agentId), 'index.js');
  }

  /**
   * Download file from URL
   */
  private async downloadFile(url: string, destinationPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = createWriteStream(destinationPath);
      const protocol = url.startsWith('https:') ? https : http;
      
      const request = protocol.get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        } else if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirects
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            this.downloadFile(redirectUrl, destinationPath)
              .then(resolve)
              .catch(reject);
          } else {
            reject(new Error('Redirect without location header'));
          }
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        }
      });

      request.on('error', (error) => {
        fs.unlink(destinationPath, () => {}); // Clean up partial file
        reject(error);
      });

      file.on('error', (error) => {
        fs.unlink(destinationPath, () => {}); // Clean up partial file
        reject(error);
      });
    });
  }

  /**
   * Extract ZIP file to destination
   */
  private async extractZip(zipPath: string, extractPath: string): Promise<void> {
    try {
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractPath, true);
      console.log(formatLogMessage('info', 'ProcessManager', `Extracted agent to: ${extractPath}`));
    } catch (error) {
      throw new Error(`Failed to extract ZIP: ${error}`);
    }
  }

  /**
   * Download and extract agent from API
   */
  private async downloadAgent(agentId: string): Promise<boolean> {
    try {
      console.log(formatLogMessage('info', 'ProcessManager', `Fetching agent details for ${agentId}...`));
      
      // First, get agent details from API
      const agentDetailResponse = await axios.get<AgentDetailResponse>(
        `https://api.codebolt.ai/api/agents/detail?id=${agentId}`
      );
      
      const {
        id,
        title,
        avatarSrc,
        avatarFallback,
        description,
        longDescription,
        zipFilePath,
        tags,
        version,
      } = agentDetailResponse.data;
      
      if (!zipFilePath) {
        throw new Error(`No zipFilePath found for agent ${agentId}`);
      }
      
      console.log(formatLogMessage('info', 'ProcessManager', `Found agent "${title}" (v${version}), downloading from: ${zipFilePath}`));
      
      const agentPath = this.getAgentPath(agentId);
      const zipPath = path.join(agentPath, 'agent.zip');
      
      // Ensure the agent directory exists
      fs.mkdirSync(agentPath, { recursive: true });
      
      // Download the agent ZIP from the zipFilePath
      await this.downloadFile(zipFilePath, zipPath);
      
      console.log(formatLogMessage('info', 'ProcessManager', `Downloaded agent ${agentId} to ${zipPath}`));
      
      // Extract the ZIP file
      await this.extractZip(zipPath, agentPath);
      
      // Clean up the ZIP file
      fs.unlinkSync(zipPath);
      
      // Verify index.js exists
      const indexPath = this.getAgentIndexPath(agentId);
      if (!fs.existsSync(indexPath)) {
        throw new Error(`index.js not found in extracted agent at ${indexPath}`);
      }
      
      // Save agent metadata for future reference
      const metadataPath = path.join(agentPath, 'agent-metadata.json');
      const metadata = {
        id,
        title,
        description,
        version,
        downloadedAt: new Date().toISOString(),
        zipFilePath
      };
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      
      console.log(formatLogMessage('info', 'ProcessManager', `Agent "${title}" (${agentId}) v${version} downloaded and extracted successfully`));
      return true;
      
    } catch (error) {
      console.error(formatLogMessage('error', 'ProcessManager', `Failed to download agent ${agentId}: ${error}`));
      
      // Clean up on failure
      const agentPath = this.getAgentPath(agentId);
      if (fs.existsSync(agentPath)) {
        fs.rmSync(agentPath, { recursive: true, force: true });
      }
      
      return false;
    }
  }

  /**
   * Check if agent exists locally, download if not
   */
  private async ensureAgentExists(agentId: string): Promise<boolean> {
    const agentPath = this.getAgentPath(agentId);
    const agentIndexPath = this.getAgentIndexPath(agentId);
    
    // Check if agent folder already exists
    if (fs.existsSync(agentPath)) {
      console.log(formatLogMessage('info', 'ProcessManager', `Agent folder ${agentId} already exists at ${agentPath}`));
      
      // Double-check that index.js exists in the folder
      if (fs.existsSync(agentIndexPath)) {
        console.log(formatLogMessage('info', 'ProcessManager', `Agent ${agentId} found locally with valid index.js`));
        return true;
      } else {
        console.log(formatLogMessage('warn', 'ProcessManager', `Agent folder exists but index.js missing, removing folder and re-downloading...`));
        // Remove corrupted folder and re-download
        fs.rmSync(agentPath, { recursive: true, force: true });
      }
    }
    
    // Agent folder doesn't exist or was corrupted, try to download it
    console.log(formatLogMessage('info', 'ProcessManager', `Agent ${agentId} not found locally, downloading...`));
    return await this.downloadAgent(agentId);
  }

  /**
   * Start the sample client process
   */
  async startSampleClient(): Promise<void> {
    if (this.sampleClientProcess) {
      console.log(formatLogMessage('warn', 'ProcessManager', 'Sample client already running'));
      return;
    }

    console.log(formatLogMessage('info', 'ProcessManager', 'Starting Sample Codebolt Client...'));
    
    // Check for bundled client in shared volume first
    const bundledClientPath = '/app/shared/client-bundles/sampleclient.js';
    const legacyClientPath = path.resolve(__dirname, '../../../samplecodeboltclient');
    
    let clientExists = false;
    let useBundle = false;
    
    try {
      // Check if bundled client exists in shared volume
      const fs = require('fs');
      if (fs.existsSync(bundledClientPath)) {
        clientExists = true;
        useBundle = true;
        console.log(formatLogMessage('info', 'ProcessManager', 'Using bundled client from shared volume'));
      } else if (fs.existsSync(legacyClientPath)) {
        clientExists = true;
        console.log(formatLogMessage('info', 'ProcessManager', 'Using legacy client build'));
      }
    } catch (error) {
      console.log(formatLogMessage('warn', 'ProcessManager', `Error checking client paths: ${error}`));
    }
    
    if (!clientExists) {
      console.log(formatLogMessage('warn', 'ProcessManager', 'No client found, skipping client startup'));
      return;
    }
    
    // Start the appropriate client
    if (useBundle) {
      // Start bundled client directly
      this.sampleClientProcess = spawn('node', [bundledClientPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env }
      });
    } else {
      // Start legacy client via npm
      this.sampleClientProcess = spawn('npm', ['run', 'dev'], {
        cwd: legacyClientPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });
    }

    this.sampleClientProcess.stdout?.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(formatLogMessage('info', 'SampleClient', output));
      }
    });

    this.sampleClientProcess.stderr?.on('data', (data) => {
      const error = data.toString().trim();
      if (error) {
        console.error(formatLogMessage('error', 'SampleClient', error));
      }
    });

    this.sampleClientProcess.on('error', (error) => {
      console.error(formatLogMessage('error', 'ProcessManager', `Failed to start Sample Client: ${error}`));
    });

    this.sampleClientProcess.on('exit', (code, signal) => {
      console.log(formatLogMessage('info', 'ProcessManager', `Sample Client process exited with code ${code}, signal ${signal}`));
      this.sampleClientProcess = null;
    });
  }

  /**
   * Stop the sample client process
   */
  async stopSampleClient(): Promise<void> {
    if (!this.sampleClientProcess) {
      return;
    }

    console.log(formatLogMessage('info', 'ProcessManager', 'Stopping Sample Client...'));
    
    this.sampleClientProcess.kill('SIGTERM');
    
    // Wait for graceful shutdown
    await sleep(1000);
    
    // Force kill if still running
    if (this.sampleClientProcess && !this.sampleClientProcess.killed) {
      this.sampleClientProcess.kill('SIGKILL');
    }
    
    this.sampleClientProcess = null;
  }

/**
    * Start agent based on type and detail
    */
  async startAgentByType(agentType: string, agentDetail: string, applicationId: string): Promise<boolean> {
    console.log(formatLogMessage('info', 'ProcessManager', `Starting agent of type ${agentType} with detail: ${agentDetail}`));
    
    try {
      switch (agentType) {
        case 'marketplace':
          return await this.startAgent(agentDetail, applicationId);
          
        case 'local-path':
          return await this.startLocalAgent(agentDetail, applicationId);
          
        case 'local-zip':
          return await this.startAgentFromZip(agentDetail, applicationId);
          
        case 'server-zip':
          return await this.startAgentFromServerZip(agentDetail, applicationId);
          
        default:
          console.error(formatLogMessage('error', 'ProcessManager', `Unknown agent type: ${agentType}`));
          return false;
      }
    } catch (error) {
      console.error(formatLogMessage('error', 'ProcessManager', `Failed to start agent of type ${agentType}: ${error}`));
      return false;
    }
  }

  /**
    * Start a local agent from directory path
    */
  private async startLocalAgent(agentPath: string, applicationId: string): Promise<boolean> {
    const agentId = path.basename(agentPath);
    const indexPath = path.join(agentPath, 'index.js');
    
    if (!fs.existsSync(indexPath)) {
      console.error(formatLogMessage('error', 'ProcessManager', `index.js not found in agent path: ${indexPath}`));
      return false;
    }
    
    if (this.agentProcesses.has(agentId)) {
      console.log(formatLogMessage('warn', 'ProcessManager', `Agent ${agentId} already running`));
      return true;
    }
    
    try {
      const agentProcess = spawn('node', [indexPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: agentPath,
        env: { 
          ...process.env,
          parentId: applicationId,
          agentId: agentId,
          SOCKET_PORT: '3001'
        }
      });

      this.agentProcesses.set(agentId, agentProcess);
      this.setupAgentProcessHandlers(agentId, agentProcess);
      
      console.log(formatLogMessage('info', 'ProcessManager', `Local agent ${agentId} started successfully from ${agentPath}`));
      return true;
    } catch (error) {
      console.error(formatLogMessage('error', 'ProcessManager', `Error starting local agent ${agentId}: ${error}`));
      return false;
    }
  }

  /**
    * Start agent from local ZIP file
    */
  private async startAgentFromZip(zipPath: string, applicationId: string): Promise<boolean> {
    if (!fs.existsSync(zipPath)) {
      console.error(formatLogMessage('error', 'ProcessManager', `ZIP file not found: ${zipPath}`));
      return false;
    }
    
    const agentId = `zip-agent-${Date.now()}`;
    const agentPath = this.getAgentPath(agentId);
    
    try {
      // Ensure the agent directory exists
      fs.mkdirSync(agentPath, { recursive: true });
      
      // Extract the ZIP file
      await this.extractZip(zipPath, agentPath);
      
      // Verify index.js exists
      const indexPath = this.getAgentIndexPath(agentId);
      if (!fs.existsSync(indexPath)) {
        throw new Error(`index.js not found in extracted agent at ${indexPath}`);
      }
      
      // Start the agent
      return await this.startLocalAgent(agentPath, applicationId);
    } catch (error) {
      console.error(formatLogMessage('error', 'ProcessManager', `Failed to start agent from ZIP ${zipPath}: ${error}`));
      
      // Clean up on failure
      if (fs.existsSync(agentPath)) {
        fs.rmSync(agentPath, { recursive: true, force: true });
      }
      
      return false;
    }
  }

  /**
    * Start agent from server ZIP URL
    */
  private async startAgentFromServerZip(zipUrl: string, applicationId: string): Promise<boolean> {
    const agentId = `server-agent-${Date.now()}`;
    const agentPath = this.getAgentPath(agentId);
    const zipPath = path.join(agentPath, 'agent.zip');
    
    try {
      // Ensure the agent directory exists
      fs.mkdirSync(agentPath, { recursive: true });
      
      // Download the ZIP file
      await this.downloadFile(zipUrl, zipPath);
      
      // Extract and start
      return await this.startAgentFromZip(zipPath, applicationId);
    } catch (error) {
      console.error(formatLogMessage('error', 'ProcessManager', `Failed to start agent from server ZIP ${zipUrl}: ${error}`));
      
      // Clean up on failure
      if (fs.existsSync(agentPath)) {
        fs.rmSync(agentPath, { recursive: true, force: true });
      }
      
      return false;
    }
  }

  /**
    * Setup common process event handlers for agents
    */
  private setupAgentProcessHandlers(agentId: string, agentProcess: ChildProcess): void {
    agentProcess.stdout?.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(formatLogMessage('info', `Agent-${agentId}`, output));
      }
    });

    agentProcess.stderr?.on('data', (data) => {
      const error = data.toString().trim();
      if (error) {
        console.error(formatLogMessage('error', `Agent-${agentId}`, error));
      }
    });

    agentProcess.on('error', (error) => {
      console.error(formatLogMessage('error', 'ProcessManager', `Failed to start agent ${agentId}: ${error}`));
      this.agentProcesses.delete(agentId);
    });

    agentProcess.on('exit', (code, signal) => {
      console.log(formatLogMessage('info', 'ProcessManager', `Agent ${agentId} process exited with code ${code}, signal ${signal}`));
      this.agentProcesses.delete(agentId);
    });
  }

  /**
    * Start an agent with a specific ID
    */
  async startAgent(agentId: string, applicationId: string): Promise<boolean> {
    if (this.agentProcesses.has(agentId)) {
      console.log(formatLogMessage('warn', 'ProcessManager', `Agent ${agentId} already running`));
      return true;
    }

    console.log(formatLogMessage('info', 'ProcessManager', `Starting agent ${agentId}...`));
    
    // First, ensure the agent exists (download if necessary)
    const agentAvailable = await this.ensureAgentExists(agentId);
    if (!agentAvailable) {
      console.log(formatLogMessage('error', 'ProcessManager', `Failed to ensure agent ${agentId} is available`));
      return false;
    }
    
    // Get the OS-specific agent path
    const agentIndexPath = this.getAgentIndexPath(agentId);
    const agentWorkingDir = this.getAgentPath(agentId);
    
    // Fallback to legacy paths if OS-specific path doesn't exist
    let finalAgentPath = agentIndexPath;
    let finalWorkingDir = agentWorkingDir;
    
   
    
    try {
      // Start the agent process
      const agentProcess = spawn('node', [finalAgentPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: finalWorkingDir, // Set working directory to agent's directory
        env: { 
          ...process.env,
          parentId: applicationId,
          agentId: agentId,
          SOCKET_PORT: '3001'
        }
      });

      // Store the process
      this.agentProcesses.set(agentId, agentProcess);

      // Set up process event handlers
      agentProcess.stdout?.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          console.log(formatLogMessage('info', `Agent-${agentId}`, output));
        }
      });

      agentProcess.stderr?.on('data', (data) => {
        const error = data.toString().trim();
        if (error) {
          console.error(formatLogMessage('error', `Agent-${agentId}`, error));
        }
      });

      agentProcess.on('error', (error) => {
        console.error(formatLogMessage('error', 'ProcessManager', `Failed to start agent ${agentId}: ${error}`));
        this.agentProcesses.delete(agentId);
      });

      agentProcess.on('exit', (code, signal) => {
        console.log(formatLogMessage('info', 'ProcessManager', `Agent ${agentId} process exited with code ${code}, signal ${signal}`));
        this.agentProcesses.delete(agentId);
      });

      console.log(formatLogMessage('info', 'ProcessManager', `Agent ${agentId} started successfully`));
      return true;
      
    } catch (error) {
      console.error(formatLogMessage('error', 'ProcessManager', `Error starting agent ${agentId}: ${error}`));
      return false;
    }
  }

  /**
   * Stop a specific agent
   */
  async stopAgent(agentId: string): Promise<void> {
    const agentProcess = this.agentProcesses.get(agentId);
    if (!agentProcess) {
      console.log(formatLogMessage('warn', 'ProcessManager', `Agent ${agentId} not found`));
      return;
    }

    console.log(formatLogMessage('info', 'ProcessManager', `Stopping agent ${agentId}...`));
    
    agentProcess.kill('SIGTERM');
    
    // Wait for graceful shutdown
    await sleep(1000);
    
    // Force kill if still running
    if (!agentProcess.killed) {
      agentProcess.kill('SIGKILL');
    }
    
    this.agentProcesses.delete(agentId);
    console.log(formatLogMessage('info', 'ProcessManager', `Agent ${agentId} stopped`));
  }

  /**
   * Check if an agent is running
   */
  isAgentRunning(agentId: string): boolean {
    return this.agentProcesses.has(agentId);
  }

  /**
   * Get all running agent IDs
   */
  getRunningAgents(): string[] {
    return Array.from(this.agentProcesses.keys());
  }

  /**
   * Get agent storage information for debugging
   */
  getAgentStorageInfo(): { storageBasePath: string; platform: string } {
    return {
      storageBasePath: this.getAgentStoragePath(),
      platform: os.platform()
    };
  }

  /**
   * Get agent metadata if it exists
   */
  getAgentMetadata(agentId: string): any | null {
    try {
      const metadataPath = path.join(this.getAgentPath(agentId), 'agent-metadata.json');
      if (fs.existsSync(metadataPath)) {
        const metadata = fs.readFileSync(metadataPath, 'utf8');
        return JSON.parse(metadata);
      }
      return null;
    } catch (error) {
      console.error(formatLogMessage('error', 'ProcessManager', `Failed to read agent metadata for ${agentId}: ${error}`));
      return null;
    }
  }

  /**
   * Stop all managed processes
   */
  async stopAll(): Promise<void> {
    await this.stopSampleClient();
    
    // Stop all agents
    const agentIds = Array.from(this.agentProcesses.keys());
    for (const agentId of agentIds) {
      await this.stopAgent(agentId);
    }
  }
}