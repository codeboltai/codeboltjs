import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class AgentManager {
  private agentProcess: any = null;

  constructor() {
    // No need to create data directory - we write to project root
  }

  private getDataFilePath(): string {
    return join(__dirname, '../../agent/dist/data.json');
  }

  private writeGraphDataToFile(graphData: any, message?: string): string {
    const dataFilePath = this.getDataFilePath();
    const dataToWrite = {
      graphData,
      message
    };

    writeFileSync(dataFilePath, JSON.stringify(dataToWrite, null, 2));
    console.log('Graph data written to:', dataFilePath);

    return dataFilePath;
  }

  private readGraphDataFromFile(): { graphData: any; message?: string } | null {
    const dataFilePath = this.getDataFilePath();

    if (!existsSync(dataFilePath)) {
      return null;
    }

    const fileContents = readFileSync(dataFilePath, 'utf-8');
    const parsed = JSON.parse(fileContents);

    return {
      graphData: parsed?.graphData ?? null,
      message: parsed?.message ?? ''
    };
  }

  private async executeAgentWithGraphData(graphData: any, message?: string): Promise<any> {
    try {
      // Write graph data and message to data.json file in the project root
      // Agent runs from project root and looks for data.json there
      this.writeGraphDataToFile(graphData, message);

      // Start the agent process
      const agentPath = this.getDataFilePath();
      console.log('Starting agent process from:', agentPath);

      return new Promise((resolve, reject) => {
        const agentProcess = spawn('node', [agentPath], {
          stdio: ['ignore', 'pipe', 'pipe'], // stdin ignored, stdout and stderr as pipes
          env: { ...process.env, NODE_AGENT_CLI: 'true' },
          cwd: process.cwd()
        });

        if (!agentProcess) {
          reject(new Error('Failed to spawn agent process'));
          return;
        }

        console.log('Agent process spawned with PID:', agentProcess.pid);

        let agentReady = false;
        let responseBuffer = '';

        // Handle stdout from agent
        if (agentProcess.stdout) {
          agentProcess.stdout.on('data', (data: Buffer) => {
            const responses = data.toString().split('\n').filter((line: string) => line.trim());

            for (const response of responses) {
              try {
                const parsed = JSON.parse(response);

                if (parsed.ready) {
                  agentReady = true;
                  console.log('Agent process is ready - auto-executing');
                  // Agent will auto-execute, no need to send commands
                  continue;
                }

                // This is the execution result
                resolve(parsed);
                agentProcess.kill();
              } catch (error) {
                // Ignore non-JSON responses during initialization
                if (!response.includes('Agent initialized')) {
                  console.error('Failed to parse agent response:', response);
                }
              }
            }
          });
        }

        // Handle stderr from agent
        if (agentProcess.stderr) {
          agentProcess.stderr.on('data', (data: Buffer) => {
            console.error('Agent stderr:', data.toString());
          });
        }

        // Handle agent process completion
        agentProcess.on('close', (code: number) => {
          console.log(`Agent process exited with code ${code}`);

          if (!agentReady && code !== 0) {
            reject(new Error('Agent process failed to start or exited with error'));
          }
        });

        // Handle agent process errors
        agentProcess.on('error', (error: Error) => {
          console.error('Agent process error:', error);
          reject(error);
        });

        // Set a timeout for the entire operation
        const timeout = setTimeout(() => {
          agentProcess.kill();
          reject(new Error('Agent execution timeout'));
        }, 60000); // 60 second timeout

        // Clear timeout when promise resolves
        Promise.resolve().then(() => clearTimeout(timeout));
      });

    } catch (error) {
      console.error('Failed to execute graph:', error);
      throw error;
    }
  }

  async executeGraph(graphData: any, message?: string): Promise<any> {
    try {
      const result = await this.executeAgentWithGraphData(graphData, message);
      return result;
    } catch (error) {
      console.error('Failed to execute graph:', error);
      throw error;
    }
  }

  async saveGraph(graphData: any, message?: string): Promise<void> {
    try {
      this.writeGraphDataToFile(graphData, message);
    } catch (error) {
      console.error('Failed to save graph:', error);
      throw error;
    }
  }

  async loadGraph(): Promise<{ graphData: any; message?: string } | null> {
    try {
      return this.readGraphDataFromFile();
    } catch (error) {
      console.error('Failed to load graph:', error);
      throw error;
    }
  }

  async getStatus(): Promise<any> {
    // Since we're not keeping a persistent agent, just return basic status
    return {
      isRunning: false,
      hasGraph: false,
      mode: 'on-demand'
    };
  }

  async stop(): Promise<void> {
    // No persistent agent to stop
    console.log('No persistent agent to stop');
  }

  async shutdown(): Promise<void> {
    // No persistent agent to shutdown
    console.log('No persistent agent to shutdown');
  }

  restart(): void {
    // No persistent agent to restart
    console.log('No persistent agent to restart');
  }
}

export default AgentManager;