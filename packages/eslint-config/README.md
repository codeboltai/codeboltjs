# @codebolt/eslint-config

Shared ESLint configuration for all CodeBolt packages.

## Usage

In your package's `.eslintrc.json`:

```json
{
  "extends": ["@codebolt/eslint-config"],
  "parserOptions": {
    "project": "./tsconfig.json"
  }
}
```

## Rules

This configuration includes:

- **@typescript-eslint/no-explicit-any**: `error` - Prevents usage of `any` type
- **@typescript-eslint/no-unsafe-assignment**: `warn` - Warns about unsafe assignments
- **@typescript-eslint/no-unsafe-member-access**: `warn` - Warns about unsafe member access
- **@typescript-eslint/no-unsafe-call**: `warn` - Warns about unsafe function calls
- **@typescript-eslint/no-unsafe-return**: `warn` - Warns about unsafe returns
- **@typescript-eslint/no-unused-vars**: `warn` - Warns about unused variables

## Ignored Patterns

- `dist/**/*` - Build output
- `node_modules/**/*` - Dependencies
- `*.js` - JavaScript files (for TypeScript projects)
- `bkp/**/*` - Backup files
- `testcases/**/*` - Test cases
- `tests/**/*` - Test files
