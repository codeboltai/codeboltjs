export interface LLMProvider {
  id: number;
  logo: string;
  name: string;
  apiUrl: string;
  category: string;
  key: string;
  keyAdded: boolean;
}