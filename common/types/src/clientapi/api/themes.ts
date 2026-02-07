// Themes API types

export interface Theme {
  id: string;
  name: string;
  description?: string;
  colors: Record<string, string>;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateThemeRequest {
  name: string;
  description?: string;
  colors: Record<string, string>;
}

export interface UpdateThemeRequest {
  name?: string;
  description?: string;
  colors?: Record<string, string>;
}

export interface UpdateThemeColorsRequest {
  themeId?: string;
  colors: Record<string, string>;
}

export interface ThemeStats {
  total: number;
  custom: number;
  default: number;
}

export interface ThemeValidationResult {
  valid: boolean;
  errors?: string[];
}
