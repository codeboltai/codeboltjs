import { logger } from '@/utils/logger';
import fs from 'fs';
import path from 'path';

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
            const todoPath = path.join(this.projectPath, 'todo.json');
            
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
}