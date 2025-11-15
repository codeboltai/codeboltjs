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
} from './ui/index';


// Event and Codebolt nodes
import { OnMessageNode, SendMessageNode,
  CreateFileNode, CreateFolderNode, ReadFileNode, UpdateFileNode,
  DeleteFileNode, DeleteFolderNode, ListFileNode, SearchFilesNode,
  WriteToFileNode, GrepSearchNode, FileSearchNode, EditFileWithDiffNode,
  ReadManyFilesNode, ListDirectoryNode
} from './BaseCodeboltApis/index';

import { registerNodeWithMetadata } from '@agent-creator/shared-nodes';

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

import {
  GetStringVariableNode,
  SetStringVariableNode
} from './variables/index.ts';

// Export nodes for direct use
export {
  // UI-specific nodes (refactored)
  ConstNode, SumNode, TimeNode, ConstantNumberNode,
  BypassNode, ToNumberNode, RandNode, AbsNode, ClampNode,
  OrNode, NotNode, SelectorNode, ToStringNode, CompareNode,
  ToUpperCaseNode, ContainsNode, MarkdownNode,
  // AI Agent nodes
  UserMessageNode, SystemPromptNode, MCPToolsNode,
  TaskInstructionNode, AgentNode, AgentRunNode,
  GetStringVariableNode, SetStringVariableNode,
  // Event and Codebolt nodes
  OnMessageNode, SendMessageNode,
  // File System nodes
  CreateFileNode, CreateFolderNode, ReadFileNode, UpdateFileNode,
  DeleteFileNode, DeleteFolderNode, ListFileNode, SearchFilesNode,
  WriteToFileNode, GrepSearchNode, FileSearchNode, EditFileWithDiffNode,
  ReadManyFilesNode, ListDirectoryNode,
  // Legacy nodes
  ConstantBooleanNode, ConstantStringNode, ConstantObjectNode, JSONParseNode,
  SubgraphNode, GraphInputNode, GraphOutputNode, ConverterNode, RangeNode,
  LerpNode, FloorNode, FracNode, SmoothStepNode, ScaleNode, GateNode,
  OperationNode, SequenceNode, AndNode, BranchNode, ConcatenateNode,
  SplitNode, ToFixedNode, StringToTableNode, WidgetKnobNode, WidgetHSliderNode,
  WidgetProgressNode, WidgetTextNode, WidgetPanelNode
};

// Register all node types
export const registerNodes = () => {
  // Register refactored nodes using their .metadata property
  registerNodeWithMetadata(LiteGraph, ConstNode, ConstNode.metadata);
  registerNodeWithMetadata(LiteGraph, SumNode, SumNode.metadata);
  registerNodeWithMetadata(LiteGraph, TimeNode, TimeNode.metadata);
  registerNodeWithMetadata(LiteGraph, ConstantNumberNode, ConstantNumberNode.metadata);

  // Math nodes
  registerNodeWithMetadata(LiteGraph, BypassNode, BypassNode.metadata);
  registerNodeWithMetadata(LiteGraph, ToNumberNode, ToNumberNode.metadata);
  registerNodeWithMetadata(LiteGraph, RandNode, RandNode.metadata);
  registerNodeWithMetadata(LiteGraph, AbsNode, AbsNode.metadata);
  registerNodeWithMetadata(LiteGraph, ClampNode, ClampNode.metadata);

  // Logic nodes
  registerNodeWithMetadata(LiteGraph, OrNode, OrNode.metadata);
  registerNodeWithMetadata(LiteGraph, NotNode, NotNode.metadata);
  registerNodeWithMetadata(LiteGraph, SelectorNode, SelectorNode.metadata);

  // String nodes
  registerNodeWithMetadata(LiteGraph, ToStringNode, ToStringNode.metadata);
  registerNodeWithMetadata(LiteGraph, CompareNode, CompareNode.metadata);
  registerNodeWithMetadata(LiteGraph, ToUpperCaseNode, ToUpperCaseNode.metadata);
  registerNodeWithMetadata(LiteGraph, ContainsNode, ContainsNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetStringVariableNode, GetStringVariableNode.metadata);
  registerNodeWithMetadata(LiteGraph, SetStringVariableNode, SetStringVariableNode.metadata);

  // Widget nodes
  registerNodeWithMetadata(LiteGraph, MarkdownNode, MarkdownNode.metadata);

  //
  // Codebolt nodes
  //
  // Event nodes
  registerNodeWithMetadata(LiteGraph, OnMessageNode, OnMessageNode.metadata);

  // Chat nodes
  registerNodeWithMetadata(LiteGraph, SendMessageNode, SendMessageNode.metadata);

  // File System nodes
  registerNodeWithMetadata(LiteGraph, CreateFileNode, CreateFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, CreateFolderNode, CreateFolderNode.metadata);
  registerNodeWithMetadata(LiteGraph, ReadFileNode, ReadFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, UpdateFileNode, UpdateFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, DeleteFileNode, DeleteFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, DeleteFolderNode, DeleteFolderNode.metadata);
  registerNodeWithMetadata(LiteGraph, ListFileNode, ListFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, SearchFilesNode, SearchFilesNode.metadata);
  registerNodeWithMetadata(LiteGraph, WriteToFileNode, WriteToFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, GrepSearchNode, GrepSearchNode.metadata);
  registerNodeWithMetadata(LiteGraph, FileSearchNode, FileSearchNode.metadata);
  registerNodeWithMetadata(LiteGraph, EditFileWithDiffNode, EditFileWithDiffNode.metadata);
  registerNodeWithMetadata(LiteGraph, ReadManyFilesNode, ReadManyFilesNode.metadata);
  registerNodeWithMetadata(LiteGraph, ListDirectoryNode, ListDirectoryNode.metadata);

  // AI Agent nodes
  registerNodeWithMetadata(LiteGraph, UserMessageNode, UserMessageNode.metadata);
  registerNodeWithMetadata(LiteGraph, SystemPromptNode, SystemPromptNode.metadata);
  registerNodeWithMetadata(LiteGraph, MCPToolsNode, MCPToolsNode.metadata);
  registerNodeWithMetadata(LiteGraph, TaskInstructionNode, TaskInstructionNode.metadata);
  registerNodeWithMetadata(LiteGraph, AgentNode, AgentNode.metadata);
  registerNodeWithMetadata(LiteGraph, AgentRunNode, AgentRunNode.metadata);

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