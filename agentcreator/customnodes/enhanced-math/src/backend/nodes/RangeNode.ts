import { LGraphNode } from '@codebolt/litegraph';
import { RangeNodeMetadata } from '../../shared/metadata';
import { RangeNodeHandler } from '../processors/RangeNode';

export class RangeNode extends LGraphNode {
    static metadata = RangeNodeMetadata;

    constructor() {
        super("Range");
        this.addInput("Start", "number");
        this.addInput("End", "number");
        this.addInput("Step", "number");
        this.addOutput("Array", "array");

        this.properties = {
            start: 0,
            end: 10,
            step: 1
        };
    }

    onExecute() {
        const inputData = [
            this.getInputData(0),
            this.getInputData(1),
            this.getInputData(2)
        ];

        try {
            const result = RangeNodeHandler.execute(this.properties, inputData);
            this.setOutputData(0, result as any);
        } catch (error) {
            console.error('RangeNode execution error:', error);
            this.setOutputData(0, [] as any);
        }
    }
}
