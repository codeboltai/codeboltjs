import codebolt from "@codebolt/codeboltjs";
import { AgentFSProviderService } from "./services/AgentFSProviderService";

const providerService = new AgentFSProviderService();
const handlers = providerService.getEventHandlers();

codebolt.onProviderStart(handlers.onProviderStart);
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
});

codebolt.onReadFile(providerService.onReadFile.bind(providerService));
codebolt.onWriteFile(providerService.onWriteFile.bind(providerService));
codebolt.onDeleteFile(providerService.onDeleteFile.bind(providerService));
codebolt.onDeleteFolder(providerService.onDeleteFolder.bind(providerService));
codebolt.onRenameItem(providerService.onRenameItem.bind(providerService));
codebolt.onCreateFolder(providerService.onCreateFolder.bind(providerService));
codebolt.onGetFullProject(providerService.onGetProject.bind(providerService));
codebolt.onGetTreeChildren(providerService.onGetProject.bind(providerService));
