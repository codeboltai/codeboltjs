import { Model } from '@codebolt/types/apis/models';
import { CodeboltApplicationPath } from '../config';
import { LLMProviderService } from './LLMProviderService'; // Added import

import fs from 'fs';
import path from 'path';
import axios from 'axios';

export class ModelService {
  private static instance: ModelService | null = null;
  private Models: Map<string, Model>;

  private constructor() {
    this.Models = new Map();
    this.loadModels(); // Load models when the service is initialized
  }

  public static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService();
    }
    return ModelService.instance;
  }

  /**
   * Get LLM providers from local file
   * @returns Promise resolving to array of LLM providers
   */
  public async loadModels(): Promise<Model[]> {
    console.log('Loading models...');
    try {
      const configPath = path.join(CodeboltApplicationPath(), 'models.json');

      // Check if models.json exists
      if (!fs.existsSync(configPath)) {
        // If file doesn't exist, fetch models from API
        console.log('models.json not found, fetching models from API');
        try {
          const response = await axios.get('https://codebolt-edge-api.arrowai.workers.dev/getllmpricing');
          const models: any = response.data.data;

          // Process and store the models
          if (models && Array.isArray(models)) {
            models.forEach((model: Model) => {
              this.Models.set(model.llm_id, model);
            });
         
          }
          // Ensure the directory exists
          const dirPath = path.dirname(configPath);
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }

          // Write to models.json
          fs.writeFileSync(configPath, JSON.stringify(models, null, 2));
          console.log('Models written to models.json');
             return models;
        } catch (error) {
          console.error('Error fetching models from API:', error);
        }

        // Return empty array if no models found
        return [];
      }

      // Read and parse the JSON file
      const configFile = fs.readFileSync(configPath, 'utf8');
      const models = JSON.parse(configFile);

      // If we have models in the file, process them
      if (models && Array.isArray(models)) {
        models.forEach((model: Model) => {
          this.Models.set(model.llm_id, model);
        });
        return Array.from(this.Models.values());
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
   * Get models with providers that have keys added
   * @returns Array of models with valid providers
   */
  public async getModels(): Promise<Model[]> {
    // Get all models
    const allModels = Array.from(this.Models.values());

    // Get LLM providers service instance
    const providerService = LLMProviderService.getInstance();
    const providers = await providerService.getLLMProviders();
  

    // Create a set of provider keys that have been added
    const validProviderKeys = new Set(
      providers
        .filter(provider => provider.keyAdded)
        .map(provider => provider.name.replace(/\s+/g, '').toLowerCase())
    );

    // Filter models to only include those with valid providers
    return allModels.filter(model => validProviderKeys.has(model.litellm_provider.replace(/\s+/g, '').toLowerCase()));
  }

  /**
   * Get LLM providers list
   * @returns Array of LLM providers
   */
  public getModelsList(): Model[] {
    return Array.from(this.Models.values());
  }

  /**
   * Get a specific LLM provider by key
   * @param key - The key or name of the provider
   * @returns The LLM provider or undefined if not found
   */
  public getModel(key: string): Model | undefined {
    return this.Models.get(key);
  }
}