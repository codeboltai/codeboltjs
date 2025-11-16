import { BaseMarkdownNode } from '@agent-creator/shared-nodes';
import { LGraphCanvas } from '@codebolt/litegraph';

// Frontend-specific Markdown Node - UI and rendering only
export class MarkdownNode extends BaseMarkdownNode {
  private _resizing?: boolean;
  private _resizeStart?: [number, number];

  constructor() {
    super();
    // Frontend-specific UI setup
    this.addWidget("text", "content", this.properties.content as string, (value) => {
      this.setProperty("content", value);
    }, { multiline: true });

    this.addWidget("number", "width", this.properties.width as number, (value) => {
      this.updateSize(value, this.properties.height as number);
    });

    this.addWidget("number", "height", this.properties.height as number, (value) => {
      this.updateSize(this.properties.width as number, value);
    });

    // Set initial size
    this.updateSize(this.properties.width as number, this.properties.height as number);
  }

  // Frontend rendering
  onDrawForeground(ctx: CanvasRenderingContext2D, _canvas: LGraphCanvas): void {
    if (this.flags.collapsed) return;

    const content = this.processContent(this.getInputData(0), this.properties.content as string);
    if (!content) return;

    // Create a rendering area within the node
    const x = 10;
    const y = 40;
    const width = this.properties.width as number;
    const height = this.properties.height as number;

    // Draw markdown content background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, width, height);

    // Draw border
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    // Set up text rendering
    ctx.fillStyle = "#333";
    ctx.font = "12px Arial";

    // Simple markdown rendering (you could enhance this with a proper markdown parser)
    const lines = content.split('\n');
    let currentY = y + 20;
    const lineHeight = 18;
    const padding = 10;

    lines.forEach(line => {
      if (currentY > y + height - padding) return; // Stop if we run out of space

      let processedLine = line;
      let currentX = x + padding;

      // Process markdown formatting
      if (line.startsWith('# ')) {
        // Heading 1
        ctx.font = "bold 16px Arial";
        ctx.fillStyle = "#111";
        processedLine = line.substring(2);
      } else if (line.startsWith('## ')) {
        // Heading 2
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "#222";
        processedLine = line.substring(3);
      } else if (line.startsWith('### ')) {
        // Heading 3
        ctx.font = "bold 13px Arial";
        ctx.fillStyle = "#333";
        processedLine = line.substring(4);
      } else {
        // Regular text
        ctx.font = "12px Arial";
        ctx.fillStyle = "#333";
      }

      // Handle bold text **bold**
      const boldMatches = line.match(/\*\*(.*?)\*\*/g);
      if (boldMatches) {
        let segments = line.split(/\*\*(.*?)\*\*/);
        let boldIndex = 1;

        segments.forEach((segment, index) => {
          if (index % 2 === 1) {
            // This is bold content
            ctx.save();
            const fontSize = parseInt(ctx.font.match(/\d+px/)?.[0] || '12px');
            ctx.font = `${fontSize + 1}px ${ctx.font.split(' ').slice(1).join(' ')}`;
            ctx.fillText(segment, currentX, currentY);
            const metrics = ctx.measureText(segment);
            currentX += metrics.width;
            ctx.restore();
            boldIndex++;
          } else if (segment) {
            // Regular content
            ctx.fillText(segment, currentX, currentY);
            const metrics = ctx.measureText(segment);
            currentX += metrics.width;
          }
        });
      } else {
        // No formatting, just render the line
        ctx.fillText(processedLine, currentX, currentY);
      }

      currentY += lineHeight;
    });
  }

  // Handle mouse events for resizing
  onMouseDown(_e: any, pos: [number, number]): boolean {
    if (this.flags.collapsed) return false;

    // Check if clicking on resize handle (bottom-right corner)
    const handleSize = 10;
    const handleX = this.size[0] - handleSize;
    const handleY = this.size[1] - handleSize;

    if (pos[0] >= handleX && pos[1] >= handleY) {
      this._resizing = true;
      this._resizeStart = [pos[0] - this.size[0], pos[1] - this.size[1]];
      return true;
    }

    return false;
  }

  onMouseMove(_e: any, pos: [number, number]): boolean {
    if (this._resizing && this._resizeStart) {
      const newWidth = Math.max(100, pos[0] - this._resizeStart[0]);
      const newHeight = Math.max(50, pos[1] - this._resizeStart[1]);
      this.updateSize(newWidth - 20, newHeight - 50); // Account for padding
      return true;
    }
    return false;
  }

  onMouseUp(_e: any, _pos: [number, number]): boolean {
    if (this._resizing) {
      this._resizing = false;
      delete this._resizeStart;
      return true;
    }
    return false;
  }

  // No execution logic in frontend
  onExecute() {
    // console.log(`MarkdownNode ${this.id} - UI only, execution handled by backend`);
  }

  // Handle property changes with UI updates
  setProperty(name: string, value: any): void {
    super.setProperty(name, value);

    // Update widgets if they exist
    const widget = this.widgets?.find(w => w.name === name);
    if (widget) {
      widget.value = value;
    }

    // Trigger redraw if content changed
    if (name === 'content' || name === 'width' || name === 'height') {
      this.setDirtyCanvas(true, false);
    }
  }

  // Draw resize handle
  onDrawBackground(ctx: CanvasRenderingContext2D): void {
    if (!this.flags.collapsed) {
      const handleSize = 10;
      const handleX = this.size[0] - handleSize;
      const handleY = this.size[1] - handleSize;

      // Draw resize handle
      ctx.fillStyle = "#ccc";
      ctx.fillRect(handleX, handleY, handleSize, handleSize);

      // Draw resize icon
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(handleX + 2, handleY + handleSize - 2);
      ctx.lineTo(handleX + handleSize - 2, handleY + 2);
      ctx.moveTo(handleX + 5, handleY + handleSize - 2);
      ctx.lineTo(handleX + handleSize - 2, handleY + 5);
      ctx.stroke();
    }
  }
}