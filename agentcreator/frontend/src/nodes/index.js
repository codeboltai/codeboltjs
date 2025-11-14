import { LiteGraph } from '@codebolt/litegraph';

// UI-specific nodes (refactored)
import {
  ConstNode, SumNode,
  TimeNode, ConstantNumberNode,
  BypassNode, ToNumberNode, RandNode, AbsNode, ClampNode,
  OrNode, NotNode, SelectorNode,
  ToStringNode, CompareNode, ToUpperCaseNode, ContainsNode,
  MarkdownNode,
  // AI Agent nodes
  UserMessageNode, SystemPromptNode, MCPToolsNode,
  TaskInstructionNode, AgentNode, AgentRunNode
} from './ui/index.js';

// Event and Codebolt nodes
import { OnMessageNode, SendMessageNode } from './BaseCodeboltApis/index';
import { registerNodeWithMetadata, nodeMetadata } from '@agent-creator/shared-nodes';

// Base nodes (legacy - to be refactored)
import ConstantBooleanNode from './base/ConstantBooleanNode.jsx';
import ConstantStringNode from './base/ConstantStringNode.jsx';
import ConstantObjectNode from './base/ConstantObjectNode.jsx';
import JSONParseNode from './base/JSONParseNode.jsx';
import SubgraphNode from './base/SubgraphNode.jsx';
import GraphInputNode from './base/GraphInputNode.jsx';
import GraphOutputNode from './base/GraphOutputNode.jsx';

// Math nodes (legacy - not refactored yet)
import ConverterNode from './math/ConverterNode.jsx';
import RangeNode from './math/RangeNode.jsx';
import LerpNode from './math/LerpNode.jsx';
import FloorNode from './math/FloorNode.jsx';
import FracNode from './math/FracNode.jsx';
import SmoothStepNode from './math/SmoothStepNode.jsx';
import ScaleNode from './math/ScaleNode.jsx';
import GateNode from './math/GateNode.jsx';
import OperationNode from './math/OperationNode.jsx';

// Logic nodes (legacy - not refactored yet)
import SequenceNode from './logic/SequenceNode.jsx';
import AndNode from './logic/AndNode.jsx';
import BranchNode from './logic/BranchNode.jsx';

// String nodes (legacy - not refactored yet)
import ConcatenateNode from './strings/ConcatenateNode.jsx';
import SplitNode from './strings/SplitNode.jsx';
import ToFixedNode from './strings/ToFixedNode.jsx';
import StringToTableNode from './strings/StringToTableNode.jsx';

// Interface nodes
import WidgetKnobNode from './interface/WidgetKnobNode.jsx';
import WidgetHSliderNode from './interface/WidgetHSliderNode.jsx';
import WidgetProgressNode from './interface/WidgetProgressNode.jsx';
import WidgetTextNode from './interface/WidgetTextNode.jsx';
import WidgetPanelNode from './interface/WidgetPanelNode.jsx';

