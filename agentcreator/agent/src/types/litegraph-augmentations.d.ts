import type {
  INodeInputSlot,
  INodeOutputSlot,
  ISlotType,
  LGraphNode
} from '@codebolt/litegraph';

declare module '@codebolt/litegraph' {
  interface LGraphNode {
    setOutputData(slot: number, data: unknown): void;
    addInput<TProperties extends Partial<INodeInputSlot>>(
      name: string,
      type?: ISlotType,
      extra_info?: TProperties
    ): INodeInputSlot & TProperties;
    addOutput<TProperties extends Partial<INodeOutputSlot>>(
      name: string,
      type?: ISlotType,
      extra_info?: TProperties
    ): INodeOutputSlot & TProperties;
    properties: Record<string, any>;
  }
}
