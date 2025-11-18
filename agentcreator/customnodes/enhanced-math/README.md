# Enhanced Math Plugin

A CodeBolt plugin that provides advanced mathematical operations for the LiteGraph editor.

## Features

This plugin includes three mathematical nodes:

### PowerNode (`math/power`)
- **Description**: Calculates base raised to exponent
- **Inputs**:
  - Base (number)
  - Exponent (number)
- **Output**: Result (number)
- **Icon**: x^y

### ModuloNode (`math/modulo`)
- **Description**: Calculates remainder of division
- **Inputs**:
  - Dividend (number)
  - Divisor (number)
- **Output**: Result (number)
- **Icon**: %

### RangeNode (`math/range`)
- **Description**: Generates array of numbers in range
- **Inputs**:
  - Start (number)
  - End (number)
  - Step (number)
- **Output**: Range (array)
- **Icon**: [...]

## Installation

This plugin is automatically loaded by the CodeBolt application if placed in the `customnodes/enhanced-math/` directory.

## Development

### Building the Plugin
```bash
cd agentcreator/customnodes/enhanced-math
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

After installation, the nodes will be available in the LiteGraph editor under the "Math" category.

## License

MIT License