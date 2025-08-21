import { ToolList as IToolList, Tool } from '../types/interfaces';

export class ToolList implements IToolList {
    private tools: Map<string, Tool> = new Map();

    constructor(tools: Tool[] = []) {
        tools.forEach(tool => this.addTool(tool));
    }

    getTool(name: string): Tool | undefined {
        return this.tools.get(name);
    }

    getAllTools(): Tool[] {
        return Array.from(this.tools.values());
    }

    addTool(tool: Tool): void {
        this.tools.set(tool.name, tool);
    }

    removeTool(name: string): void {
        this.tools.delete(name);
    }
}
