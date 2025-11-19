import { BaseGetStringVariableNode } from '@codebolt/agent-shared-nodes';

export class GetStringVariableNode extends BaseGetStringVariableNode {
  constructor() {
    super();
    this.addWidget("text", "Variable", (this.properties.variable_name as string) || "", (value?: string) => {
      this.setProperty("variable_name", value ?? "");
    });
    this.addWidget("text", "Default", String(this.properties.default_value || ""), (value?: string) => {
      this.setProperty("default_value", value ?? "");
    });
  }

  onExecute() { }

  setProperty(name: string, value: any) {
    super.setProperty(name, value);
    const widget = this.widgets?.find((w) => w.name === name);
    if (widget) {
      widget.value = value ?? "";
    }
  }
}