// Register all node types
export const registerNodes = () => {
  // Register refactored nodes using shared base classes
  registerNodeWithMetadata(LiteGraph, ConstNode, nodeMetadata['basic/const']);
  registerNodeWithMetadata(LiteGraph, SumNode, nodeMetadata['basic/sum']);
  registerNodeWithMetadata(LiteGraph, TimeNode, nodeMetadata['basic/time']);
  registerNodeWithMetadata(LiteGraph, ConstantNumberNode, nodeMetadata['basic/const_number']);

  // Math nodes
  registerNodeWithMetadata(LiteGraph, BypassNode, nodeMetadata['math/bypass']);
  registerNodeWithMetadata(LiteGraph, ToNumberNode, nodeMetadata['math/to_number']);
  registerNodeWithMetadata(LiteGraph, RandNode, nodeMetadata['math/rand']);
  registerNodeWithMetadata(LiteGraph, AbsNode, nodeMetadata['math/abs']);
  registerNodeWithMetadata(LiteGraph, ClampNode, nodeMetadata['math/clamp']);

  // Logic nodes
  registerNodeWithMetadata(LiteGraph, OrNode, nodeMetadata['logic/OR']);
  registerNodeWithMetadata(LiteGraph, NotNode, nodeMetadata['logic/NOT']);
  registerNodeWithMetadata(LiteGraph, SelectorNode, nodeMetadata['logic/selector']);

  // String nodes
  registerNodeWithMetadata(LiteGraph, ToStringNode, nodeMetadata['string/toString']);
  registerNodeWithMetadata(LiteGraph, CompareNode, nodeMetadata['string/compare']);
  registerNodeWithMetadata(LiteGraph, ToUpperCaseNode, nodeMetadata['string/toUpperCase']);
  registerNodeWithMetadata(LiteGraph, ContainsNode, nodeMetadata['string/contains']);

  // Widget nodes
  registerNodeWithMetadata(LiteGraph, MarkdownNode, nodeMetadata['widget/markdown']);

  // Event nodes
  registerNodeWithMetadata(LiteGraph, OnMessageNode, nodeMetadata['events/onmessage']);

  // Codebolt nodes
  registerNodeWithMetadata(LiteGraph, SendMessageNode, nodeMetadata['codebolt/chat/sendmessage']);

  // AI Agent nodes
  registerNodeWithMetadata(LiteGraph, UserMessageNode, nodeMetadata['agent/user_message']);
  registerNodeWithMetadata(LiteGraph, SystemPromptNode, nodeMetadata['agent/system_prompt']);
  registerNodeWithMetadata(LiteGraph, MCPToolsNode, nodeMetadata['agent/mcp_tools']);
  registerNodeWithMetadata(LiteGraph, TaskInstructionNode, nodeMetadata['agent/task_instruction']);
  registerNodeWithMetadata(LiteGraph, AgentNode, nodeMetadata['agent/agent']);
  registerNodeWithMetadata(LiteGraph, AgentRunNode, nodeMetadata['agent/agent_run']);

  // Other existing nodes (these can be refactored later using the same pattern)
  LiteGraph.registerNodeType("basic/const_boolean", ConstantBooleanNode);
  LiteGraph.registerNodeType("basic/const_string", ConstantStringNode);
  LiteGraph.registerNodeType("basic/const_object", ConstantObjectNode);
  LiteGraph.registerNodeType("basic/jsonparse", JSONParseNode);
  LiteGraph.registerNodeType("graph/subgraph", SubgraphNode);
  LiteGraph.registerNodeType("graph/input", GraphInputNode);
  LiteGraph.registerNodeType("graph/output", GraphOutputNode);
  
  // Math nodes (legacy - not refactored yet)
  LiteGraph.registerNodeType("math/converter", ConverterNode);
  LiteGraph.registerNodeType("math/range", RangeNode);
  LiteGraph.registerNodeType("math/lerp", LerpNode);
  LiteGraph.registerNodeType("math/floor", FloorNode);
  LiteGraph.registerNodeType("math/frac", FracNode);
  LiteGraph.registerNodeType("math/smoothstep", SmoothStepNode);
  LiteGraph.registerNodeType("math/scale", ScaleNode);
  LiteGraph.registerNodeType("math/gate", GateNode);
  LiteGraph.registerNodeType("math/operation", OperationNode);
  
  // Logic nodes (legacy - not refactored yet)
  LiteGraph.registerNodeType("logic/sequence", SequenceNode);
  LiteGraph.registerNodeType("logic/AND", AndNode);
  LiteGraph.registerNodeType("logic/IF", BranchNode);

  // String nodes (legacy - not refactored yet)
  LiteGraph.registerNodeType("string/concatenate", ConcatenateNode);
  LiteGraph.registerNodeType("string/split", SplitNode);
  LiteGraph.registerNodeType("string/toFixed", ToFixedNode);
  LiteGraph.registerNodeType("string/toTable", StringToTableNode);
  
  // Interface nodes
  LiteGraph.registerNodeType("widget/knob", WidgetKnobNode);
  LiteGraph.registerNodeType("widget/hslider", WidgetHSliderNode);
  LiteGraph.registerNodeType("widget/progress", WidgetProgressNode);
  LiteGraph.registerNodeType("widget/text", WidgetTextNode);
  LiteGraph.registerNodeType("widget/panel", WidgetPanelNode);
};

// Export individual nodes for direct use
export {
  ConstNode, SumNode,
  TimeNode, ConstantNumberNode, ConstantBooleanNode, ConstantStringNode,
  ConstantObjectNode, JSONParseNode, SubgraphNode, GraphInputNode, GraphOutputNode,
  ConverterNode, BypassNode, ToNumberNode, RangeNode, RandNode,
  ClampNode, LerpNode, AbsNode, FloorNode, FracNode, SmoothStepNode,
  ScaleNode, GateNode, OperationNode,
  SelectorNode, SequenceNode, AndNode, OrNode, NotNode, BranchNode,
  ToStringNode, CompareNode, ConcatenateNode, ContainsNode,
  ToUpperCaseNode, SplitNode, ToFixedNode, StringToTableNode,
  WidgetKnobNode, WidgetHSliderNode, WidgetProgressNode, WidgetTextNode, WidgetPanelNode,
  // Event nodes
  OnMessageNode,
  // Codebolt nodes
  SendMessageNode,
  // AI Agent nodes
  UserMessageNode, SystemPromptNode, MCPToolsNode,
  TaskInstructionNode, AgentNode, AgentRunNode
};
