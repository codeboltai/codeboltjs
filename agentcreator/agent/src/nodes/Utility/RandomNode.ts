import { BaseRandomNode } from '@codebolt/agent-shared-nodes';

// Backend-specific Random Node - execution logic only
export class RandomNode extends BaseRandomNode {
  private lastSeed: number | null = null;

  constructor() {
    super();
    // Backend doesn't need UI widgets
  }

  // Backend execution logic
  onExecute() {
    const min = this.properties.min as number;
    const max = this.properties.max as number;
    const seed = this.properties.seed as number;
    const isInteger = this.properties.integer as boolean;

    // Use persistent seed if provided, otherwise generate new seed
    const currentSeed = seed !== null ? seed : (this.lastSeed = Date.now());

    // Generate random value
    const value = this.generateRandom(min, max, currentSeed, isInteger);
    const normalized = currentSeed !== null
      ? (value - min) / (max - min || 1)
      : Math.random();

    // Set outputs
    this.setOutputData(0, value);
    this.setOutputData(1, normalized);

    // console.log(`RandomNode ${this.id}: ${value} (range: ${min}-${max}, integer: ${isInteger})`);
  }
}