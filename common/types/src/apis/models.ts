export interface Model {
  llm_id: string;
  user_model_name: string | null;
  model_name: string;
  datetime: string;
  max_tokens: number | null;
  max_output_tokens: number | null;
  cached_token: number | null;
  input_cost_per_token: number | null;
  output_cost_per_token: number | null;
  litellm_provider: string;
  mode: string;
  supports_function_calling: boolean | null;
  supports_parallel_function_calling: boolean | null;
  supports_vision: boolean | null;
  source: string | null;
  max_input_tokens: number | null;
}