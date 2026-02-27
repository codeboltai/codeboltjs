import codebolt from "@codebolt/codeboltjs";
import { DaytonaRemoteProviderService } from "./services/DaytonaRemoteProviderService";

const providerService = new DaytonaRemoteProviderService({
  localAgentServerPath: process.env.LOCAL_AGENT_SERVER_PATH || undefined,
});
const handlers = providerService.getEventHandlers();

// Lifecycle hooks
codebolt.onProviderStart(handlers.onProviderStart);
codebolt.onProviderAgentStart(handlers.onProviderAgentStart);
codebolt.onProviderStop(handlers.onProviderStop);
codebolt.onCloseSignal(handlers.onCloseSignal);
codebolt.onRawMessage(handlers.onRawMessage);
codebolt.onGetDiffFiles(handlers.onGetDiffFiles);

// File operations
codebolt.onReadFile(providerService.onReadFile.bind(providerService));
codebolt.onWriteFile(providerService.onWriteFile.bind(providerService));
codebolt.onDeleteFile(providerService.onDeleteFile.bind(providerService));
codebolt.onDeleteFolder(providerService.onDeleteFolder.bind(providerService));
codebolt.onRenameItem(providerService.onRenameItem.bind(providerService));
codebolt.onCreateFolder(providerService.onCreateFolder.bind(providerService));
codebolt.onCopyFile(providerService.onCopyFile.bind(providerService));
codebolt.onCopyFolder(providerService.onCopyFolder.bind(providerService));
codebolt.onGetTreeChildren(providerService.onGetProject.bind(providerService));
codebolt.onGetFullProject(providerService.onGetFullProject.bind(providerService));
codebolt.onMergeAsPatch(providerService.onMergeAsPatch.bind(providerService));
codebolt.onSendPR(providerService.onSendPR.bind(providerService));
