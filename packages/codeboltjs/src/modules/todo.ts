import cbws from '../core/websocket';
import { EventType, TodoAction, TodoResponseType } from '@codebolt/types/enum';
import {
    AddTodoResponse,
    UpdateTodoResponse,
    GetTodoListResponse,
    GetAllIncompleteTodosResponse,
    ExportTodosResponse,
    ImportTodosResponse
} from '@codebolt/types/sdk';

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
     * @returns {Promise<AddTodoResponse>} A promise that resolves with the server response.
     */
    addTodo: (params: { title: string; priority?: 'high' | 'medium' | 'low'; tags?: string[] }): Promise<AddTodoResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.TODO_EVENT,
                "action": TodoAction.ADD_TODO,
                "message": params
            },
            TodoResponseType.ADD_TODO_RESPONSE
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
     * @returns {Promise<UpdateTodoResponse>} A promise that resolves with the server response.
     */
    updateTodo: (params: { id: string; title?: string; status?: 'pending' | 'processing' | 'completed' | 'cancelled'; priority?: 'high' | 'medium' | 'low'; tags?: string[] }): Promise<UpdateTodoResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.TODO_EVENT,
                "action": TodoAction.UPDATE_TODO,
                "message": params
            },
            TodoResponseType.UPDATE_TODO_RESPONSE
        );
    },

    /**
     * @function getTodoList
     * @description Retrieves the todo list.
     * @param {any} [params] - The parameters for getting the todo list.
     * @returns {Promise<GetTodoListResponse>} A promise that resolves with the server response.
     */
    getTodoList: (params?: any): Promise<GetTodoListResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.TODO_EVENT,
                "action": TodoAction.GET_TODO_LIST,
                "message": params || {}
            },
            TodoResponseType.GET_TODO_LIST_RESPONSE
        );
    },

    /**
     * @function getAllIncompleteTodos
     * @description Retrieves all incomplete todo items.
     * @param {any} [params] - The parameters for retrieval.
     * @returns {Promise<GetAllIncompleteTodosResponse>} A promise that resolves with the server response.
     */
    getAllIncompleteTodos: (): Promise<GetAllIncompleteTodosResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.TODO_EVENT,
                "action": TodoAction.GET_ALL_INCOMPLETE_TODOS,
                "message": {}
            },
            TodoResponseType.GET_ALL_INCOMPLETE_TODOS_RESPONSE
        );
    },

    /**
     * @function exportTodos
     * @description Exports todos in the specified format.
     * @param {Object} params - The parameters for exporting todos.
     * @param {'json' | 'markdown'} [params.format] - The export format.
     * @param {string} [params.listId] - Optional list ID to filter.
     * @param {string[]} [params.status] - Optional status filter.
     * @returns {Promise<ExportTodosResponse>} A promise that resolves with the exported data.
     */
    exportTodos: (params?: { format?: 'json' | 'markdown'; listId?: string; status?: string[] }): Promise<ExportTodosResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.TODO_EVENT,
                "action": TodoAction.EXPORT_TODOS,
                "message": params || {}
            },
            TodoResponseType.EXPORT_TODOS_RESPONSE
        );
    },

    /**
     * @function importTodos
     * @description Imports todos from the specified format.
     * @param {Object} params - The parameters for importing todos.
     * @param {string} params.data - The import data (JSON or markdown).
     * @param {'json' | 'markdown'} [params.format] - The format of the import data.
     * @param {'replace' | 'merge'} [params.mergeStrategy] - How to handle existing todos.
     * @param {string} [params.listId] - Optional target list ID.
     * @returns {Promise<ImportTodosResponse>} A promise that resolves with the import result.
     */
    importTodos: (params: { data: string; format?: 'json' | 'markdown'; mergeStrategy?: 'replace' | 'merge'; listId?: string }): Promise<ImportTodosResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.TODO_EVENT,
                "action": TodoAction.IMPORT_TODOS,
                "message": params
            },
            TodoResponseType.IMPORT_TODOS_RESPONSE
        );
    }
};

export default cbtodo;
