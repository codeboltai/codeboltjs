https://github.com/jagenjo/litegraph.js/tree/master/guides#events
https://github.com/jagenjo/litegraph.js/issues/485
https://github.com/jagenjo/litegraph.js/issues/66

1. onAction vs onExecute: In LiteGraph, when a node has mode = LiteGraph.ON_TRIGGER, it uses the onExecute() method, not
  onAction(). The onAction() method is used for action inputs like button clicks in the UI.