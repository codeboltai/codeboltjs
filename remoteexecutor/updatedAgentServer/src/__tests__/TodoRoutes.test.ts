import express from 'express';
import request from 'supertest';
import { TodoRoutes } from '../routes/todoRoutes';

// Mock the TodoService
const mockTodoService = {
  getTodos: jest.fn(),
  getTodosByThreadId: jest.fn(),
  getThreadIds: jest.fn()
};

jest.mock('../services/TodoService', () => {
  return {
    TodoService: {
      getInstance: jest.fn(() => mockTodoService)
    }
  };
});

describe('TodoRoutes', () => {
  let app: express.Application;
  let todoRoutes: TodoRoutes;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    todoRoutes = new TodoRoutes();
    app.use('/todos', todoRoutes.router);
  });

  describe('GET /todos/', () => {
    it('should return all todos', async () => {
      const mockTodos = {
        "thread_1760463832527_s4qx4r7rj": {
          "id": "thread_1760463832527_s4qx4r7rj",
          "toDos": []
        }
      };

      mockTodoService.getTodos.mockResolvedValue(mockTodos);

      const response = await request(app).get('/todos/');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        todos: mockTodos
      });
    });
  });

  describe('GET /todos/thread/:threadId', () => {
    it('should return todos for a specific thread', async () => {
      const mockTodos = [
        {
          "id": "6d742997-be1f-41ce-9359-657b028348d5",
          "title": "Analyze project requirements and plan system architecture",
          "status": "completed",
          "createdAt": "2025-10-15T04:20:01.198Z",
          "priority": "medium",
          "tags": [],
          "updatedAt": "2025-10-15T04:20:01.198Z"
        }
      ];

      mockTodoService.getTodosByThreadId.mockResolvedValue(mockTodos);

      const response = await request(app).get('/todos/thread/thread_1760463832527_s4qx4r7rj');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        todos: mockTodos
      });
    });
  });

  describe('GET /todos/threads', () => {
    it('should return all thread IDs', async () => {
      const mockThreadIds = [
        'thread_1760463832527_s4qx4r7rj',
        'ba63d112-47c0-42ce-9468-fae09c1b6cb1'
      ];

      mockTodoService.getThreadIds.mockResolvedValue(mockThreadIds);

      const response = await request(app).get('/todos/threads');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        threadIds: mockThreadIds
      });
    });
  });

  describe('GET /todos/health', () => {
    it('should return success: true for health check', async () => {
      const response = await request(app).get('/todos/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });
  });
});