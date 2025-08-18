import cbws from '../core/websocket';
import { AddToAgentStateResponse, GetAgentStateResponse, GetProjectStateResponse, UpdateProjectStateResponse } from '@codebolt/types/sdk';
import { ApplicationState } from '../types/commonTypes';
import { StateEventType, StateAction, StateResponseType } from '@codebolt/types/enum';



const cbstate = {
    /**
     * Retrieves the current application state from the server via WebSocket.
     * @returns {Promise<ApplicationState>} A promise that resolves with the application state.
     */
    getApplicationState: async (): Promise<ApplicationState> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": StateEventType.PROJECT_STATE_EVENT,
                "action": StateAction.GET_APP_STATE,
            },
            StateResponseType.GET_APP_STATE_RESPONSE
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
                "type": StateEventType.AGENT_STATE_EVENT,
                "action":StateAction.ADD_TO_AGENT_STATE,
                payload:{
                    key,
                    value
                }
                
            },
            StateResponseType.ADD_TO_AGENT_STATE_RESPONSE
        );  
    },
    /**
     * Retrieves the current state of the agent from the server via WebSocket.
     * @returns {Promise<GetAgentStateResponse>} A promise that resolves with the agent's state.
     */
    getAgentState: async (): Promise<GetAgentStateResponse> => {
       return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": StateEventType.AGENT_STATE_EVENT,
                "action":StateAction.GET_AGENT_STATE,
                
            },
            StateResponseType.GET_AGENT_STATE_RESPONSE
        );  
    },


    /**
     * Retrieves the current project state from the server via WebSocket.
     * @returns {Promise<GetProjectStateResponse>} A promise that resolves with the project's state.
     */
    getProjectState: async (): Promise<GetProjectStateResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": StateEventType.PROJECT_STATE_EVENT,
                "action": StateAction.GET_PROJECT_STATE,
            },
            StateResponseType.GET_PROJECT_STATE_RESPONSE
        );
    },

    /**
     * Updates the project state on the server via WebSocket.
     * @param {string} key - The key to update in the project state.
     * @param {any} value - The value to set for the key.
     * @returns {Promise<UpdateProjectStateResponse>} A promise that resolves with the response to the update request.
     */
    updateProjectState: async (key:string,value:any): Promise<UpdateProjectStateResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": StateEventType.PROJECT_STATE_EVENT,
                "action": StateAction.UPDATE_PROJECT_STATE,
                payload:{
                    key,
                    value
                }
            },
            StateResponseType.UPDATE_PROJECT_STATE_RESPONSE
        );
    }


};

export default cbstate;
