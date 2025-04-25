"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMessage = void 0;
const fs_1 = __importDefault(require("./../fs"));
const project_1 = __importDefault(require("./../project"));
const tools_1 = __importDefault(require("./../tools"));
/**
 * Class that processes and manages user messages.
 * Handles converting messages to prompts and extracting mentioned entities.
 */
class UserMessage {
    /**
     * Creates a new UserMessage instance.
     *
     * @param message - The message content and metadata
     * @param promptOverride - Whether to override default prompt generation
     */
    constructor(message, promptOverride = false) {
        /**
         * Gets environment details for the current working directory.
         *
         * @param cwd - The current working directory path
         * @returns Promise with a string containing environment details
         */
        this.getEnvironmentDetail = async (cwd) => {
            let details = "";
            const { success, result } = await fs_1.default.listFile(cwd, true);
            details += `\n\n# Current Working Directory (${cwd}) Files\n${result}
            ? "\n(Note: Only top-level contents shown for Desktop by default. Use list_files to explore further if necessary.)"
            : ""
            }`;
            return `<environment_details>\n${details.trim()}\n</environment_details>`;
        };
        this.message = message;
        this.promptOverride = promptOverride;
        this.userMessages = [];
        this.mentionedMCPs = message.mentionedMCPs || [];
    }
    /**
     * Gets files mentioned in the message.
     * Currently a placeholder for implementation.
     */
    getFiles() {
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
    async toPrompt(bAttachFiles = true, bAttachImages = true, bAttachEnvironment = true) {
        var _a;
        if (bAttachFiles) {
            if (this.promptOverride) {
                // Use a rendering engine
            }
            else {
                let finalPrompt = `
                    The user has sent the following query:
                   <user_query> ${this.message.userMessage} </user_query>.
                `;
                if ((_a = this.message.mentionedFiles) === null || _a === void 0 ? void 0 : _a.length) {
                    finalPrompt += `The Attached files are:`;
                    for (const file of this.message.mentionedFiles) {
                        let filedata = await fs_1.default.readFile(file);
                        finalPrompt += `File Name: ${file}, File Path: ${file}, Filedata: ${filedata}`;
                    }
                }
                this.userMessages.push({ type: "text", text: finalPrompt });
            }
        }
        if (bAttachEnvironment) {
            let { projectPath } = await project_1.default.getProjectPath();
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
        console.log("mentionedMCPs", this.mentionedMCPs);
        if (this.mentionedMCPs.length > 0) {
            console.log("mentionedMCPs", this.mentionedMCPs);
            let tools = await tools_1.default.listToolsFromToolBoxes(this.mentionedMCPs);
            console.log("tools", tools);
            return tools;
        }
        else {
            return [];
        }
    }
}
exports.UserMessage = UserMessage;
