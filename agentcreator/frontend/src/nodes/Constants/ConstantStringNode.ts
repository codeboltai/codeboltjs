import { BaseConstantStringNode } from '@agent-creator/shared-nodes';

// Frontend Constant String Node - UI only
export class ConstantStringNode extends BaseConstantStringNode {
  constructor() {
    super();
    // Frontend-specific widget
    if (this.widgets && this.widgets.length > 0) {
      this.widgets[0] = this.addWidget("text", "value", this.properties.value as string, "value"); // link to property value
    } else {
      this.addWidget("text", "value", this.properties.value as string, "value"); // link to property value
    }
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
    super.onConfigure?.(info);

    // Restore widget value from properties
    if (this.widgets && this.widgets[0]) {
      this.widgets[0].value = this.properties.value || "";
    }
  }
}
