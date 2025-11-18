# AND Logic Plugin

A CodeBolt plugin that provides logical AND operations for the LiteGraph editor.

## Features

### AndNode (`logic/AND`)
- **Description**: Logical AND operation with dynamic inputs
- **Inputs**:
  - Dynamic boolean inputs (starts with 2, can add more via UI)
  - Input type: boolean
- **Output**:
  - Result (boolean)
- **Properties**:
  - Add Input button to dynamically add more inputs
- **Icon**: ∧

## Installation

This plugin is automatically loaded by the CodeBolt application if placed in the `customnodes/and-logic/` directory.

## Development

### Building the Plugin
```bash
cd agentcreator/customnodes/and-logic
npm install
npm run build
```

### Development Mode
```bash
npm run dev
```

### Clean Build
```bash
npm run clean
```

## Usage

After installation, the AND node will be available in the LiteGraph editor under the "Logic" category.

### Dynamic Inputs

The AND node supports dynamic input addition:
1. Start with 2 boolean inputs (a, b)
2. Click "Add Input" button to add more boolean inputs
3. All inputs are combined with logical AND operation
4. Output is true only if ALL inputs are true

### Truth Table

| Input A | Input B | Output |
|---------|---------|--------|
| false   | false   | false  |
| false   | true    | false  |
| true    | false   | false  |
| true    | true    | true   |

## Migration from Legacy AndNode

This plugin replaces the legacy AndNode structure with the new plugin format:
- Frontend UI: `src/ui/nodes/AndNode.ts`
- Backend Handler: `src/backend/processors/AndNode.ts`
- Shared Metadata: `src/shared/metadata.ts`
- Plugin Manifest: `package.json`

## License

MIT License