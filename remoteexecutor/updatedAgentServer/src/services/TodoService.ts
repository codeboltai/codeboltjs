import { logger } from '@/main/utils/logger';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TodoItem, CreateTodoRequest, UpdateTodoRequest, TodoStatus } from './../types/todo';

export class TodoService {
    private static instances: Map<string, TodoService> = new Map();
    private projectPath: string;

    private constructor(projectPath: string) {
        this.projectPath = projectPath;
    }

    public static getInstance(projectPath: string): TodoService {
        if (!TodoService.instances.has(projectPath)) {
            TodoService.instances.set(projectPath, new TodoService(projectPath));
        }
        return TodoService.instances.get(projectPath)!;
    }

    /**
     * Get all todos from the todo.json file
     * @returns Promise resolving to todo data object
     */
    public async getTodos(): Promise<any> {
        try {
            const todoPath = path.join(this.projectPath, '.codebolt', 'todos.json');
            
            // Check if file exists
            if (!fs.existsSync(todoPath)) {
                // Return empty object if file doesn't exist
                return {};
            }
            
            // Read and parse the JSON file
            const todoFile = fs.readFileSync(todoPath, 'utf8');
            const todos = JSON.parse(todoFile);
            
            return todos;
        } catch (error) {
            logger.error('Error reading todo file:', error);
            // Return empty object in case of error
            return {};
        }
    }

    /**
     * Get todos by thread ID
     * @param threadId The thread ID to filter todos by
     * @returns Promise resolving to todos for the specified thread
     */
    public async getTodosByThreadId(threadId: string): Promise<any[]> {
        try {
            const allTodos = await this.getTodos();
            
            if (allTodos[threadId]) {
                return allTodos[threadId].toDos || [];
            }
            
            return [];
        } catch (error) {
            logger.error('Error getting todos by thread ID:', error);
            return [];
        }
    }

    /**
     * Get all thread IDs
     * @returns Promise resolving to array of thread IDs
     */
    public async getThreadIds(): Promise<string[]> {
        try {
            const allTodos = await this.getTodos();
            return Object.keys(allTodos);
        } catch (error) {
            logger.error('Error getting thread IDs:', error);
            return [];
        }
    }

    /**
     * Get all threads with their todos
     * @returns Promise resolving to all threads with their todos
     */
    public async getAllThreadsWithTodos(): Promise<any> {
        try {
            return await this.getTodos();
        } catch (error) {
            logger.error('Error getting all threads with todos:', error);
            return {};
        }
    }

    /**
     * Get todo by ID
     * @param todoId The ID of the todo to retrieve
     * @returns Promise resolving to the todo item or null if not found
     */
    public async getTodoById(todoId: string): Promise<any | null> {
        try {
            const allTodos = await this.getTodos();
            
            for (const threadId in allTodos) {
                if (allTodos[threadId] && allTodos[threadId].toDos) {
                    const todo = allTodos[threadId].toDos.find((todo: any) => todo.id === todoId);
                    if (todo) {
                        return todo;
                    }
                }
            }
            return null;
        } catch (error) {
            logger.error('Error getting todo by ID:', error);
            return null;
        }
    }

    /**
     * Get todo statistics
     * @param threadId Optional thread ID to filter stats by
     * @returns Promise resolving to todo statistics
     */
    public async getTodoStats(threadId?: string): Promise<{ total: number; completed: number; pending: number; processing: number }> {
        try {
            let todos: any[] = [];
            
            if (threadId) {
                todos = await this.getTodosByThreadId(threadId);
            } else {
                const allTodos = await this.getTodos();
                for (const tid in allTodos) {
                    if (allTodos[tid] && allTodos[tid].toDos) {
                        todos.push(...allTodos[tid].toDos);
                    }
                }
            }
            
            const total = todos.length;
            const completed = todos.filter(todo => todo.status === 'completed').length;
            const pending = todos.filter(todo => todo.status === 'pending').length;
            const processing = todos.filter(todo => todo.status === 'processing').length;
            
            return { total, completed, pending, processing };
        } catch (error) {
            logger.error('Error getting todo stats:', error);
            return { total: 0, completed: 0, pending: 0, processing: 0 };
        }
    }

    /**
     * Export todos for backup/transfer
     * @param threadId Optional thread ID to export specific thread
     * @returns Promise resolving to array of todos
     */
    public async exportTodos(threadId?: string): Promise<any[]> {
        try {
            if (threadId) {
                return await this.getTodosByThreadId(threadId);
            } else {
                const allTodos = await this.getTodos();
                const todos: any[] = [];
                for (const tid in allTodos) {
                    if (allTodos[tid] && allTodos[tid].toDos) {
                        todos.push(...allTodos[tid].toDos);
                    }
                }
                return todos;
            }
        } catch (error) {
            logger.error('Error exporting todos:', error);
            return [];
        }
    }

