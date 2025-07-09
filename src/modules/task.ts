import cbws from '../core/websocket';
import { AddTaskResponse, GetTasksResponse, UpdateTasksResponse } from '../types/socketMessageTypes';
/**
 * Manages task operations via WebSocket communication.
 */
const taskplaner = {
    /**
     * Adds a task using a WebSocket message.
     * @param {string} task - The task to be added.
     * @returns {Promise<AddTaskResponse>} A promise that resolves with the response from the add task event.
     */
    addTask: async (task: string): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "taskEvent",
                "action":"addTask",
                message:{
                    "task": task
                }
               
            },
            "addTaskResponse"
        );
    },
    /**
     * Retrieves all tasks using a WebSocket message.
     * @returns {Promise<GetTasksResponse>} A promise that resolves with the response from the get tasks event.
     */
    getTasks: async (): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type":"taskEvent",
                "action": "getTasks"
            },
            "getTasksResponse"
        );
    },
    
    /**
     * Updates an existing task using a WebSocket message.
     * @param {string} task - The updated task information.
     * @returns {Promise<UpdateTasksResponse>} A promise that resolves with the response from the update task event.
     */
    updateTask: async ( task: string): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "taskEvent",
                "action": "updateTask",
                message: {
                    "task": task
                }
            },
            "updateTaskResponse"
        );
    }
};

export default taskplaner;
