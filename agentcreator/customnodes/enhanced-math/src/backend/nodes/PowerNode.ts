import { LGraphNode } from '@codebolt/litegraph';
import { PowerNodeMetadata } from '../../shared/metadata';
import { PowerNodeHandler } from '../processors/PowerNode';

export class PowerNode extends LGraphNode {
    static metadata = PowerNodeMetadata;

    constructor() {
        super("Power");
        this.addInput("Base", "number");
        this.addInput("Exponent", "number");
        this.addOutput("Result", "number");

        this.properties = {
            base: 2,
            exponent: 3
        };
    }

    onExecute() {
        const inputData = [
            this.getInputData(0),
            this.getInputData(1)
        ];

        try {
            const result = PowerNodeHandler.execute(this.properties, inputData);
            this.setOutputData(0, result);
        } catch (error) {
            console.error('PowerNode execution error:', error);
            this.setOutputData(0, 0);
        }
    }
}
