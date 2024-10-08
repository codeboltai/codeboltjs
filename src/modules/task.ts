
import CbWS from './websocket';

class CustomEventEmitter extends EventEmitter { }
import { EventEmitter } from 'events';

// import {AddTaskResponse,GetTasksResponse,UpdateTasksResponse } from '@codebolt/types';
/**
 * Manages task operations via WebSocket communication.
 */



class CBTask{
    /**
     * Adds a task using a WebSocket message.
     * @param {string} task - The task to be added.
     * @returns {Promise<AddTaskResponse>} A promise that resolves with the response from the add task event.
     */
    private wsManager: CbWS;
    private ws: any;
    private eventEmitter: CustomEventEmitter;

    constructor(wsManager: CbWS) {
        this.wsManager = wsManager;
        // this.ws = this.wsManager.getWebsocket();
        this.eventEmitter = new CustomEventEmitter();
    }
    addTask= async (task: string): Promise<any> => {
        return new Promise((resolve, reject) => {
             this.wsManager.send(JSON.stringify({
                "type": "taskEvent",
                "action":"addTask",
                message:{
                    "task": task
                }
               
            }));
             this.wsManager.on((data: string) => {
                const response = JSON.parse(data);
                if (response.type === "addTaskResponse") {
                    resolve(response); // Resolve the promise with the response data from adding the task
                }
            });
        });
    }
    /**
     * Retrieves all tasks using a WebSocket message.
     * @returns {Promise<GetTasksResponse>} A promise that resolves with the response from the get tasks event.
     */
    getTasks= async (): Promise<any> => {
        return new Promise((resolve, reject) => {
             this.wsManager.send(JSON.stringify({
                "type":"taskEvent",
                "action": "getTasks"
            }));
             this.wsManager.on((data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getTasksResponse") {
                    resolve(response); // Resolve the promise with the response data from retrieving tasks
                }
            });
        });
    }
    
    /**
     * Updates an existing task using a WebSocket message.
     * @param {string} task - The updated task information.
     * @returns {Promise<UpdateTasksResponse>} A promise that resolves with the response from the update task event.
     */
    updateTask= async ( task: string): Promise<any> => {
        return new Promise((resolve, reject) => {
             this.wsManager.send(JSON.stringify({
                "type": "taskEvent",
                "action": "updateTask",
                message: {
                    "task": task
                }
            }));
             this.wsManager.on((data: string) => {
                const response = JSON.parse(data);
                if (response.type === "updateTaskResponse") {
                    resolve(response); // Resolve the promise with the response data from updating the task
                }
            });
        });
    }
};

export default CBTask;
