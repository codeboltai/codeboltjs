import codebolt from '@codebolt/codeboltjs';
import { setMaxListeners } from 'node:events';
import { AgentFsOverlayProvider } from './AgentFsOverlayProvider';

setMaxListeners(30);
const provider = new AgentFsOverlayProvider();

codebolt.onProviderStart((vars) => provider.onProviderStart(vars));
codebolt.onProviderStop((vars) => provider.onProviderStop(vars));
codebolt.onCloseSignal(() => provider.onCloseSignal());
codebolt.onGetDiffFiles(() => provider.onGetDiffFiles());
codebolt.onReadFile((filePath) => provider.onReadFile(filePath));
codebolt.onWriteFile((filePath, content) => provider.onWriteFile(filePath, content));
codebolt.onDeleteFile((filePath) => provider.onDeleteFile(filePath));
codebolt.onDeleteFolder((folderPath) => provider.onDeleteFolder(folderPath));
codebolt.onRenameItem((oldPath, newPath) => provider.onRenameItem(oldPath, newPath));
codebolt.onCreateFolder((folderPath) => provider.onCreateFolder(folderPath));
codebolt.onCopyFile((sourcePath, destinationPath) => provider.onCopyFile(sourcePath, destinationPath));
codebolt.onCopyFolder((sourcePath, destinationPath) => provider.onCopyFolder(sourcePath, destinationPath));
codebolt.onGetTreeChildren((parentId) => provider.onGetProject(parentId));
codebolt.onGetFullProject(() => provider.onGetFullProject());
codebolt.onMergeAsPatch(() => provider.onMergeAsPatch());
codebolt.onSendPR(() => provider.onSendPR());
codebolt.onCreatePatchRequest(() => provider.onCreatePatchRequest());
codebolt.onCreatePullRequestRequest(() => provider.onCreatePullRequestRequest());

export { AgentFsOverlayProvider } from './AgentFsOverlayProvider';
