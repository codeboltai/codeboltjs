import cbws from '../core/websocket';
import { randomUUID } from 'crypto';

import type {
    SaveMemoryEvent,
    UpdateMemoryEvent,
    DeleteMemoryEvent,
    ListMemoryEvent,
    TodoItem,
    TodoData
} from '@codebolt/types/agent-to-app-ws-schema';

export interface BaseMemoryResponse {
    requestId: string;
    success?: boolean;
    message?: string;
    error?: string;
}

export interface SaveMemoryResponse extends BaseMemoryResponse {
    type: 'saveMemoryResponse';
    memoryId?: string;
    data?: unknown;
}

export interface UpdateMemoryResponse extends BaseMemoryResponse {
    type: 'updateMemoryResponse';
    memoryId?: string;
    data?: unknown;
}

export interface DeleteMemoryResponse extends BaseMemoryResponse {
    type: 'deleteMemoryResponse';
}

export interface ListMemoryResponse extends BaseMemoryResponse {
    type: 'listMemoryResponse';
    items?: unknown[];
}

export type MemoryServiceResponse =
    | SaveMemoryResponse
    | UpdateMemoryResponse
    | DeleteMemoryResponse
    | ListMemoryResponse;
const cbmemory = {
   json:{
    save:(json:any): Promise<SaveMemoryResponse> =>{
        const event: SaveMemoryEvent = {
            type: 'memoryEvent',
            action: 'saveMemory',
            requestId: randomUUID(),
            format: 'json',
            json
        };
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'saveMemoryResponse'
        );
    },
    update:(memoryId:string, json:any): Promise<UpdateMemoryResponse> =>{
        const event: UpdateMemoryEvent = {
            type: 'memoryEvent',
            action: 'updateMemory',
            requestId: randomUUID(),
            format: 'json',
            memoryId,
            json
        };
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'updateMemoryResponse'
        );
    },
    delete:(memoryId:string): Promise<DeleteMemoryResponse> =>{
        const event: DeleteMemoryEvent = {
            type: 'memoryEvent',
            action: 'deleteMemory',
            requestId: randomUUID(),
            format: 'json',
            memoryId
        };
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'deleteMemoryResponse'
        );
    },
    list:(filters:Record<string, unknown> = {}): Promise<ListMemoryResponse> =>{
        const event: ListMemoryEvent = {
            type: 'memoryEvent',
            action: 'listMemory',
            requestId: randomUUID(),
            format: 'json',
            filters
        };
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'listMemoryResponse'
        );
    }
   },
   todo:{
    save:(todo:TodoData, metadata:Record<string, unknown> = {}): Promise<SaveMemoryResponse> =>{
        const event: SaveMemoryEvent = {
            type: 'memoryEvent',
            action: 'saveMemory',
            requestId: randomUUID(),
            format: 'todo',
            todo,
            metadata
        };
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'saveMemoryResponse'
        );
    },
    update:(memoryId:string, todo:TodoItem): Promise<UpdateMemoryResponse> =>{
        const event: UpdateMemoryEvent = {
            type: 'memoryEvent',
            action: 'updateMemory',
            requestId: randomUUID(),
            format: 'todo',
            memoryId,
            todo
        };
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'updateMemoryResponse'
        );
    },
    delete:(memoryId:string): Promise<DeleteMemoryResponse> =>{
        const event: DeleteMemoryEvent = {
            type: 'memoryEvent',
            action: 'deleteMemory',
            requestId: randomUUID(),
            format: 'todo',
            memoryId
        };
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'deleteMemoryResponse'
        );
    },
    list:(filters:Record<string, unknown> = {}): Promise<ListMemoryResponse> =>{
        const event: ListMemoryEvent = {
            type: 'memoryEvent',
            action: 'listMemory',
            requestId: randomUUID(),
            format: 'todo',
            filters
        };
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'listMemoryResponse'
        );
    }
   },
   markdown:{
    save:(markdown:string, metadata:Record<string, unknown> = {}): Promise<SaveMemoryResponse> =>{
        const event: SaveMemoryEvent = {
            type: 'memoryEvent',
            action: 'saveMemory',
            requestId: randomUUID(),
            format: 'markdown',
            markdown,
            metadata
        };
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'saveMemoryResponse'
        );
    },
    update:(memoryId:string, markdown:string, metadata:Record<string, unknown> = {}): Promise<UpdateMemoryResponse> =>{
        const event: UpdateMemoryEvent = {
            type: 'memoryEvent',
            action: 'updateMemory',
            requestId: randomUUID(),
            format: 'markdown',
            memoryId,
            markdown,
            metadata
        };
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'updateMemoryResponse'
        );
    },
    delete:(memoryId:string): Promise<DeleteMemoryResponse> =>{
        const event: DeleteMemoryEvent = {
            type: 'memoryEvent',
            action: 'deleteMemory',
            requestId: randomUUID(),
            format: 'markdown',
            memoryId
        };
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'deleteMemoryResponse'
        );
    },
    list:(filters:Record<string, unknown> = {}): Promise<ListMemoryResponse> =>{
        const event: ListMemoryEvent = {
            type: 'memoryEvent',
            action: 'listMemory',
            requestId: randomUUID(),
            format: 'markdown',
            filters
        };
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'listMemoryResponse'
        );
    }
   }
}

export default cbmemory

