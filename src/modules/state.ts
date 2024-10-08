import cbws from './websocket';
import {ApplicationState,AddToAgentStateResponse,GetAgentStateResponse } from '@codebolt/types';


import CbWS from './websocket';

class CustomEventEmitter extends EventEmitter { }
import { EventEmitter } from 'events';



class CBState {
    private wsManager: CbWS;
    private ws: any;
    private eventEmitter: CustomEventEmitter;

    constructor(wsManager: CbWS) {
        this.wsManager = wsManager;
        // this.ws = this.wsManager.getWebsocket();
        this.eventEmitter = new CustomEventEmitter();
    }
    /**
     * Retrieves the current application state from the server via WebSocket.
     * @returns {Promise<ApplicationState>} A promise that resolves with the application state.
     */
    getApplicationState=async (): Promise<ApplicationState> => {
        return new Promise((resolve, reject) => {
             this.wsManager.send(JSON.stringify({
                "type": "getAppState",
                
            }));
             this.wsManager.on((data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getAppStateResponse") {
                    resolve(response); // Resolve the Promise with the response data
                }
            });
        });
    }
    /**
     * Adds a key-value pair to the agent's state on the server via WebSocket.
     * @param {string} key - The key to add to the agent's state.
     * @param {string} value - The value associated with the key.
     * @returns {Promise<AddToAgentStateResponse>} A promise that resolves with the response to the addition request.
     */
    addToAgentState=async (key: string, value: string): Promise<AddToAgentStateResponse> => {
      return new Promise((resolve, reject) => {
             this.wsManager.send(JSON.stringify({
                "type": "agentStateEvent",
                "action":"addToAgentState",
                payload:{
                    key,
                    value
                }
                
            }));
             this.wsManager.on((data: string) => {
                const response = JSON.parse(data);
                if (response.type === "addToAgentStateResponse") {
                    resolve(response); // Resolve the Promise with the response data
                }
            });
        });  
    }
    /**
     * Retrieves the current state of the agent from the server via WebSocket.
     * @returns {Promise<GetAgentStateResponse>} A promise that resolves with the agent's state.
     */
    getAgentState= async (): Promise<GetAgentStateResponse> => {
       return new Promise((resolve, reject) => {
             this.wsManager.send(JSON.stringify({
                "type": "agentStateEvent",
                "action":"getAgentState",
                
            }));
             this.wsManager.on((data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getAgentStateResponse") {
                    resolve(response); // Resolve the Promise with the response data
                }
            });
        });  
    }
};

export default CBState;
