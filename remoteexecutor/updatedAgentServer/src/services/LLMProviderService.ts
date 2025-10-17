import { LLMProvider } from '@codebolt/types/apis/llm-providers';
import { CodeboltApplicationPath,getUserHomePath } from '../config';
import { getProviders } from "@arrowai/multillm";
import fs from 'fs';
import path from 'path';
import { Model } from '@codebolt/types/apis/models';
import { logger } from '@/utils/logger';

export class LLMProviderService {
    private static instance: LLMProviderService | null = null;
    private llmProviders: Map<string, LLMProvider>;

    private constructor() {
        this.llmProviders = new Map();
        // this.getLLMProviders()
    }

    public static getInstance(): LLMProviderService {
        if (!LLMProviderService.instance) {
            LLMProviderService.instance = new LLMProviderService();
        }
        return LLMProviderService.instance;
    }

    /**
     * Get LLM providers from local file
     * @returns Promise resolving to array of LLM providers
     */
    public async getLLMProviders(): Promise<LLMProvider[]> {
        try {
            const configPath = path.join(getUserHomePath(), 'config.json');
            // Read and parse the JSON file
            const configFile = fs.readFileSync(configPath, 'utf8');
            const {providers} = JSON.parse(configFile);

            logger.info("list of configured providers",JSON.stringify(providers)

            // If we have providers in the file, process them
            if (providers && Array.isArray(providers)) {
                providers.forEach((provider) => {
                    const key = provider.name.replace(/\s+/g, '').toLowerCase();
                    if (key) {
                        this.llmProviders.set(key, provider);
                    }
                });
                return Array.from(this.llmProviders.values());
            }

            // Return empty array if no providers found
            return [];
        } catch (error) {
            logger.error('Error reading LLM provider config:', error);
            // Return empty array in case of error
            return [];
        }
    }



      /**
     * Get LLM providers from local file
     * @returns Promise resolving to array of LLM providers
     */
    public async getConfiguredLLMProviders(): Promise<{providers:LLMProvider[],custom_model_config:Model | null}> {
        try {
            const configPath = path.join(getUserHomePath(), 'config.json');
            // Read and parse the JSON file
            const configFile = fs.readFileSync(configPath, 'utf8');
            const config = JSON.parse(configFile);
            const providers = config.providers || [];
            const custom_model_config = config.custom_model_config ? config.custom_model_config as Model : null;

            // If we have providers in the file, process them
            if (providers && Array.isArray(providers)) {
                providers.forEach((provider) => {
                    const key = provider.name.replace(/\s+/g, '').toLowerCase();
                    if (key) {
                        this.llmProviders.set(key, provider);
                    }
                });
                return {providers: Array.from(this.llmProviders.values()),custom_model_config};
            }

            // Return empty array if no providers found
            return {providers: [],custom_model_config};
        } catch (error) {
            logger.error('Error reading LLM provider config:', error);
            // Return empty array in case of error
            return {providers: [],custom_model_config: null};
        }
    }
    /**
     * Get LLM providers list
     * @returns Array of LLM providers
     */
    public getLLMProvidersList(): LLMProvider[] {
        return Array.from(this.llmProviders.values());
    }

    /**
     * Get a specific LLM provider by key
     * @param key - The key or name of the provider
     * @returns The LLM provider or undefined if not found
     */
    public getLLMProvider(key: string): LLMProvider | undefined {
        // Normalize the key for consistent lookup
        const normalizedKey = key.replace(/\s+/g, '').toLowerCase();
        return this.llmProviders.get(normalizedKey);
    }
}