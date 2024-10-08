import cbws from './websocket';

export enum logType {
    info = "info",
    error = "error",
    warning = "warning"
}

import CbWS from './websocket';

class CustomEventEmitter extends EventEmitter { }
import { EventEmitter } from 'events';
/**
 * A module for handling in-memory database operations via WebSocket.
 */

/**
 * @module cbfs
 * @description This module provides functionality to interact with the filesystem.
 */



class CbHistory{
    private wsManager: CbWS;
    private ws: any;
    private eventEmitter: CustomEventEmitter;

    constructor(wsManager: CbWS) {
        this.wsManager = wsManager;
        // this.ws = this.wsManager.getWebsocket();
        this.eventEmitter = new CustomEventEmitter();
    }

    summarizeAll= (): Promise<{
        role: string;
        content: string;
    }[]> => {
        return new Promise((resolve, reject) => {
             this.wsManager.send(JSON.stringify({
                "type": "chatSummaryEvent",
                "action": "summarizeAll",

            }));
             this.wsManager.on((data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getSummarizeAllResponse") {
                    resolve(response.payload); // Resolve the Promise with the response data
                }
            })
        })


    }
    summarize= (messages: {
        role: string;
        content: string;
    }[], depth: number): Promise<{
        role: string;
        content: string;
    }[]> => {
        return new Promise((resolve, reject) => {
             this.wsManager.send(JSON.stringify({
                "type": "chatSummaryEvent",
                "action": "summarize",
                messages,
                depth
            }));
             this.wsManager.on((data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getSummarizeResponse") {
                    resolve(response.payload); // Resolve the Promise with the response data
                }
            })
        })

    }
}


export default CbHistory;



