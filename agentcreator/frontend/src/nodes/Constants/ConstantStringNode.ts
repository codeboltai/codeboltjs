import { BaseConstantStringNode } from '@codebolt/agent-shared-nodes';

// Frontend Constant String Node - UI only
export class ConstantStringNode extends BaseConstantStringNode {
  constructor() {
    super();
    // Frontend-specific widget with proper property synchronization
    const widget = this.addWidget("text", "value", this.properties.value as string, "value");

    // Set up widget change callback to update properties
    widget.callback = (value: string) => {
      this.properties.value = value; // Direct property update
      // Also trigger property change notification
      if (this.onPropertyChanged) {
        this.onPropertyChanged("value", value, this.properties.value);
      }
      // Mark the graph as modified to ensure serialization picks up changes
      if (this.graph) {
        this.graph.change();
      }
    };

    this.widgets_up = true;
  }

  // Frontend-specific title display
  getTitle(): string {
    if (this.flags.collapsed) {
      return String(this.properties.value ?? "");
    }
    return this.title || "Const String";
  }

  // Frontend-specific property change handling
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged?.(name, value, prev_value) ?? false;

    // Update widget value when property changes
    if (name === 'value' && this.widgets && this.widgets[0]) {
      this.widgets[0].value = value as string;
    }

    return result;
  }






  // Frontend-specific value setter
  setValue(v: string) {
    this.properties.value = v; // Direct property update
    if (this.widgets && this.widgets[0]) {
      this.widgets[0].value = v; // Update widget as well
    }
    if (this.graph) {
      this.graph.change(); // Mark graph as modified
    }
  }

  // Force sync widget to property - call this before serialization
  syncWidgetToProperty() {
    if (this.widgets && this.widgets[0]) {
      this.properties.value = this.widgets[0].value || "";
    }
  }

  // Frontend-specific file drop handling
  onDropFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.setProperty("value", e.target?.result as string || "");
    };
    reader.readAsText(file);
  }

  // Handle node configuration in the frontend
  onConfigure(info: any): void {
    super.onConfigure?.(info);

    // Debug log to see what properties are loaded
    console.log(`Frontend ConstantStringNode ${this.id}: configured with value="${this.properties.value}"`);

    // Restore widget value from properties
    if (this.widgets && this.widgets[0]) {
      this.widgets[0].value = this.properties.value || "";
    }
  }

  // Override serialize to ensure properties are included
  serialize() {
    // Sync widget value to property before serializing
    this.syncWidgetToProperty();

    const data = super.serialize();

    // Force include the current value in serialization
    if (!data.properties) {
      data.properties = {};
    }

    // Double-check that the value is properly set
    data.properties.value = this.properties.value || "";

    console.log(`Frontend ConstantStringNode ${this.id}: serializing with final value="${data.properties.value}"`);

    return data;
  }
}
