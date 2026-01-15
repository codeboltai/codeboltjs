import codebolt from "@codebolt/codeboltjs";
import { AgentFSProviderService } from "./services/AgentFSProviderService";

const providerService = new AgentFSProviderService();
const handlers = providerService.getEventHandlers();

codebolt.onProviderStart(handlers.onProviderStart);
codebolt.onProviderAgentStart(handlers.onProviderAgentStart);
codebolt.onProviderStop(handlers.onProviderStop);
codebolt.onCloseSignal(handlers.onCloseSignal);
codebolt.onRawMessage(handlers.onRawMessage);

codebolt.onReadFile(providerService.onReadFile.bind(providerService));
codebolt.onWriteFile(providerService.onWriteFile.bind(providerService));
codebolt.onGetTreeChildren(providerService.onGetProject.bind(providerService));
// Implement other handlers as needed
