import codebolt from "@codebolt/codeboltjs";
import { GitWorktreeProviderService } from "./services/GitWorktreeProviderService";

const providerService = new GitWorktreeProviderService();
const handlers = providerService.getEventHandlers();

codebolt.onProviderStart(handlers.onProviderStart);
codebolt.onProviderStop(handlers.onProviderStop);
codebolt.onCloseSignal(handlers.onCloseSignal);
codebolt.onGetDiffFiles(handlers.onGetDiffFiles);
codebolt.onMergeAsPatch(providerService.onMergeAsPatch.bind(providerService));
codebolt.onSendPR(providerService.onSendPR.bind(providerService));