    /**
     * Delete completed todos
     * @param threadId Optional thread ID to delete completed todos from specific thread
     * @returns Promise resolving to number of deleted todos
     */
    public async deleteCompletedTodos(threadId?: string): Promise<number> {
        try {
            const allTodos = await this.getTodos();
            let deletedCount = 0;

            if (threadId) {
                // Delete completed todos from specific thread
                if (allTodos[threadId] && allTodos[threadId].toDos) {
                    const initialCount = allTodos[threadId].toDos.length;
                    allTodos[threadId].toDos = allTodos[threadId].toDos.filter((todo: any) => todo.status !== 'completed');
                    deletedCount = initialCount - allTodos[threadId].toDos.length;
                }
            } else {
                // Delete completed todos from all threads
                for (const tId in allTodos) {
                    if (allTodos[tId] && allTodos[tId].toDos) {
                        const initialCount = allTodos[tId].toDos.length;
                        allTodos[tId].toDos = allTodos[tId].toDos.filter((todo: any) => todo.status !== 'completed');
                        deletedCount += initialCount - allTodos[tId].toDos.length;
                    }
                }
            }

            if (deletedCount > 0) {
                await this.saveTodoStructure(allTodos);
                logger.info(`Deleted ${deletedCount} completed todos`);
            }

            return deletedCount;
        } catch (error) {
            logger.error('Error deleting completed todos:', error);
            return 0;
        }
    }

    /**
     * Archive a thread
     * @param threadId The thread ID to archive
     * @returns Promise resolving to boolean indicating success
     */
    public async archiveThread(threadId: string): Promise<boolean> {
        try {
            const allTodos = await this.getTodos();

            if (!allTodos[threadId]) {
                logger.error(`Thread ${threadId} not found`);
                return false;
            }

            allTodos[threadId].archived = true;
            await this.saveTodoStructure(allTodos);

            logger.info(`Archived thread: ${threadId}`);
            return true;
        } catch (error) {
            logger.error('Error archiving thread:', error);
            return false;
        }
    }

    /**
     * Unarchive a thread
     * @param threadId The thread ID to unarchive
     * @returns Promise resolving to boolean indicating success
     */
    public async unarchiveThread(threadId: string): Promise<boolean> {
        try {
            const allTodos = await this.getTodos();

            if (!allTodos[threadId]) {
                logger.error(`Thread ${threadId} not found`);
                return false;
            }

            allTodos[threadId].archived = false;
            await this.saveTodoStructure(allTodos);

            logger.info(`Unarchived thread: ${threadId}`);
            return true;
        } catch (error) {
            logger.error('Error unarchiving thread:', error);
            return false;
        }
    }

    /**
     * Initialize the todo file
     * @returns Promise resolving when initialization is complete
     */
    public async init(): Promise<void> {
        try {
            const codeboltDir = path.join(this.projectPath, '.codebolt');
            const todoPath = path.join(codeboltDir, 'todos.json');

            if (!fs.existsSync(codeboltDir)) {
                fs.mkdirSync(codeboltDir, { recursive: true });
            }

            if (!fs.existsSync(todoPath)) {
                fs.writeFileSync(todoPath, JSON.stringify({}));
            }
        } catch (error) {
            logger.error('Error initializing todo file:', error);
        }
    }

    /**
     * Helper method to save the todo structure
     * @param todoStructure The todo structure to save
     * @returns Promise resolving when save is complete
     */
    private async saveTodoStructure(todoStructure: any): Promise<void> {
        try {
            const todoPath = path.join(this.projectPath, '.codebolt', 'todos.json');
            const tempFilePath = todoPath + '.tmp';
            
            fs.writeFileSync(tempFilePath, JSON.stringify(todoStructure, null, 2));
            fs.renameSync(tempFilePath, todoPath);
        } catch (error) {
            logger.error('Error saving todo structure:', error);
            throw error;
        }
    }

    /**
     * Create a new todo
     * @param todoData The data for the new todo
     * @returns Promise resolving to the created todo or null if failed
     */
    public async createTodo(todoData: CreateTodoRequest): Promise<TodoItem | null> {
        try {
            const allTodos = await this.getTodos();
            const { threadId } = todoData;

            const newTodo: TodoItem = {
                id: uuidv4(),
                title: todoData.title,
                status: 'pending',
                createdAt: new Date().toISOString(),
                priority: todoData.priority || 'medium',
                tags: todoData.tags || []
            };

            // Initialize thread if it doesn't exist
            if (!allTodos[threadId]) {
                allTodos[threadId] = {
                    id: threadId,
                    title: undefined,
                    toDos: []
                };
            }

            allTodos[threadId].toDos.push(newTodo);
            await this.saveTodoStructure(allTodos);

            logger.info(`Created new todo: ${newTodo.title} (ID: ${newTodo.id})`);
            return newTodo;
        } catch (error) {
            logger.error('Error creating todo:', error);
            return null;
        }
    }

