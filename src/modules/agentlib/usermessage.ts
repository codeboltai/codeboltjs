import cbfs from "./../fs";
import project from "./../project";
import mcp from "./../tools";
import { escape } from "querystring";


interface Message {
    userMessage: string;
    mentionedFiles?: string[];
    mentionedMCPs: string[];
}

export interface UserMessageContent {
    type: string;
    text: string;
}

interface FileListResult {
    success: boolean;
    result: string;
}

class UserMessage {
    message: Message;
    promptOverride: boolean;
    userMessages: UserMessageContent[];
    mentionedMCPs: string[];

    constructor(message: Message, promptOverride: boolean = false) {
        this.message = message;
        this.promptOverride = promptOverride;
        this.userMessages = [];
        this.mentionedMCPs = message.mentionedMCPs || [];
    }

    getFiles(): void {
        // Implementation to be added
    }

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
                    ${this.message.userMessage}.
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

    getMentionedMcps(): string[] {
        return this.message.mentionedMCPs || [];
    }
    async getMentionedMcpsTools() {
        if (this.mentionedMCPs.length > 0) {
            let tools = await mcp.listToolsFromToolBoxes(this.mentionedMCPs)
            return tools
        }
        else {
            return []
        }
    }

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