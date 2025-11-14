import { LGraphNode } from '@codebolt/litegraph';

// Utility to create base nodes from existing node patterns
export class BaseNodeUtils {
  static createBaseNode(type, title, category, description, icon, color, config = {}) {
    return class extends LGraphNode {
      static metadata = {
        type,
        title,
        category,
        description,
        icon,
        color
      };

      constructor() {
        super();
        this.title = title;

        // Apply configuration
        if (config.properties) {
          Object.assign(this.properties, config.properties);
        }

        if (config.inputs) {
          config.inputs.forEach(input => {
            this.addInput(input.name, input.type);
          });
        }

        if (config.outputs) {
          config.outputs.forEach(output => {
            this.addOutput(output.name, output.type);
          });
        }

        if (config.size) {
          this.size = config.size;
        }

        if (config.widgets) {
          config.widgets.forEach(widget => {
            this.addWidget(widget.type, widget.name, widget.value, widget.callback);
          });
        }
      }

      // Override this method in derived classes
      onExecute() {
        // Base implementation - to be overridden
      }
    };
  }

  // Node metadata registry
  static getNodeMetadata() {
    return {
      'basic/time': {
        type: 'basic/time',
        title: 'Time',
        category: 'basic',
        description: 'Current time in ms and seconds',
        icon: '⏰',
        color: '#FFC107'
      },
      'basic/const_number': {
        type: 'basic/const_number',
        title: 'Const Number',
        category: 'basic',
        description: 'Constant number with widget',
        icon: '#',
        color: '#FF9800'
      },
      'basic/const_boolean': {
        type: 'basic/const_boolean',
        title: 'Const Boolean',
        category: 'basic',
        description: 'Constant boolean with toggle',
        icon: '☑',
        color: '#FF9800'
      },
      'basic/const_string': {
        type: 'basic/const_string',
        title: 'Const String',
        category: 'basic',
        description: 'Constant string with text input',
        icon: 'S',
        color: '#FF9800'
      },
      'basic/const_object': {
        type: 'basic/const_object',
        title: 'Const Object',
        category: 'basic',
        description: 'Constant object',
        icon: '{}',
        color: '#FF9800'
      },
      'basic/jsonparse': {
        type: 'basic/jsonparse',
        title: 'JSON Parse',
        category: 'basic',
        description: 'Parse JSON string to object',
        icon: 'JSON',
        color: '#FF9800'
      },
      'graph/subgraph': {
        type: 'graph/subgraph',
        title: 'Subgraph',
        category: 'graph',
        description: 'Graph inside a node',
        icon: '⊡',
        color: '#795548'
      },
      'graph/input': {
        type: 'graph/input',
        title: 'Graph Input',
        category: 'graph',
        description: 'Input of the graph',
        icon: '→',
        color: '#795548'
      },
      'graph/output': {
        type: 'graph/output',
        title: 'Graph Output',
        category: 'graph',
        description: 'Output of the graph',
        icon: '←',
        color: '#795548'
      },
      'math/converter': {
        type: 'math/converter',
        title: 'Converter',
        category: 'math',
        description: 'Type A to type B',
        icon: '⇄',
        color: '#FF9800'
      },
      'math/bypass': {
        type: 'math/bypass',
        title: 'Bypass',
        category: 'math',
        description: 'Removes the type',
        icon: '→',
        color: '#9C27B0'
      },
      'math/to_number': {
        type: 'math/to_number',
        title: 'To Number',
        category: 'math',
        description: 'Cast to number',
        icon: '#',
        color: '#607D8B'
      },
      'math/range': {
        type: 'math/range',
        title: 'Range',
        category: 'math',
        description: 'Convert number range',
        icon: '↔',
        color: '#795548'
      },
      'math/rand': {
        type: 'math/rand',
        title: 'Random',
        category: 'math',
        description: 'Random number',
        icon: '?',
        color: '#E91E63'
      },
      'math/clamp': {
        type: 'math/clamp',
        title: 'Clamp',
        category: 'math',
        description: 'Clamp number between min and max',
        icon: '⬓',
        color: '#E91E63'
      },
      'math/lerp': {
        type: 'math/lerp',
        title: 'Lerp',
        category: 'math',
        description: 'Linear interpolation',
        icon: '↔',
        color: '#E91E63'
      },
      'math/abs': {
        type: 'math/abs',
        title: 'Abs',
        category: 'math',
        description: 'Absolute value',
        icon: '|x|',
        color: '#E91E63'
      },
      'math/floor': {
        type: 'math/floor',
        title: 'Floor',
        category: 'math',
        description: 'Floor number',
        icon: '⌊',
        color: '#E91E63'
      },
      'math/frac': {
        type: 'math/frac',
        title: 'Frac',
        category: 'math',
        description: 'Fractional part',
        icon: '.x',
        color: '#E91E63'
      },
      'math/smoothstep': {
        type: 'math/smoothstep',
        title: 'Smoothstep',
        category: 'math',
        description: 'Smooth interpolation',
        icon: '∿',
        color: '#E91E63'
      },
      'math/scale': {
        type: 'math/scale',
        title: 'Scale',
        category: 'math',
        description: 'Multiply by factor',
        icon: '×',
        color: '#E91E63'
      },
      'math/gate': {
        type: 'math/gate',
        title: 'Gate',
        category: 'math',
        description: 'Conditional output',
        icon: '⚿',
        color: '#E91E63'
      },
      'math/operation': {
        type: 'math/operation',
        title: 'Operation',
        category: 'math',
        description: 'Math operations',
        icon: '⊕',
        color: '#E91E63'
      },
      'logic/selector': {
        type: 'logic/selector',
        title: 'Selector',
        category: 'logic',
        description: 'Selects an output',
        icon: '⊞',
        color: '#00BCD4'
      },
      'logic/sequence': {
        type: 'logic/sequence',
        title: 'Sequence',
        category: 'logic',
        description: 'Select from sequence',
        icon: '...',
        color: '#CDDC39'
      },
      'logic/AND': {
        type: 'logic/AND',
        title: 'AND',
        category: 'logic',
        description: 'Logical AND',
        icon: '∧',
        color: '#FF5722'
      },
      'logic/OR': {
        type: 'logic/OR',
        title: 'OR',
        category: 'logic',
        description: 'Logical OR',
        icon: '∨',
        color: '#FF5722'
      },
      'logic/NOT': {
        type: 'logic/NOT',
        title: 'NOT',
        category: 'logic',
        description: 'Logical NOT',
        icon: '¬',
        color: '#FF5722'
      },
      'logic/IF': {
        type: 'logic/IF',
        title: 'Branch',
        category: 'logic',
        description: 'Branch execution on condition',
        icon: '⇄',
        color: '#FF5722'
      },
      'string/toString': {
        type: 'string/toString',
        title: 'to String',
        category: 'string',
        description: 'Convert to string',
        icon: 'S',
        color: '#9E9E9E'
      },
      'string/compare': {
        type: 'string/compare',
        title: 'Compare',
        category: 'string',
        description: 'Compare two strings',
        icon: '==',
        color: '#9E9E9E'
      },
      'string/concatenate': {
        type: 'string/concatenate',
        title: 'Concatenate',
        category: 'string',
        description: 'Join two strings',
        icon: '+',
        color: '#9E9E9E'
      },
      'string/contains': {
        type: 'string/contains',
        title: 'Contains',
        category: 'string',
        description: 'Check if contains substring',
        icon: '∈',
        color: '#9E9E9E'
      },
      'string/toUpperCase': {
        type: 'string/toUpperCase',
        title: 'to UpperCase',
        category: 'string',
        description: 'Convert to uppercase',
        icon: '↑',
        color: '#9E9E9E'
      },
      'string/split': {
        type: 'string/split',
        title: 'Split',
        category: 'string',
        description: 'Split string by separator',
        icon: '⊓',
        color: '#9E9E9E'
      },
      'string/toFixed': {
        type: 'string/toFixed',
        title: 'to Fixed',
        category: 'string',
        description: 'Format number with decimals',
        icon: '.0',
        color: '#9E9E9E'
      },
      'string/toTable': {
        type: 'string/toTable',
        title: 'to Table',
        category: 'string',
        description: 'Convert string to table',
        icon: '⊞',
        color: '#9E9E9E'
      },
      'widget/knob': {
        type: 'widget/knob',
        title: 'Knob',
        category: 'widget',
        description: 'Rotational knob controller',
        icon: '◉',
        color: '#9C27B0'
      },
      'widget/hslider': {
        type: 'widget/hslider',
        title: 'H.Slider',
        category: 'widget',
        description: 'Linear slider controller',
        icon: '━',
        color: '#9C27B0'
      },
      'widget/progress': {
        type: 'widget/progress',
        title: 'Progress',
        category: 'widget',
        description: 'Shows data in linear progress',
        icon: '▓',
        color: '#9C27B0'
      },
      'widget/text': {
        type: 'widget/text',
        title: 'Text',
        category: 'widget',
        description: 'Shows the input value',
        icon: 'T',
        color: '#9C27B0'
      },
      'widget/panel': {
        type: 'widget/panel',
        title: 'Panel',
        category: 'widget',
        description: 'Non interactive panel',
        icon: '▢',
        color: '#9C27B0'
      },
      'widget/markdown': {
        type: 'widget/markdown',
        title: 'Markdown',
        category: 'widget',
        description: 'Display markdown-formatted text',
        icon: '📝',
        color: '#9C27B0'
      }
    };
  }
}