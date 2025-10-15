import { TodoController } from '../controllers/TodoController';

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

describe('TodoController', () => {
  let todoController: TodoController;

  beforeEach(() => {
    todoController = new TodoController();
  });

  describe('getTodos', () => {
    it('should return todos when the service call is successful', async () => {
      const mockTodos = {
        "thread_1760463832527_s4qx4r7rj": {
          "id": "thread_1760463832527_s4qx4r7rj",
          "toDos": []
        }
      };

      mockTodoService.getTodos.mockResolvedValue(mockTodos);

      // Mock request and response
      const mockReq: any = {
        query: {}
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await todoController.getTodos(mockReq, mockRes);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        todos: mockTodos
      });
    });

    it('should return an error when the service call fails', async () => {
      mockTodoService.getTodos.mockRejectedValue(new Error('Test error'));

      // Mock request and response
      const mockReq: any = {
        query: {}
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await todoController.getTodos(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Test error'
      });
    });
  });

  describe('getTodosByThreadId', () => {
    it('should return todos for a specific thread when the service call is successful', async () => {
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

      // Mock request and response
      const mockReq: any = {
        params: {
          threadId: 'thread_1760463832527_s4qx4r7rj'
        },
        query: {}
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await todoController.getTodosByThreadId(mockReq, mockRes);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        todos: mockTodos
      });
    });
  });

  describe('getThreadIds', () => {
    it('should return thread IDs when the service call is successful', async () => {
      const mockThreadIds = [
        'thread_1760463832527_s4qx4r7rj',
        'ba63d112-47c0-42ce-9468-fae09c1b6cb1'
      ];

      mockTodoService.getThreadIds.mockResolvedValue(mockThreadIds);

      // Mock request and response
      const mockReq: any = {
        query: {}
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await todoController.getThreadIds(mockReq, mockRes);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        threadIds: mockThreadIds
      });
    });
  });
});