import { BaseConstantStringNode } from '@agent-creator/shared-nodes';

// Frontend Constant String Node - UI only
export class ConstantStringNode extends BaseConstantStringNode {
  constructor() {
    super();
    // Frontend-specific widget
    this.widget = this.addWidget("text", "value", this.properties.value, "value"); // link to property value
    this.widgets_up = true;
  }

  // Frontend-specific title display
  getTitle() {
    if (this.flags.collapsed) {
      return this.properties.value;
    }
    return this.title;
  }

  // Frontend-specific property change handling
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged(name, value, prev_value);

    // Update widget value when property changes
    if (name === 'value' && this.widget) {
      this.widget.value = value as string;
    }

    return result;
  }

  // Frontend-specific value setter
  setValue(v: string) {
    this.setProperty("value", v);
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
    super.onConfigure(info);

    // Restore widget value from properties
    if (this.widget) {
      this.widget.value = this.properties.value || "";
    }
  }
}
