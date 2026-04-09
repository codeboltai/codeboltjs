import codebolt from "@codebolt/codeboltjs";
import { E2bRemoteProviderService } from "./services/E2bRemoteProviderService";

const providerService = new E2bRemoteProviderService({
  pluginPort: parseInt(process.env.REMOTE_EXECUTION_PORT || '', 10) || undefined,
  codeboltStartCommand: process.env.CODEBOLT_START_CMD || undefined,
  sandboxTemplate: 'wd25ft42elqt66rlvd7j',
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
