import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

interface PromptData {
    [key: string]: {
        prompt: string;
    };
}

/**
 * SystemPrompt class for loading and managing system prompts from YAML files
 */
class SystemPrompt {
    private filepath: string;
    private key: string;

    /**
     * Creates a SystemPrompt instance
     * @param {string} filepath - Path to the YAML file containing prompts
     * @param {string} key - Key identifier for the specific prompt
     */
    constructor(filepath: string = "", key: string = "") {
        this.filepath = filepath;
        this.key = key;
    }

    /**
     * Loads and returns the prompt text
     * @returns {string} The prompt text
     * @throws {Error} If file cannot be read or parsed
     */
    toPromptText(): string {
        try {
            const absolutePath = path.resolve(this.filepath);
            const fileContents = fs.readFileSync(absolutePath, 'utf8');
            const data = yaml.load(fileContents) as PromptData;

            if (!data || typeof data !== 'object') {
                throw new Error('Invalid YAML structure');
            }

            if (!data[this.key]?.prompt) {
                throw new Error(`Prompt not found for key: ${this.key}`);
            }

            return data[this.key].prompt;
        } catch (error) {
            console.error(`SystemPrompt Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error; // Re-throw to allow caller handling
        }
    }
}

export { SystemPrompt };