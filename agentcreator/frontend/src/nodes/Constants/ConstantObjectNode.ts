import { BaseConstantObjectNode } from '@agent-creator/shared-nodes';

// Frontend Constant Object Node - UI only
export class ConstantObjectNode extends BaseConstantObjectNode {
  private widget: any;

  constructor() {
    super();
    // Frontend-specific widget for JSON editing
    this.widget = this.addWidget("text", "value", this.formatValue(this.properties.value), "value");
    this.widgets_up = true;
    this.size = [200, 100]; // Larger for object editing
  }

  // Frontend-specific property change handling
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged?.(name, value, prev_value) ?? false;

    // Update widget value when property changes
    if (name === 'value' && this.widget) {
      this.widget.value = this.formatValue(value);
    }

    return result;
  }

  // Override formatValue for frontend display
  formatValue(value: any): string {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  // Frontend-specific value setter from widget
  setValue(v: string) {
    try {
      const parsedValue = JSON.parse(v);
      this.setProperty("value", parsedValue);
    } catch (error) {
      console.warn('Invalid JSON in ConstantObjectNode:', error);
      // Keep current value if invalid JSON
    }
  }

  // Handle node configuration in the frontend
  onConfigure(info: any): void {
    super.onConfigure?.(info);

    // Restore widget value from properties
    if (this.widget) {
      this.widget.value = this.formatValue(this.properties.value);
    }
  }
}
