import { BaseFracNode } from '@agent-creator/shared-nodes';

class FracNode extends BaseFracNode {
  constructor() {
    super();
  }

  title = "Frac"

  onExecute() {
    const v = this.getInputData(0);
    this.setOutputData(0, this.fraction(v));
  }
}


export default FracNode;