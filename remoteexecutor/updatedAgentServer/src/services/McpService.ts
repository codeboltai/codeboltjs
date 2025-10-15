import {CodeboltApplicationPath} from "./../config";
import fs from 'fs';
import path from 'path';

export class McpService {
    private static instance: McpService;
    private constructor() {

    }
    public static getInstance(): McpService {
        if (!McpService.instance) {
            McpService.instance = new McpService();
        }
        return McpService.instance;
    }
    
    public async getMcpConfig(): Promise<any> {
      
    }
    
    /**
     * Get list of MCP servers from JSON file
     * @returns Promise resolving to array of MCP server configurations
     */
    public async getMcpServers(): Promise<any[]> {
        try {
            const configPath = path.join(CodeboltApplicationPath(), 'mcp_server.json');
            
            // Check if file exists
            if (!fs.existsSync(configPath)) {
                // Return empty array if file doesn't exist
                return [];
            }
            
            // Read and parse the JSON file
            const configFile = fs.readFileSync(configPath, 'utf8');
            const config = JSON.parse(configFile);
            
            // Return servers array or empty array if not found
            return config.mcpServers || [];
        } catch (error) {
            console.error('Error reading MCP server config:', error);
            // Return empty array in case of error
            return [];
        }
    }
}