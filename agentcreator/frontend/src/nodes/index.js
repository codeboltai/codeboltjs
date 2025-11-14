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
import ConstantBooleanNode from './base/ConstantBooleanNode';
import ConstantStringNode from './base/ConstantStringNode';
import ConstantObjectNode from './base/ConstantObjectNode';
import JSONParseNode from './base/JSONParseNode';
import SubgraphNode from './base/SubgraphNode';
import GraphInputNode from './base/GraphInputNode';
import GraphOutputNode from './base/GraphOutputNode';

// Math nodes (legacy - not refactored yet)
import ConverterNode from './math/ConverterNode';
import RangeNode from './math/RangeNode';
import LerpNode from './math/LerpNode';
import FloorNode from './math/FloorNode';
import FracNode from './math/FracNode';
import SmoothStepNode from './math/SmoothStepNode';
import ScaleNode from './math/ScaleNode';
import GateNode from './math/GateNode';
import OperationNode from './math/OperationNode';

// Logic nodes (legacy - not refactored yet)
import SequenceNode from './logic/SequenceNode';
import AndNode from './logic/AndNode';
import BranchNode from './logic/BranchNode';

// String nodes (legacy - not refactored yet)
import ConcatenateNode from './strings/ConcatenateNode';
import SplitNode from './strings/SplitNode';
import ToFixedNode from './strings/ToFixedNode';
import StringToTableNode from './strings/StringToTableNode';

// Interface nodes
import WidgetKnobNode from './interface/WidgetKnobNode';
import WidgetHSliderNode from './interface/WidgetHSliderNode';
import WidgetProgressNode from './interface/WidgetProgressNode';
import WidgetTextNode from './interface/WidgetTextNode';
import WidgetPanelNode from './interface/WidgetPanelNode';

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
