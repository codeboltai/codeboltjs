https://github.com/jagenjo/litegraph.js/tree/master/guides#events
https://github.com/jagenjo/litegraph.js/issues/485
https://github.com/jagenjo/litegraph.js/issues/66

1. onAction vs onExecute: In LiteGraph, when a node has mode = LiteGraph.ON_TRIGGER, it uses the onExecute() method, not
  onAction(). The onAction() method is used for action inputs like button clicks in the UI.

2.  Also In ONPropertyChange, Please do not call updateOutputs() method in the backend. 

    // Handle property changes (toggle between single and split outputs)
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    if (name === "showSplitOutputs") {
     // In the frontend editor, we rebuild outputs when the toggle changes.
      // On the backend, outputs (and their links) come from the saved graphData
      // and must be preserved so Litegraph can propagate values correctly.
      const isBrowser = typeof window !== "undefined";
      const hasCanvas = isBrowser && this.graph && (this.graph as any).list_of_graphcanvas?.length;

      if (hasCanvas) {
         this.updateOutputs(value as boolean);
      }
    }
    return true; // Return true to allow default behavior
  }

