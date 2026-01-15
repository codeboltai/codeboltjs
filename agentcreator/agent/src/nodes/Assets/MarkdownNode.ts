import { BaseMarkdownNode } from '@codebolt/agent-shared-nodes';

// Backend-specific Markdown Node - minimal execution logic
export class MarkdownNode extends BaseMarkdownNode {
  constructor() {
    super();
    // Backend doesn't need UI widgets
    this.size = [200, 60]; // Smaller size for backend
  }

  // Backend execution logic
  onExecute() {
    const inputContent = this.getInputData(0);
    const content = this.processContent(inputContent, this.properties.content);
    const processedMarkdown = this.processMarkdown(content);

    // In backend, we could process markdown and output as HTML
    // or keep it as a display-only node
    // console.log(`MarkdownNode ${this.id}: Processing ${content.length} characters`);

    // If this node has outputs, you could output the processed HTML
    if (this.outputs && this.outputs.length > 0) {
      this.setOutputData(0, processedMarkdown);
    }

    // Store for potential retrieval
    this._lastProcessedContent = processedMarkdown;
  }

  // Backend method to get processed content
  getProcessedContent() {
    return this._lastProcessedContent || "";
  }

  // Backend validation
  validateContent(content) {
    if (typeof content !== 'string') {
      console.warn(`MarkdownNode ${this.id}: Invalid content type, expected string`);
      return String(content || "");
    }
    return content;
  }

  // Override setProperty to add validation
  setProperty(name, value) {
    if (name === 'content') {
      this.properties.content = this.validateContent(value);
    } else if (name === 'width' || name === 'height') {
      this.properties[name] = Math.max(50, parseInt(value) || 100);
    } else {
      super.setProperty(name, value);
    }
  }
}