    /**
     * Update an existing todo
     * @param todoId The ID of the todo to update
     * @param updateData The data to update
     * @returns Promise resolving to the updated todo or null if not found
     */
    public async updateTodo(todoId: string, updateData: UpdateTodoRequest): Promise<TodoItem | null> {
        try {
            const allTodos = await this.getTodos();

            for (const threadId in allTodos) {
                if (allTodos[threadId] && allTodos[threadId].toDos) {
                    const todoIndex = allTodos[threadId].toDos.findIndex((todo: any) => todo.id === todoId);

                    if (todoIndex !== -1) {
                        const existingTodo = allTodos[threadId].toDos[todoIndex];
                        const updatedTodo: TodoItem = {
                            ...existingTodo,
                            ...updateData,
                            updatedAt: new Date().toISOString()
                        };

                        allTodos[threadId].toDos[todoIndex] = updatedTodo;
                        await this.saveTodoStructure(allTodos);

                        logger.info(`Updated todo: ${updatedTodo.title} (ID: ${todoId})`);
                        return updatedTodo;
                    }
                }
            }

            logger.warn(`Todo not found: ${todoId}`);
            return null;
        } catch (error) {
            logger.error('Error updating todo:', error);
            return null;
        }
    }

    /**
     * Update todo status
     * @param todoId The ID of the todo to update
     * @param status The new status
     * @returns Promise resolving to the updated todo or null if failed
     */
    public async updateTodoStatus(todoId: string, status: TodoStatus): Promise<TodoItem | null> {
        try {
            return await this.updateTodo(todoId, { status });
        } catch (error) {
            logger.error('Error updating todo status:', error);
            return null;
        }
    }

    /**
     * Delete a todo
     * @param todoId The ID of the todo to delete
     * @returns Promise resolving to boolean indicating success
     */
    public async deleteTodo(todoId: string): Promise<boolean> {
        try {
            const allTodos = await this.getTodos();

            for (const threadId in allTodos) {
                if (allTodos[threadId] && allTodos[threadId].toDos) {
                    const todoIndex = allTodos[threadId].toDos.findIndex((todo: any) => todo.id === todoId);

                    if (todoIndex !== -1) {
                        const deletedTodo = allTodos[threadId].toDos[todoIndex];
                        allTodos[threadId].toDos.splice(todoIndex, 1);
                        await this.saveTodoStructure(allTodos);

                        logger.info(`Deleted todo: ${deletedTodo.title} (ID: ${todoId})`);
                        return true;
                    }
                }
            }

            logger.warn(`Todo not found for deletion: ${todoId}`);
            return false;
        } catch (error) {
            logger.error('Error deleting todo:', error);
            return false;
        }
    }

    /**
     * Create multiple todos
     * @param todosData Array of todo data to create
     * @returns Promise resolving to array of created todos
     */
    public async createMultipleTodos(todosData: CreateTodoRequest[]): Promise<TodoItem[]> {
        try {
            const createdTodos: TodoItem[] = [];
            const allTodos = await this.getTodos();

            for (const todoData of todosData) {
                const { threadId } = todoData;

                const newTodo: TodoItem = {
                    id: uuidv4(),
                    title: todoData.title,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    priority: todoData.priority || 'medium',
                    tags: todoData.tags || []
                };

                // Initialize thread if it doesn't exist
                if (!allTodos[threadId]) {
                    allTodos[threadId] = {
                        id: threadId,
                        title: 'Todo List',
                        toDos: []
                    };
                }

                allTodos[threadId].toDos.push(newTodo);
                createdTodos.push(newTodo);
            }

            await this.saveTodoStructure(allTodos);
            logger.info(`Created ${createdTodos.length} todos in bulk`);

            return createdTodos;
        } catch (error) {
            logger.error('Error creating multiple todos:', error);
            return [];
        }
    }

    /**
     * Import todos for restore/transfer
     * @param importedTodos Array of todos to import
     * @param threadId Thread ID to import into
     * @param overwrite Whether to overwrite existing todos
     * @returns Promise resolving to number of imported todos
     */
    public async importTodos(importedTodos: TodoItem[], threadId: string, overwrite: boolean = false): Promise<number> {
        try {
            const allTodos = await this.getTodos();
            let importedCount = 0;

            // Initialize thread if it doesn't exist
            if (!allTodos[threadId]) {
                allTodos[threadId] = {
                    id: threadId,
                    title: 'Todo List',
                    toDos: []
                };
            }

            const existingTodos = overwrite ? [] : allTodos[threadId].toDos;

            for (const todo of importedTodos) {
                // Check if todo already exists (by ID)
                const existingIndex = existingTodos.findIndex((existing: any) => existing.id === todo.id);

                if (existingIndex !== -1) {
                    if (overwrite) {
                        existingTodos[existingIndex] = { ...todo, updatedAt: new Date().toISOString() };
                        importedCount++;
                    }
                } else {
                    existingTodos.push({ ...todo, updatedAt: new Date().toISOString() });
                    importedCount++;
                }
            }

            allTodos[threadId].toDos = existingTodos;
            await this.saveTodoStructure(allTodos);
            logger.info(`Imported ${importedCount} todos`);

            return importedCount;
        } catch (error) {
            logger.error('Error importing todos:', error);
            return 0;
        }
    }
}
