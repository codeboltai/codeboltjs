// Shared types for module definitions

export type ParameterType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';

export interface CodeboltParameter {
  name: string;
  type: ParameterType;
  required: boolean;
  description?: string;
  default?: unknown;
}

export interface CodeboltFunction {
  name: string;
  description: string;
  parameters: CodeboltParameter[];
  returnType: string;
}

export interface CodeboltModule {
  name: string;
  displayName: string;
  description: string;
  category: string;
  functions: CodeboltFunction[];
}

export interface ModuleCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  modules: string[];
}

// Helper to create parameters
export const param = (
  name: string,
  type: ParameterType,
  required: boolean,
  description?: string,
  defaultValue?: unknown
): CodeboltParameter => ({
  name,
  type,
  required,
  description,
  default: defaultValue,
});

// Helper to create functions
export const fn = (
  name: string,
  description: string,
  parameters: CodeboltParameter[],
  returnType: string = 'Promise<any>'
): CodeboltFunction => ({
  name,
  description,
  parameters,
  returnType,
});
