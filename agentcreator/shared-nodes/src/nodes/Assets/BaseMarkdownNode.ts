import { LGraphNode } from '@codebolt/litegraph';

// Base Markdown Node - shared metadata and structure
export class BaseMarkdownNode extends LGraphNode {
  static metadata = {
    type: "assets/markdown",
    title: "Markdown",
    category: "assets",
    description: "Display markdown-formatted text",
    icon: "📝",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseMarkdownNode.metadata.title, BaseMarkdownNode.metadata.type);
    this.title = BaseMarkdownNode.metadata.title;
    this.addProperty("content", "# Heading\n\nSome **markdown** text here");
    this.addProperty("width", 300);
    this.addProperty("height", 200);
    this.addInput("content", "string");
    this.size = [320, 50]; // Default size for collapsed state
    this.resizable = true;
  }

  // Shared content processing
  processContent(inputContent, propertyContent) {
    return inputContent !== undefined ? inputContent : propertyContent;
  }

  // Shared markdown processing (basic)
  processMarkdown(content) {
    if (!content) return "";

    // Basic markdown processing - in a real implementation,
    // you might want to use a markdown library like marked.js
    return content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`(.*)`/gim, '<code>$1</code>')
      .replace(/\n/gim, '<br>');
  }

  // Shared size handling
  updateSize(width, height) {
    this.properties.width = width;
    this.properties.height = height;
    this.size = [width + 20, height + 50]; // Add padding
  }
}