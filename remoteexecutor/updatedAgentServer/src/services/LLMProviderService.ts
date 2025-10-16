import { LLMProvider } from '@codebolt/types/apis/llm-providers';
import { CodeboltApplicationPath } from '../config';
import { getProviders } from "@arrowai/multillm";
import fs from 'fs';
import path from 'path';

export class LLMProviderService {
    private static instance: LLMProviderService | null = null;
    private llmProviders: Map<string, LLMProvider>;

    private constructor() {
        this.llmProviders = new Map();
        this.getLLMProviders()
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
            const configPath = path.join(CodeboltApplicationPath(), 'llmprovider.json');

            // Check if llmprovider.json exists
            if (!fs.existsSync(configPath)) {
                // If file doesn't exist, get providers from getProviders function
                console.log('llmprovider.json not found, getting providers from getProviders');
                try {
                    const providers = await getProviders();
                    console.log(providers);
                    if (Array.isArray(providers)) {
                        providers.forEach((provider: any) => {
                            // Convert to LLMProvider format if needed
                            const llmProvider: LLMProvider = {
                                id: provider.id || 0,
                                logo: provider.logo || '',
                                name: provider.name || '',
                                apiUrl: provider.apiUrl || '',
                                category: provider.category || '',
                                key: provider.key || '',
                                keyAdded: provider.keyAdded || false
                            };

                            const key = llmProvider.name.replace(/\s+/g, '').toLowerCase();
                            if (key) {
                                this.llmProviders.set(key, llmProvider);
                            }

                        });

                    }
                    // Ensure the directory exists
                    const dirPath = path.dirname(configPath);
                    if (!fs.existsSync(dirPath)) {
                        fs.mkdirSync(dirPath, { recursive: true });
                    }

                    // Write to agents.json
                    fs.writeFileSync(configPath, JSON.stringify(providers, null, 2));
                    console.log('Providers written to llmprovider.json');
                    return Array.from(this.llmProviders.values());

                } catch (error) {
                    console.error('Error getting providers from getProviders:', error);
                }

                // Return empty array if no providers found
                return [];
            }

            // Read and parse the JSON file
            const configFile = fs.readFileSync(configPath, 'utf8');
            const providers = JSON.parse(configFile);

            // If we have providers in the file, process them
            if (providers && Array.isArray(providers)) {
                providers.forEach((provider: LLMProvider) => {
                    console.log('Processing provider:', provider);
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
            console.error('Error reading LLM provider config:', error);
            // Return empty array in case of error
            return [];
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