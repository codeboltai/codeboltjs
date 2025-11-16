import { BaseConstantBooleanNode } from '@agent-creator/shared-nodes';
import { LiteGraph } from '@codebolt/litegraph';

// Frontend Constant Boolean Node - UI only
export class ConstantBooleanNode extends BaseConstantBooleanNode {
  private widget: any;

  constructor() {
    super();
    // Frontend-specific widget
    this.widget = this.addWidget("toggle", "value", this.properties.value as boolean, "value");
    this.serialize_widgets = true;
    this.widgets_up = true;
  }

  // Frontend-specific title display
  getTitle(): string {
    if (this.flags.collapsed) {
      return String(this.properties.value ?? false);
    }
    return this.title || "Const Boolean";
  }

  // Frontend-specific property change handling
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged?.(name, value, prev_value) ?? false;

    // Update widget value when property changes
    if (name === 'value' && this.widget) {
      this.widget.value = value as boolean;
    }

    return result;
  }

  // Frontend-specific value setter
  setValue(v: boolean) {
    this.setProperty("value", v);
  }

  // Frontend-specific action inputs
  onGetInputs() {
    return [["toggle", LiteGraph.ACTION]];
  }

  // Frontend-specific action handling
  onAction() {
    this.setValue(!this.properties.value);
  }

  // Handle node configuration in the frontend
  onConfigure(info: any): void {
    super.onConfigure?.(info);

    // Restore widget value from properties
    if (this.widget) {
      this.widget.value = this.properties.value !== undefined ? this.properties.value : false;
    }
  }
}
