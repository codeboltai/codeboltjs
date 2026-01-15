import { Model } from '@codebolt/types/apis/models';
import { CodeboltApplicationPath } from '../../config/config';
import { LLMProviderService } from './LLMProviderService'; // Added import
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { logger } from '@/main/utils/logger';
import { log } from 'console';

export class ModelService {
  private static instance: ModelService | null = null;
  private Models: Map<string, Model>;
  private modelsLoaded: boolean = false;

  private constructor() {
    this.Models = new Map();
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
    // If models are already loaded, return them
    if (this.modelsLoaded) {
      return Array.from(this.Models.values());
    }

    try {
      const configPath = path.join(CodeboltApplicationPath(), 'models.json');

      // Check if models.json exists
      if (!fs.existsSync(configPath)) {
        // If file doesn't exist, fetch models from API
     
        try {
          const response = await axios.get('https://codebolt-edge-api.arrowai.workers.dev/getllmpricing');
          const modelsFromApi: any = response.data.data;

          // Process and store the models
          let models: Model[] = [];
          if (modelsFromApi && Array.isArray(modelsFromApi)) {
            // Clear existing models
            this.Models.clear();
            
            modelsFromApi.forEach((model: any) => {
              // Transform API response to Model format
              const transformedModel: Model = {
                llm_id: model.llm_id,
                display_name: model.model_name,
                model: model.model_name,
                max_tokens: model.max_tokens,
                max_output_tokens: model.max_output_tokens,
                cached_token: model.cached_token,
                input_cost_per_token: model.input_cost_per_token,
                output_cost_per_token: model.output_cost_per_token,
                provider: model.litellm_provider,
                mode: model.mode,
                supports_function_calling: model.supports_function_calling === 1 ? true : false,
                supports_parallel_function_calling: model.supports_parallel_function_calling === 1 ? true : false,
                supports_vision: model.supports_vision === 1 ? true : false,
                source: model.source,
                max_input_tokens: model.max_input_tokens,
              };
              this.Models.set(model.llm_id, transformedModel);
              models.push(transformedModel);
            });
         
          }
          // Ensure the directory exists
          const dirPath = path.dirname(configPath);
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }
          // Write to models.json
          fs.writeFileSync(configPath, JSON.stringify(models, null, 2));
          logger.info('Models written to models.json');
          
          // Mark models as loaded
          this.modelsLoaded = true;
          
          return models;
        } catch (error) {
          logger.error('Error fetching models from API:', error);
        }

        // Mark models as loaded even if empty
        this.modelsLoaded = true;
        
        // Return empty array if no models found
        return [];
      }

      // Read and parse the JSON file
      const configFile = fs.readFileSync(configPath, 'utf8');
      const models = JSON.parse(configFile);

      // Clear existing models
      this.Models.clear();
      
      // If we have models in the file, process them
      if (models && Array.isArray(models)) {
        models.forEach((model: Model) => {
          this.Models.set(model.llm_id, model);
        });
        
        // Mark models as loaded
        this.modelsLoaded = true;
        
        return Array.from(this.Models.values());
      }

      // Mark models as loaded even if empty
      this.modelsLoaded = true;
      
      // Return empty array if no providers found
      return [];
    } catch (error) {
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
        .map(provider => provider.name.replace(/\s+/g, '').toLowerCase())
    );

    // Filter models to only include those with valid providers
    return allModels.filter(model => validProviderKeys.has(model.provider.replace(/\s+/g, '').toLowerCase()));
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