import fs from 'fs';
import path from 'path';
import os from 'os';
import { TodoService } from '../services/TodoService';

// Reset the singleton instance
const resetTodoService = () => {
  (TodoService as any).instance = null;
};

describe('TodoService', () => {
  let todoService: TodoService;
  let tempDir: string;
  let testTodoPath: string;

  beforeEach(() => {
    resetTodoService();
    
    // Create a temporary directory for our test
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-test-'));
    testTodoPath = path.join(tempDir, 'todo.json');
    
    todoService = TodoService.getInstance(tempDir);
  });

  afterEach(() => {
    // Clean up test files after each test
    if (fs.existsSync(testTodoPath)) {
      fs.unlinkSync(testTodoPath);
    }
    
    // Clean up the temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  afterAll(() => {
    resetTodoService();
  });

  describe('getTodos', () => {
    it('should return an empty object when the todo file does not exist', async () => {
      // Ensure the file doesn't exist
      if (fs.existsSync(testTodoPath)) {
        fs.unlinkSync(testTodoPath);
      }

      const todos = await todoService.getTodos();
      expect(todos).toEqual({});
    });

    it('should return an empty object when the todo file is invalid JSON', async () => {
      // Create an invalid JSON file
      fs.writeFileSync(testTodoPath, 'invalid json content');

      const todos = await todoService.getTodos();
      expect(todos).toEqual({});
    });

    it('should return the todo data when the todo file is valid', async () => {
      // Create a valid JSON file with todos
      const testTodos = {
        "thread_1760463832527_s4qx4r7rj": {
          "id": "thread_1760463832527_s4qx4r7rj",
          "toDos": [
            {
              "id": "6d742997-be1f-41ce-9359-657b028348d5",
              "title": "Analyze project requirements and plan system architecture",
              "status": "completed",
              "createdAt": "2025-10-15T04:20:01.198Z",
              "priority": "medium",
              "tags": [],
              "updatedAt": "2025-10-15T04:20:01.198Z"
            }
          ]
        }
      };

      fs.writeFileSync(testTodoPath, JSON.stringify(testTodos));

      const todos = await todoService.getTodos();
      expect(todos).toEqual(testTodos);
    });

    it('should return an empty object when there is an error reading the file', async () => {
      // Mock fs.existsSync to throw an error
      const originalExistsSync = fs.existsSync;
      fs.existsSync = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      const todos = await todoService.getTodos();
      expect(todos).toEqual({});

      // Restore the original function
      fs.existsSync = originalExistsSync;
    });
  });

  describe('getTodosByThreadId', () => {
    it('should return an empty array when the thread ID does not exist', async () => {
      const todos = await todoService.getTodosByThreadId('non-existent-thread');
      expect(todos).toEqual([]);
    });

    it('should return the todos for a specific thread ID', async () => {
      // Create a valid JSON file with todos
      const testTodos = {
        "thread_1760463832527_s4qx4r7rj": {
          "id": "thread_1760463832527_s4qx4r7rj",
          "toDos": [
            {
              "id": "6d742997-be1f-41ce-9359-657b028348d5",
              "title": "Analyze project requirements and plan system architecture",
              "status": "completed",
              "createdAt": "2025-10-15T04:20:01.198Z",
              "priority": "medium",
              "tags": [],
              "updatedAt": "2025-10-15T04:20:01.198Z"
            }
          ]
        }
      };

      fs.writeFileSync(testTodoPath, JSON.stringify(testTodos));

      const todos = await todoService.getTodosByThreadId('thread_1760463832527_s4qx4r7rj');
      expect(todos).toEqual(testTodos.thread_1760463832527_s4qx4r7rj.toDos);
    });
  });

  describe('getThreadIds', () => {
    it('should return an empty array when there are no todos', async () => {
      const threadIds = await todoService.getThreadIds();
      expect(threadIds).toEqual([]);
    });

    it('should return the thread IDs when there are todos', async () => {
      // Create a valid JSON file with todos
      const testTodos = {
        "thread_1760463832527_s4qx4r7rj": {
          "id": "thread_1760463832527_s4qx4r7rj",
          "toDos": []
        },
        "ba63d112-47c0-42ce-9468-fae09c1b6cb1": {
          "id": "ba63d112-47c0-42ce-9468-fae09c1b6cb1",
          "toDos": []
        }
      };

      fs.writeFileSync(testTodoPath, JSON.stringify(testTodos));

      const threadIds = await todoService.getThreadIds();
      expect(threadIds).toEqual([
        'thread_1760463832527_s4qx4r7rj',
        'ba63d112-47c0-42ce-9468-fae09c1b6cb1'
      ]);
    });
  });
});