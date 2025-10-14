import codebolt from "@codebolt/codeboltjs";
import { GitWorktreeProviderService } from "./services/GitWorktreeProviderService";

const providerService = new GitWorktreeProviderService();
const handlers = providerService.getEventHandlers();

codebolt.onProviderStart(handlers.onProviderStart);
codebolt.onProviderAgentStart(handlers.onProviderAgentStart);
codebolt.onCloseSignal(handlers.onCloseSignal);
codebolt.onRawMessage(handlers.onRawMessage);