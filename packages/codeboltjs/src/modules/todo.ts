import cbws from '../core/websocket';

/**
 * @module cbtodo
 * @description This module provides functionality to interact with the todo lists.
 */
const cbtodo = {
    /**
     * @function addTodo
     * @description Adds a new todo item.
     * @param {Object} params - The parameters for adding a todo.
     * @param {string} params.title - The title of the todo.
     * @param {'high' | 'medium' | 'low'} [params.priority] - The priority of the todo.
     * @param {string[]} [params.tags] - Tags for the todo.
     * @returns {Promise<any>} A promise that resolves with the server response.
     */
    addTodo: (params: { title: string; priority?: 'high' | 'medium' | 'low'; tags?: string[] }) => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": 'todoEvent',
                "action": 'addTodo',
                "message": params
            },
            'addTodoResponse'
        );
    },

    /**
     * @function updateTodo
     * @description Updates an existing todo item.
     * @param {Object} params - The parameters for updating a todo.
     * @param {string} params.id - The ID of the todo to update.
     * @param {string} [params.title] - The new title.
     * @param {'pending' | 'processing' | 'completed' | 'cancelled'} [params.status] - The new status.
     * @param {'high' | 'medium' | 'low'} [params.priority] - The new priority.
     * @param {string[]} [params.tags] - The new tags.
     * @returns {Promise<any>} A promise that resolves with the server response.
     */
    updateTodo: (params: { id: string; title?: string; status?: 'pending' | 'processing' | 'completed' | 'cancelled'; priority?: 'high' | 'medium' | 'low'; tags?: string[] }) => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": 'todoEvent',
                "action": 'updateTodo',
                "message": params
            },
            'updateTodoResponse'
        );
    },

    /**
     * @function getTodoList
     * @description Retrieves the todo list.
     * @param {any} [params] - The parameters for getting the todo list.
     * @returns {Promise<any>} A promise that resolves with the server response.
     */
    getTodoList: (params?: any) => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": 'todoEvent',
                "action": 'getTodoList',
                "message": params || {}
            },
            'getTodoListResponse'
        );
    },

    /**
     * @function getAllIncompleteTodos
     * @description Retrieves all incomplete todo items.
     * @param {any} [params] - The parameters for retrieval.
     * @returns {Promise<any>} A promise that resolves with the server response.
     */
    getAllIncompleteTodos: () => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": 'todoEvent',
                "action": 'getAllIncompleteTodos',
                "message": {}
            },
            'getAllIncompleteTodosResponse'
        );
    }
};

export default cbtodo;
