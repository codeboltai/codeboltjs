import { LGraphNode } from '@codebolt/litegraph';

// Base Random Node - shared metadata and structure
export class BaseRandomNode extends LGraphNode {
  static metadata = {
    type: "basic/random",
    title: "Random",
    category: "basic",
    description: "Generate random numbers with configurable range",
    icon: "🎲",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseRandomNode.metadata.title, BaseRandomNode.metadata.type);
    this.title = BaseRandomNode.metadata.title;

    // Add outputs for random values
    this.addOutput("value", "number");
    this.addOutput("normalized", "number");

    // Add properties
    this.addProperty("min", 0);
    this.addProperty("max", 1);
    this.addProperty("seed", null);
    this.addProperty("integer", false);

    this.size = [160, 60];
  }

  // Shared random generation logic
  generateRandom(min: number, max: number, seed?: number | null, integer = false): number {
    let randomValue: number;

    if (seed !== null && seed !== undefined) {
      // Seeded random using simple linear congruential generator
      const a = 1664525;
      const c = 1013904223;
      const m = Math.pow(2, 32);
      let current = seed;
      current = (a * current + c) % m;
      randomValue = current / m;
    } else {
      // Use built-in random
      randomValue = Math.random();
    }

    // Scale to range
    let result = min + randomValue * (max - min);

    // Convert to integer if needed
    if (integer) {
      result = Math.floor(result);
    }

    return result;
  }

  // Validation helpers
  validateRange(min: number, max: number): { min: number; max: number } {
    return {
      min: Math.min(min, max),
      max: Math.max(min, max)
    };
  }

  validateSeed(seed: any): number | null {
    if (seed === null || seed === undefined || seed === '') {
      return null;
    }
    const num = parseFloat(seed);
    return isNaN(num) ? null : num;
  }

  // Shared property setter
  setProperty(name: string, value: any) {
    switch (name) {
      case 'min':
      case 'max':
        this.properties[name] = parseFloat(value) || 0;
        const range = this.validateRange(this.properties.min as number, this.properties.max as number);
        this.properties.min = range.min;
        this.properties.max = range.max;
        break;
      case 'seed':
        this.properties.seed = this.validateSeed(value);
        break;
      case 'integer':
        this.properties.integer = Boolean(value);
        break;
      default:
        super.setProperty(name, value);
    }
  }
}