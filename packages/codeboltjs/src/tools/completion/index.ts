import { AttemptCompletionTool } from './attempt-completion';

export {
    AttemptCompletionTool,
    type AttemptCompletionToolParams,
} from './attempt-completion';

export const completionTools = [
    new AttemptCompletionTool(),
];
