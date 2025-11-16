import type {
  INodeInputSlot,
  INodeOutputSlot,
  ISlotType,
  LGraphNode
} from '@codebolt/litegraph';

declare module '@codebolt/litegraph' {
  interface LGraphNode {
    /** Allow arbitrary data to be sent through outputs without TS complaints */
    setOutputData(slot: number, data: unknown): void;

    /** Permit optional slot type definitions when wiring inputs */
    addInput<TProperties extends Partial<INodeInputSlot>>(
      name: string,
      type?: ISlotType,
      extra_info?: TProperties
    ): INodeInputSlot & TProperties;

    /** Permit optional slot type definitions when wiring outputs */
    addOutput<TProperties extends Partial<INodeOutputSlot>>(
      name: string,
      type?: ISlotType,
      extra_info?: TProperties
    ): INodeOutputSlot & TProperties;

    /** Treat node properties as a generic record so nested objects are accessible */
    properties: Record<string, any>;
  }
}
