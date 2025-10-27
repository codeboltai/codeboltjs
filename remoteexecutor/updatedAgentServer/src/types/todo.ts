// Todo related types
export type TodoStatus = 'pending' | 'processing' | 'completed';

export interface TodoItem {
    id: string;
    title: string;
    status: TodoStatus; // 'pending' | 'processing' | 'completed'
    createdAt: string;
    updatedAt?: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
}

export interface TodoList {
    id: string;
    title?: string; // Made optional - will show threadId if not provided
    toDos: TodoItem[];
    archived?: boolean; // Flag to mark thread as archived
}

export interface CreateTodoRequest {
    title: string;
    threadId: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
}

export interface UpdateTodoRequest {
    title?: string;
    status?: TodoStatus;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
}

export interface TodoResponse {
    success: boolean;
    todo?: TodoItem;
    todos?: TodoItem[];
    message?: string;
    error?: string;
}