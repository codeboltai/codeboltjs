import { Model } from '@codebolt/types/apis/models';
import { CodeboltApplicationPath } from '../config';

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
  public getModels(): Model[] {
    return Array.from(this.Models.values());
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
            return models;
          }
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











