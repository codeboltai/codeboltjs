import cbws from '../core/websocket';
import {DebugAddLogResponse,OpenDebugBrowserResponse } from '@codebolt/types';
export enum logType{
    info="info",
    error="error",
    warning="warning"
}


export const debug={
    /**
     * Sends a log message to the debug websocket and waits for a response.
     * @param {string} log - The log message to send.
     * @param {logType} type - The type of the log message (info, error, warning).
     * @returns {Promise<DebugAddLogResponse>} A promise that resolves with the response from the debug event.
     */
    debug:(log:string,type:logType):Promise<DebugAddLogResponse>=> {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "debugEvent",
                "action":"addLog",
                message:{
                   log,
                   type
                }
            },
            "debugEventResponse"
        );
    },
    /**
     * Requests to open a debug browser at the specified URL and port.
     * @param {string} url - The URL where the debug browser should be opened.
     * @param {number} port - The port on which the debug browser will listen.
     * @returns {Promise<OpenDebugBrowserResponse>} A promise that resolves with the response from the open debug browser event.
     */
    openDebugBrowser:(url:string,port:number):Promise<OpenDebugBrowserResponse>=>{
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "debugEvent",
                "action":"openDebugBrowser",
                message:{
                   url,
                   port
                }
            },
            "openDebugBrowserResponse"
        );
    }
}


export default debug;



