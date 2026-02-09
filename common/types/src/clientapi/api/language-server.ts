// Language Server API types

export interface LanguageServer {
  id: string;
  name: string;
  language: string;
  installed: boolean;
  running?: boolean;
  version?: string;
}

export interface InstallLanguageServerRequest {
  name: string;
  language: string;
  config?: Record<string, unknown>;
}

export interface AddLanguageServerRequest {
  name: string;
  language: string;
  command: string;
  args?: string[];
  config?: Record<string, unknown>;
}
