"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemPrompt = void 0;
const js_yaml_1 = __importDefault(require("js-yaml"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * SystemPrompt class for loading and managing system prompts from YAML files
 */
class SystemPrompt {
    /**
     * Creates a SystemPrompt instance
     * @param {string} filepath - Path to the YAML file containing prompts
     * @param {string} key - Key identifier for the specific prompt
     */
    constructor(filepath = "", key = "") {
        this.filepath = filepath;
        this.key = key;
    }
    /**
     * Loads and returns the prompt text
     * @returns {string} The prompt text
     * @throws {Error} If file cannot be read or parsed
     */
    toPromptText() {
        var _a;
        try {
            const absolutePath = path_1.default.resolve(this.filepath);
            const fileContents = fs_1.default.readFileSync(absolutePath, 'utf8');
            const data = js_yaml_1.default.load(fileContents);
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid YAML structure');
            }
            if (!((_a = data[this.key]) === null || _a === void 0 ? void 0 : _a.prompt)) {
                throw new Error(`Prompt not found for key: ${this.key}`);
            }
            return data[this.key].prompt;
        }
        catch (error) {
            console.error(`SystemPrompt Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error; // Re-throw to allow caller handling
        }
    }
}
exports.SystemPrompt = SystemPrompt;
