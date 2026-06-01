import codebolt from "@codebolt/codeboltjs";
import { GitWorktreeProviderService } from "./services/GitWorktreeProviderService";

const providerService = new GitWorktreeProviderService();
const handlers = providerService.getEventHandlers();

codebolt.onProviderStart(handlers.onProviderStart);
codebolt.onProviderStop(handlers.onProviderStop);
codebolt.onCloseSignal(handlers.onCloseSignal);
codebolt.onGetDiffFiles(handlers.onGetDiffFiles);
codebolt.onRawMessage(async (message: any) => {
  if (message?.type !== 'providerProspectivePath' && message?.action !== 'providerProspectivePath') {
    return;
  }

  const sendResponse = (payload: Record<string, unknown>) => {
    const websocket = (codebolt as any).websocket;
    if (websocket?.readyState === 1) {
      websocket.send(JSON.stringify(payload));
    }
  };

  try {
    const prospectivePath = providerService.getProspectivePath(message);
    sendResponse({
      type: 'remoteProviderEvent',
      action: 'providerProspectivePathResponse',
      requestId: message.requestId,
      status: true,
      data: prospectivePath,
      message: prospectivePath,
    });
  } catch (error: any) {
    sendResponse({
      type: 'remoteProviderEvent',
      action: 'providerProspectivePathResponse',
      requestId: message.requestId,
      status: false,
      error: error?.message || 'Failed to resolve prospective environment path',
    });
  }
});

codebolt.onReadFile(providerService.onReadFile.bind(providerService));
codebolt.onWriteFile(providerService.onWriteFile.bind(providerService));
codebolt.onGetTreeChildren(providerService.onGetProject.bind(providerService));
codebolt.onMergeAsPatch(providerService.onMergeAsPatch.bind(providerService));
codebolt.onSendPR(providerService.onSendPR.bind(providerService));
