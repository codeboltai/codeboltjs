import { LGraphNode } from '@codebolt/litegraph';
import { ModuloNodeMetadata } from '../../shared/metadata';
import { ModuloNodeHandler } from '../processors/ModuloNode';

export class ModuloNode extends LGraphNode {
    static metadata = ModuloNodeMetadata;

    constructor() {
        super("Modulo");
        this.addInput("Dividend", "number");
        this.addInput("Divisor", "number");
        this.addOutput("Remainder", "number");

        this.properties = {
            dividend: 10,
            divisor: 3
        };
    }

    onExecute() {
        const inputData = [
            this.getInputData(0),
            this.getInputData(1)
        ];

        try {
            const result = ModuloNodeHandler.execute(this.properties, inputData);
            this.setOutputData(0, result);
        } catch (error) {
            console.error('ModuloNode execution error:', error);
            this.setOutputData(0, 0);
        }
    }
}
