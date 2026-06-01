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
codebolt.onRawMessage(async (message: any) => {
  if (message?.type === 'providerProspectivePath' || message?.action === 'providerProspectivePath') {
    const websocket = (codebolt as any).websocket;
    const send = (payload: Record<string, unknown>) => {
      if (websocket?.readyState === 1) websocket.send(JSON.stringify(payload));
    };
    try {
      const preview = providerService.getProspectivePath(message);
      send({
        type: 'remoteProviderEvent',
        action: 'providerProspectivePathResponse',
        requestId: message.requestId,
        status: true,
        data: preview,
        message: preview,
      });
    } catch (error: any) {
      send({
        type: 'remoteProviderEvent',
        action: 'providerProspectivePathResponse',
        requestId: message.requestId,
        status: false,
        error: error?.message || 'Failed to resolve prospective environment path',
      });
    }
    return;
  }
  await handlers.onRawMessage(message);
});
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
