export interface Model {
  llm_id: string;
  display_name: string;
  model:string
  max_tokens: number | null;
  max_output_tokens: number | null;
  cached_token: number | null;
  input_cost_per_token: number | null;
  output_cost_per_token: number | null;
  provider: string;
  mode: string;
  supports_function_calling: boolean | null;
  supports_parallel_function_calling: boolean | null;
  supports_vision: boolean | null;
  source: string | null;
  max_input_tokens: number | null;
}