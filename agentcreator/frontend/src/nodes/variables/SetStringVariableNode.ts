import { BaseSetStringVariableNode } from '@agent-creator/shared-nodes';

export class SetStringVariableNode extends BaseSetStringVariableNode {
  constructor() {
    super();
    this.addWidget("text", "Variable", this.properties.variable_name, (value?: string) => {
      this.setProperty("variable_name", value ?? "");
    });
    this.addWidget("text", "Initial", this.properties.initial_value ?? "", (value?: string) => {
      this.setProperty("initial_value", value ?? "");
    });
  }

  onExecute() {}

  setProperty(name: string, value: any) {
    super.setProperty(name, value);
    const widget = this.widgets?.find((w) => w.name === name);
    if (widget) {
      widget.value = value ?? "";
    }
  }
}
