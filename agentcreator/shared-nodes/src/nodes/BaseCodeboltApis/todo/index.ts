import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

export class BaseAddTodoNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/todo/addTodo",
        title: "Add Todo",
        category: "codebolt/todo",
        description: "Adds a new todo item",
        icon: "✅",
        color: "#4CAF50"
    };
    constructor() {
        super(BaseAddTodoNode.metadata.title, BaseAddTodoNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("title", "string");
        this.addInput("priority", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("todo", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseUpdateTodoNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/todo/updateTodo",
        title: "Update Todo",
        category: "codebolt/todo",
        description: "Updates an existing todo item",
        icon: "✏️",
        color: "#4CAF50"
    };
    constructor() {
        super(BaseUpdateTodoNode.metadata.title, BaseUpdateTodoNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("id", "string");
        this.addInput("title", "string");
        this.addInput("status", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("todo", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseGetTodoListNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/todo/getTodoList",
        title: "Get Todo List",
        category: "codebolt/todo",
        description: "Gets the todo list",
        icon: "📋",
        color: "#4CAF50"
    };
    constructor() {
        super(BaseGetTodoListNode.metadata.title, BaseGetTodoListNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("todos", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseGetAllIncompleteTodosNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/todo/getAllIncompleteTodos",
        title: "Get Incomplete Todos",
        category: "codebolt/todo",
        description: "Gets all incomplete todo items",
        icon: "⏳",
        color: "#4CAF50"
    };
    constructor() {
        super(BaseGetAllIncompleteTodosNode.metadata.title, BaseGetAllIncompleteTodosNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("todos", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}
