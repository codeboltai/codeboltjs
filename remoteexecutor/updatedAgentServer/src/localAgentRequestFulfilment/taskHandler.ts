import {
  ClientConnection,
  formatLogMessage
} from '../types'; 
import { NotificationService } from '../services/NotificationService';
import type { 
  TaskEvent,
  AddTodoResponseNotification,
  GetTodoTasksResponseNotification,
  EditTodoTaskResponseNotification
} from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../core/connectionManagers/connectionManager';

// Simple in-memory task management
interface Task {
  id: string;
  title: string;
  description?: string;
  phase?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  agentId: string;
  completed?: boolean;
  createdAt: Date;
  updatedAt: Date;
  subtasks?: SubTask[];
}

interface SubTask {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completed?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Handles task events with notifications (following readFileHandler pattern)
 */
export class TaskHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;
  private tasks: Map<string, Task> = new Map();
  private nextTaskId = 1;
  private nextSubTaskId = 1;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
  }

  /**
   * Handle task events with actual task operations (following readFileHandler pattern)
   */
  handleTaskEvent(agent: ClientConnection, taskEvent: TaskEvent) {
    const { requestId, action } = taskEvent;
    console.log(formatLogMessage('info', 'TaskHandler', `Handling task event: ${action} from ${agent.id}`));

    // Execute actual Task operations
    switch (action) {
      case 'createTask':
        {
          console.log(formatLogMessage('info', 'TaskHandler', `Sent task addTask request notification`));
          
          (async () => {
            try {
              const addTaskEvent = taskEvent as any;
              const taskData = addTaskEvent.message;
              const agentId = addTaskEvent.agentId || agent.id;
              
              if (!taskData.title && !(taskData as any).task) {
                throw new Error('Task title is required');
              }

              const title = taskData.title || (taskData as any).task;
              const newTask = await this.createTask({
                title,
                description: taskData.description,
                phase: taskData.phase,
                category: taskData.category,
                priority: taskData.priority,
                tags: taskData.tags,
                agentId
              });
              
              const response = {
                success: true,
                data: newTask,
                type: 'createTaskResponse',
                id: requestId,
                message: `Task created: ${title}`
              };
              
              this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

              // Send response notification to app
              const responseNotification: AddTodoResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'tasknotify',
                action: 'addTaskResult',
                content: newTask,
                isError: false
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
              console.log(formatLogMessage('info', 'TaskHandler', `Sent task addTask response notification`));

            } catch (error) {
              const errorResponse = {
                success: false,
                error: `Failed to create task: ${error}`,
                type: 'addTaskResponse',
                id: requestId
              };

              this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

              // Send error notification to app
              const errorNotification: AddTodoResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'tasknotify',
                action: 'addTaskResult',
                content: error instanceof Error ? error.message : String(error),
                isError: true
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
            }
          })();
        }
        break;

      case 'getTaskList':
        {
          console.log(formatLogMessage('info', 'TaskHandler', `Sent task getTasks request notification`));
          
          (async () => {
            try {
              const getTasksEvent = taskEvent as any;
              const filters = getTasksEvent.message || {};
              
              const tasks = await this.getTasks(filters);
              
              const response = {
                success: true,
                data: tasks,
                type: 'getTaskListResponse',
                id: requestId,
                message: `Retrieved ${tasks.length} tasks`
              };
              
              this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

              // Send response notification to app
              const responseNotification: GetTodoTasksResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'tasknotify',
                action: 'getTasksResult',
                content: tasks,
                isError: false
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
              console.log(formatLogMessage('info', 'TaskHandler', `Sent task getTasks response notification`));

            } catch (error) {
              const errorResponse = {
                success: false,
                error: `Failed to get tasks: ${error}`,
                type: 'getTaskListResponse',
                id: requestId
              };

              this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

              // Send error notification to app
              const errorNotification: GetTodoTasksResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'tasknotify',
                action: 'getTasksResult',
                content: error instanceof Error ? error.message : String(error),
                isError: true
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
            }
          })();
        }
        break;

      case 'updateTask':
        {
          console.log(formatLogMessage('info', 'TaskHandler', `Sent task updateTask request notification`));
          
          (async () => {
            try {
              const updateTaskEvent = taskEvent as any;
              const updateData = updateTaskEvent.message;
              
              if (!updateData.taskId) {
                throw new Error('Task ID is required for update');
              }

              const updatedTask = await this.updateTask(updateData.taskId, updateData);
              
              const response = {
                success: true,
                data: updatedTask,
                type: 'updateTaskResponse',
                id: requestId,
                message: `Task updated successfully`
              };
              
              this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

              // Send response notification to app
              const responseNotification: EditTodoTaskResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'tasknotify',
                action: 'updateTaskResult',
                content: updatedTask,
                isError: false
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
              console.log(formatLogMessage('info', 'TaskHandler', `Sent task updateTask response notification`));

            } catch (error) {
              const errorResponse = {
                success: false,
                error: `Failed to update task: ${error}`,
                type: 'updateTaskResponse',
                id: requestId
              };

              this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

              // Send error notification to app
              const errorNotification: EditTodoTaskResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'tasknotify',
                action: 'updateTaskResult',
                content: error instanceof Error ? error.message : String(error),
                isError: true
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
            }
          })();
        }
        break;

      case 'deleteTask':
        {
          console.log(formatLogMessage('info', 'TaskHandler', `Sent task deleteTask request notification`));
          
          (async () => {
            try {
              const deleteTaskEvent = taskEvent as any;
              const { taskId } = deleteTaskEvent.message;
              
              const deletedTask = await this.deleteTask(taskId);
              
              const response = {
                success: true,
                data: deletedTask,
                type: 'deleteTaskResponse',
                id: requestId,
                message: `Task deleted successfully`
              };
              
              this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

              // Send response notification to app
              const responseNotification: EditTodoTaskResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'tasknotify',
                action: 'updateTaskResult',
                content: deletedTask,
                isError: false
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
              console.log(formatLogMessage('info', 'TaskHandler', `Sent task deleteTask response notification`));

            } catch (error) {
              const errorResponse = {
                success: false,
                error: `Failed to delete task: ${error}`,
                type: 'deleteTaskResponse',
                id: requestId
              };

              this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

              // Send error notification to app
              const errorNotification: EditTodoTaskResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'tasknotify',
                action: 'updateTaskResult',
                content: error instanceof Error ? error.message : String(error),
                isError: true
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
            }
          })();
        }
        break;

      default:
        const errorResponse = {
          success: false,
          error: `Unknown Task action: ${action}`,
          type: 'taskResponse',
          id: requestId
        };
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        break;
    }
  }

  // Helper methods for task operations
  private async createTask(taskData: {
    title: string;
    description?: string;
    phase?: string;
    category?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    tags?: string[];
    agentId: string;
  }): Promise<Task> {
    const task: Task = {
      id: `task_${this.nextTaskId++}`,
      title: taskData.title,
      description: taskData.description,
      phase: taskData.phase,
      category: taskData.category,
      priority: taskData.priority || 'medium',
      tags: taskData.tags || [],
      status: 'pending',
      agentId: taskData.agentId,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      subtasks: []
    };

    this.tasks.set(task.id, task);
    return task;
  }

  private async getTasks(filters?: {
    agentId?: string;
    category?: string;
    phase?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    tags?: string[];
  }): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values());

    if (filters) {
      if (filters.agentId) {
        tasks = tasks.filter(task => task.agentId === filters.agentId);
      }
      if (filters.category) {
        tasks = tasks.filter(task => task.category === filters.category);
      }
      if (filters.phase) {
        tasks = tasks.filter(task => task.phase === filters.phase);
      }
      if (filters.priority) {
        tasks = tasks.filter(task => task.priority === filters.priority);
      }
      if (filters.status) {
        tasks = tasks.filter(task => task.status === filters.status);
      }
      if (filters.tags && filters.tags.length > 0) {
        tasks = tasks.filter(task => 
          task.tags?.some(tag => filters.tags!.includes(tag))
        );
      }
    }

    return tasks;
  }

  private async updateTask(taskId: string, updates: {
    title?: string;
    description?: string;
    phase?: string;
    category?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    tags?: string[];
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    agentId?: string;
    completed?: boolean;
  }): Promise<Task> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    // Update task properties
    if (updates.title !== undefined) task.title = updates.title;
    if (updates.description !== undefined) task.description = updates.description;
    if (updates.phase !== undefined) task.phase = updates.phase;
    if (updates.category !== undefined) task.category = updates.category;
    if (updates.priority !== undefined) task.priority = updates.priority;
    if (updates.tags !== undefined) task.tags = updates.tags;
    if (updates.status !== undefined) task.status = updates.status;
    if (updates.agentId !== undefined) task.agentId = updates.agentId;
    if (updates.completed !== undefined) {
      task.completed = updates.completed;
      task.status = updates.completed ? 'completed' : 'pending';
    }

    task.updatedAt = new Date();
    this.tasks.set(taskId, task);
    return task;
  }

  private async deleteTask(taskId: string): Promise<Task> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    this.tasks.delete(taskId);
    return task;
  }
}
