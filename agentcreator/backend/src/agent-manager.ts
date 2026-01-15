import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import PluginHandlerLoader from './services/PluginHandlerLoader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class AgentManager {
  private agentProcess: any = null;
  private pluginHandlerLoader: PluginHandlerLoader;
  private pluginsLoaded: boolean = false;

  constructor() {
    // No need to create data directory - we write to project root
    this.pluginHandlerLoader = PluginHandlerLoader.getInstance();
  }

  /**
   * Initialize plugin handlers
   */
  async initialize(): Promise<void> {
    if (this.pluginsLoaded) {
      return;
    }

    try {
      console.log('Loading plugin handlers...');
      const plugins = await this.pluginHandlerLoader.loadPlugins();

      // Register handlers for each plugin
      for (const plugin of plugins) {
        await this.pluginHandlerLoader.registerPluginHandlers(plugin);
      }

      this.pluginsLoaded = true;
      console.log(`Successfully loaded ${plugins.length} plugin handlers`);
    } catch (error) {
      console.error('Failed to initialize plugin handlers:', error);
      // Continue without plugins if initialization fails
    }
  }

  /**
   * Execute a node using plugin handler if available
   */
  async executeNodeWithPlugin(nodeType: string, nodeData: any, inputData: any[]): Promise<any> {
    if (!this.pluginsLoaded) {
      await this.initialize();
    }

    try {
      return await this.pluginHandlerLoader.executeNode(nodeType, nodeData, inputData);
    } catch (error) {
      console.error(`Failed to execute node ${nodeType} with plugin:`, error);
      throw error;
    }
  }

  /**
   * Check if a node type has a plugin handler
   */
  hasPluginHandler(nodeType: string): boolean {
    return this.pluginsLoaded && this.pluginHandlerLoader.hasHandler(nodeType);
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
      const agentPath = join(__dirname, '../../agent/dist/index.js');
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
      // Initialize plugins before execution
      await this.initialize();

      // Process graph with plugin handlers if available
      const processedGraphData = await this.processGraphWithPlugins(graphData);

      const result = await this.executeAgentWithGraphData(processedGraphData, message);
      return result;
    } catch (error) {
      console.error('Failed to execute graph:', error);
      throw error;
    }
  }

  /**
   * Process graph nodes with plugin handlers before execution
   */
  private async processGraphWithPlugins(graphData: any): Promise<any> {
    if (!this.pluginsLoaded || !graphData || !graphData.nodes) {
      return graphData;
    }

    const processedNodes = [];

    for (const node of graphData.nodes) {
      try {
        // Check if this node has a plugin handler
        if (this.hasPluginHandler(node.type)) {
          console.log(`Processing node ${node.type} with plugin handler`);

          // Get input data from connected nodes
          const inputData = this.getNodeInputData(node, graphData);

          // Execute node with plugin handler
          const result = await this.executeNodeWithPlugin(node.type, node, inputData);

          // Update node with result
          processedNodes.push({
            ...node,
            outputData: result
          });
        } else {
          // Keep node as-is if no plugin handler
          processedNodes.push(node);
        }
      } catch (error) {
        console.error(`Failed to process node ${node.type}:`, error);
        // Keep original node if processing fails
        processedNodes.push(node);
      }
    }

    return {
      ...graphData,
      nodes: processedNodes
    };
  }

  /**
   * Get input data for a node from connected nodes
   */
  private getNodeInputData(node: any, graphData: any): any[] {
    const inputData: any[] = [];

    if (!graphData.links) {
      return inputData;
    }

    // Find all input links for this node
    const inputLinks = graphData.links.filter((link: any) =>
      link.target_id === node.id && link.target_slot !== undefined
    );

    // Sort links by target_slot to maintain order
    inputLinks.sort((a: any, b: any) => a.target_slot - b.target_slot);

    // Get data from source nodes
    for (const link of inputLinks) {
      const sourceNode = graphData.nodes.find((n: any) => n.id === link.origin_id);
      if (sourceNode && sourceNode.outputData !== undefined) {
        inputData.push(sourceNode.outputData);
      } else {
        inputData.push(null);
      }
    }

    return inputData;
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