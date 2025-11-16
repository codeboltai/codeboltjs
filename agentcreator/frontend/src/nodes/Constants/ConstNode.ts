import { BaseConstNode } from '@agent-creator/shared-nodes';

// Frontend Const Node - UI only
export class ConstNode extends BaseConstNode {
  private widget: any;

  constructor() {
    super();
    // Frontend-specific widget
    this.widget = this.addWidget("number", "value", this.properties.value as number, "value");
    this.widgets_up = true;
    this.size = [120, 30];
  }

  // Frontend-specific property change handling
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged?.(name, value, prev_value) ?? false;

    // Update widget value when property changes
    if (name === 'value' && this.widget) {
      this.widget.value = parseFloat(String(value));
    }

    return result;
  }

  // Frontend-specific value setter
  setValue(v: number) {
    this.setProperty("value", v);
  }

  // Frontend-specific title display
  getTitle(): string {
    if (this.flags.collapsed) {
      return String(this.properties.value ?? 0);
    }
    return this.title || "Const";
  }

  // Handle node configuration in the frontend
  onConfigure(info: any): void {
    super.onConfigure?.(info);

    // Restore widget value from properties
    if (this.widget) {
      this.widget.value = this.properties.value || 1;
    }
  }
}
