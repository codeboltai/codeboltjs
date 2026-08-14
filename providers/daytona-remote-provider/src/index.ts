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
(codebolt as any).onProviderScreenStatus?.(handlers.onProviderScreenStatus);
(codebolt as any).onProviderScreenCapture?.(handlers.onProviderScreenCapture);
(codebolt as any).onProviderScreenSession?.(handlers.onProviderScreenSession);
codebolt.onRawMessage(async (message: any) => {
  const screenResponseActions: Record<string, string> = {
    providerScreenStatus: 'providerScreenStatusResponse',
    providerScreenCapture: 'providerScreenCaptureResponse',
    providerScreenSession: 'providerScreenSessionResponse',
  };
  const screenHandlers: Record<string, (request: any) => Promise<any>> = {
    providerScreenStatus: handlers.onProviderScreenStatus,
    providerScreenCapture: handlers.onProviderScreenCapture,
    providerScreenSession: handlers.onProviderScreenSession,
  };
  const screenType = String(message?.type || message?.action || '');
  if (screenHandlers[screenType]) {
    const websocket = (codebolt as any).websocket;
    try {
      const result = await screenHandlers[screenType](message);
      websocket?.send(JSON.stringify({ type: 'remoteProviderEvent', action: screenResponseActions[screenType], requestId: message.requestId, status: true, success: true, data: result, message: result }));
    } catch (error: any) {
      websocket?.send(JSON.stringify({ type: 'remoteProviderEvent', action: screenResponseActions[screenType], requestId: message.requestId, status: false, success: false, error: error?.message || 'Provider screen request failed' }));
    }
    return;
  }
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
