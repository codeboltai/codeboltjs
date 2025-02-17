/**
 * SystemPrompt class for loading and managing system prompts from YAML files
 */
declare class SystemPrompt {
    private filepath;
    private key;
    /**
     * Creates a SystemPrompt instance
     * @param {string} filepath - Path to the YAML file containing prompts
     * @param {string} key - Key identifier for the specific prompt
     */
    constructor(filepath?: string, key?: string);
    /**
     * Loads and returns the prompt text
     * @returns {string} The prompt text
     * @throws {Error} If file cannot be read or parsed
     */
    toPromptText(): string;
}
export { SystemPrompt };
