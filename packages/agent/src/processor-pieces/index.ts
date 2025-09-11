// // Reusable processors
// export { ChatCompressionProcessor } from './postToolCall/chatCompressionProcessor';
// export { LoopDetectionProcessor } from './postToolCall/loopDetectionProcessor';
// export { ContextManagementProcessor } from './postToolCall/contextManagementProcessor';
// export { AdvancedLoopDetectionProcessor } from './postToolCall/advancedLoopDetectionProcessor';
// export { TokenManagementProcessor } from './postToolCall/tokenManagementProcessor';
// export { ResponseValidationProcessor } from './postToolCall/responseValidationProcessor';
// export { ChatRecordingProcessor } from './postToolCall/chatRecordingProcessor';
// export { TelemetryProcessor } from './postToolCall/telemetryProcessor';

// // Follow-up conversation processors
// export { ConversationCompactorProcessor } from './postToolCall/conversationCompactorProcessor';
// export { FollowUpConversationProcessor } from './postToolCall/followUpConversationProcessor';
// export { ConversationContinuityProcessor } from './postToolCall/conversationContinuityProcessor';

// // Pre-tool call processors
// export {
//     LocalToolInterceptorProcessor,
//     ToolValidationProcessor,
//     ToolParameterModifierProcessor,
//     type LocalToolInterceptorInfo,
//     type LocalToolInterceptorProcessorOptions,
//     type LocalToolHandler,
//     type ToolValidationInfo,
//     type ToolValidationProcessorOptions,
//     type ToolParameterModificationInfo,
//     type ParameterTransformation,
//     type ToolParameterModifierProcessorOptions
// } from './preToolCall';

// // Reusable message modifiers
// export { HandleUrlMessageModifier } from './messageModifiers/handleUrlMessageModifier';
// export { BaseContextMessageModifier } from './messageModifiers/baseContextMessageModifier';
// export { WorkingDirectoryMessageModifier } from './messageModifiers/workingDirectoryMessageModifier';
// export { BaseSystemInstructionMessageModifier } from './messageModifiers/baseSystemInstructionMessageModifier';
// export { ImageAttachmentMessageModifier } from './messageModifiers/imageAttachmentMessageModifier';
// export { AddToolsListMessageModifier } from './messageModifiers/addToolsListMessageModifier';

// // Reusable tools
// export { 
//     FileReadTool, 
//     FileWriteTool, 
//     FileDeleteTool, 
//     FileMoveTool, 
//     FileCopyTool 
// } from './tools/fileTools';


export {SimpleMessageModifier} from './messageModifiers/simpleMessageModifier'
export {AddCurrentDirectoryRootFilesModifier} from './messageModifiers/addCurrentDirectoryRootFilesModifier'
export {ConversationCompection } from './preInferenceProcessors/conversationCompaction'
export {CheckForNoToolCall} from './postInferenceProcessors/checkForNoToolCall'

export {BaseContextMessageModifier} from './messageModifiers/baseContextMessageModifier'
export {BaseSystemInstructionMessageModifier} from './messageModifiers/baseSystemInstructionMessageModifier'

export {WorkingDirectoryMessageModifier} from './messageModifiers/workingDirectoryMessageModifier'

export {AddToolsListMessageModifier} from './messageModifiers/addToolsListMessageModifier'

