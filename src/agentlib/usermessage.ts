import cbfs from "../modules/fs";
import project from "../modules/project";
import mcp from "../modules/tools";

/**
 * Interface representing an agent that can be referenced in user messages.
 */
interface agent {
    /** Short description of the agent */
    description: string;
    /** Title/name of the agent */
    title: string;
    /** Numeric ID of the agent */
    id: number;
    /** Agent identifier string */
    agent_id: string;
    /** Unique identifier for the agent */
    unique_id: string;
    /** Detailed description of the agent and its capabilities */
    longDescription: string;
}

/**
 * Interface for the user message structure.
 */
interface Message {
    /** The actual text content of the user message */
    userMessage: string;
    /** Optional list of files mentioned in the message */
    mentionedFiles?: string[];
    /** List of MCP (Model Context Protocol) tools mentioned */
    mentionedMCPs: { toolbox: string, toolName: string }[];
    /** List of agents mentioned in the message */
    mentionedAgents: agent[];
}

/**
 * Interface for a single content block within a user message.
 */
export interface UserMessageContent {
    /** Type of content (e.g., "text", "image") */
    type: string;
    /** The text content */
    text: string;
}

/**
 * Interface for file listing result.
 */
interface FileListResult {
    /** Whether the listing operation was successful */
    success: boolean;
    /** The result of the listing operation as a string */
    result: string;
}

/**
 * Class that processes and manages user messages.
 * Handles converting messages to prompts and extracting mentioned entities.
 */
class UserMessage {
    /** The message content and metadata */
    message: Message;
    /** Whether to override the default prompt generation */
    promptOverride: boolean;
    /** Array of content blocks for the user message */
    userMessages: UserMessageContent[];
    /** List of MCP tools mentioned in the message */
    mentionedMCPs: { toolbox: string, toolName: string }[];

    /**
     * Creates a new UserMessage instance.
     * 
     * @param message - The message content and metadata
     * @param promptOverride - Whether to override default prompt generation
     */
    constructor(message: Message, promptOverride: boolean = false) {
        this.message = message;
        
        this.promptOverride = promptOverride;
        this.userMessages = [];
        this.mentionedMCPs = message.mentionedMCPs || [];
    }

    /**
     * Gets files mentioned in the message.
     * Currently a placeholder for implementation.
     */
    getFiles(): void {
        // Implementation to be added
    }

    /**
     * Converts the user message to a prompt format.
     * 
     * @param bAttachFiles - Whether to attach file contents
     * @param bAttachImages - Whether to attach images
     * @param bAttachEnvironment - Whether to attach environment details
     * @returns Promise with an array of content blocks for the prompt
     */
    async toPrompt(
        bAttachFiles: boolean = true,
        bAttachImages: boolean = true,
        bAttachEnvironment: boolean = true
    ): Promise<UserMessageContent[]> {
        if (bAttachFiles) {
            if (this.promptOverride) {
                // Use a rendering engine
            } else {
                let finalPrompt = `
                    The user has sent the following query:
                   <user_query> ${this.message.userMessage} </user_query>.
                `;
                if (this.message.mentionedFiles?.length) {
                    finalPrompt += `The Attached files are:`;
                    for (const file of this.message.mentionedFiles) {
                        let filedata = await cbfs.readFile(file);
                        finalPrompt += `File Name: ${file}, File Path: ${file}, Filedata: ${filedata}`;
                    }
                }
                this.userMessages.push({ type: "text", text: finalPrompt });
            }
        }

        if (bAttachEnvironment) {
            let { projectPath } = await project.getProjectPath();
            const environmentDetail = await this.getEnvironmentDetail(projectPath);
            this.userMessages.push({ type: "text", text: environmentDetail });
        }

        return this.userMessages;
    }

    /**
     * Gets agents mentioned in the message.
     * 
     * @returns Array of agent objects
     */
    getMentionedAgents() {
        //TODO : get config in tool format if neede
        return this.message.mentionedAgents || [];
    }

    /**
     * Gets MCP tools mentioned in the message.
     * 
     * @returns Array of MCP tool names
     */
    getMentionedMcps() {
      return this.message.mentionedMCPs || [];
    }

    /**
     * Gets MCP tools in a format suitable for the LLM.
     * 
     * @returns Promise with an array of MCP tools
     */
    async getMentionedMcpsTools() {
        if (this.mentionedMCPs.length > 0) {
            const {data} = await mcp.getTools(this.mentionedMCPs);
            return data;
        }
        else {
            return []
        }
    }

    /**
     * Gets environment details for the current working directory.
     * 
     * @param cwd - The current working directory path
     * @returns Promise with a string containing environment details
     */
    private getEnvironmentDetail = async (cwd: string): Promise<string> => {
        let details = "";
        const { success, result }: FileListResult = await cbfs.listFile(cwd, true);
        details += `\n\n# Current Working Directory (${cwd}) Files\n${result}
            ? "\n(Note: Only top-level contents shown for Desktop by default. Use list_files to explore further if necessary.)"
            : ""
            }`;
        return `<environment_details>\n${details.trim()}\n</environment_details>`;
    }
}

export { UserMessage };