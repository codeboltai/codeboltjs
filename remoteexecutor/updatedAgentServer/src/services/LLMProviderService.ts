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
              
              const key = llmProvider.key || llmProvider.name;
              if (key) {
                this.llmProviders.set(key, llmProvider);
              }
            });
            
            return Array.from(this.llmProviders.values());
          }
        } catch (error) {
          console.error('Error getting providers from getProviders:', error);
        }
        
        // Return empty array if no providers found
        return [];
      }
      
      // Read and parse the JSON file
      const configFile = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configFile);
      
      // If we have providers in the file, process them
      if (config.providers && Array.isArray(config.providers)) {
        config.providers.forEach((provider: LLMProvider) => {
          const key = provider.key || provider.name;
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
    return this.llmProviders.get(key);
  }
}