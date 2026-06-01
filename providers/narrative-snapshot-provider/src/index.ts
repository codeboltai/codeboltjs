import codebolt from "@codebolt/codeboltjs";
import { NarrativeSnapshotProviderService } from "./services/NarrativeSnapshotProviderService";

const providerService = new NarrativeSnapshotProviderService();
const handlers = providerService.getEventHandlers();

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

codebolt.onReadFile(providerService.onReadFile.bind(providerService));
codebolt.onWriteFile(providerService.onWriteFile.bind(providerService));
codebolt.onGetTreeChildren(providerService.onGetProject.bind(providerService));
codebolt.onMergeAsPatch(providerService.onMergeAsPatch.bind(providerService));
codebolt.onSendPR(providerService.onSendPR.bind(providerService));
