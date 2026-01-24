import { CreateKVInstanceTool } from './kv-create-instance';
import { KVSetTool } from './kv-set';
import { KVGetTool } from './kv-get';

export const kvStoreTools = [
    new CreateKVInstanceTool(),
    new KVSetTool(),
    new KVGetTool(),
];

export * from './kv-create-instance';
export * from './kv-set';
export * from './kv-get';
