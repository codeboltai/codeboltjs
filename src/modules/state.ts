import cbws from '../core/websocket';
import {ApplicationState,AddToAgentStateResponse,GetAgentStateResponse } from '@codebolt/types';

const cbstate = {
    /**
     * Retrieves the current application state from the server via WebSocket.
     * @returns {Promise<ApplicationState>} A promise that resolves with the application state.
     */
    getApplicationState: async (): Promise<ApplicationState> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "projectStateEvent",
                "action": "getAppState",
                
            },
            "getAppStateResponse"
        );
    },
    /**
     * Adds a key-value pair to the agent's state on the server via WebSocket.
     * @param {string} key - The key to add to the agent's state.
     * @param {string} value - The value associated with the key.
     * @returns {Promise<AddToAgentStateResponse>} A promise that resolves with the response to the addition request.
     */
    addToAgentState: async (key: string, value: string): Promise<AddToAgentStateResponse> => {
      return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "agentStateEvent",
                "action":"addToAgentState",
                payload:{
                    key,
                    value
                }
                
            },
            "addToAgentStateResponse"
        );  
    },
    /**
     * Retrieves the current state of the agent from the server via WebSocket.
     * @returns {Promise<GetAgentStateResponse>} A promise that resolves with the agent's state.
     */
    getAgentState: async (): Promise<GetAgentStateResponse> => {
       return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "agentStateEvent",
                "action":"getAgentState",
                
            },
            "getAgentStateResponse"
        );  
    },


    /**
     * Retrieves the current project state from the server via WebSocket.
     * @returns {Promise<GetProjectStateResponse>} A promise that resolves with the project's state.
     */
    getProjectState: async (): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "projectStateEvent",
                "action": "getProjectState",
            },
            "getProjectStateResponse"
        );
    },

    /**
     * Updates the project state on the server via WebSocket.
     * @returns {Promise<UpdateProjectStateResponse>} A promise that resolves with the response to the update request.
     */
    updateProjectState: async (key:string,value:any): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "projectStateEvent",
                "action": "updateProjectState",
                payload:{
                    key,
                    value
                }
            },
            "updateProjectStateResponse"
        );
    }


};

export default cbstate;
