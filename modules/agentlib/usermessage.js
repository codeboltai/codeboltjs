"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMessage = void 0;
const fs_1 = __importDefault(require("./../fs"));
const project_1 = __importDefault(require("./../project"));
const tools_1 = __importDefault(require("./../tools"));
class UserMessage {
    constructor(message, promptOverride = false) {
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
    getFiles() {
        // Implementation to be added
    }
    async toPrompt(bAttachFiles = true, bAttachImages = true, bAttachEnvironment = true) {
        var _a;
        if (bAttachFiles) {
            if (this.promptOverride) {
                // Use a rendering engine
            }
            else {
                let finalPrompt = `
                    The user has sent the following query:
                    ${this.message.userMessage}.
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
    getMentionedAgents() {
        //TODO : get config in tool format if neede
        return this.message.mentionedAgents || [];
    }
    getMentionedMcps() {
        return this.message.mentionedMCPs || [];
    }
    async getMentionedMcpsTools() {
        if (this.mentionedMCPs.length > 0) {
            let tools = await tools_1.default.listToolsFromToolBoxes(this.mentionedMCPs);
            return tools;
        }
        else {
            return [];
        }
    }
}
exports.UserMessage = UserMessage;
