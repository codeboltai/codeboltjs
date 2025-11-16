import {
  BaseGetUserMessageTextNode,
  BaseHasCurrentUserMessageNode,
  BaseClearUserMessageNode,
  BaseGetMentionedFilesNode,
  BaseGetMentionedMCPsNode,
  BaseGetCurrentFileNode,
  BaseGetSelectionNode,
  BaseGetRemixPromptNode,
  BaseGetUploadedImagesNode,
  BaseSetUserSessionDataNode,
  BaseGetUserSessionDataNode
} from '@agent-creator/shared-nodes';
import {
  getCurrentUserMessage,
  getUserMessageText,
  hasCurrentUserMessage,
  clearUserMessage,
  getMentionedFiles,
  getMentionedMCPs,
  getCurrentFile,
  getSelection,
  getRemixPrompt,
  getUploadedImages,
  setUserSessionData,
  getUserSessionData,
  getUserMessageTimestamp,
  getMessageId
} from '@codebolt/codeboltjs';

// Backend-specific GetCurrentUserMessage Node - actual implementation
import { BaseGetCurrentUserMessageNode } from '@agent-creator/shared-nodes';

export class GetCurrentUserMessageNode extends BaseGetCurrentUserMessageNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const message = getCurrentUserMessage();
      const hasMessage = hasCurrentUserMessage();

      // Update outputs with success results
      this.setOutputData(1, message); // message output
      this.setOutputData(2, hasMessage); // hasMessage output

      // Trigger the messageRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get current user message`;
      this.setOutputData(1, null); // message output
      this.setOutputData(2, false); // hasMessage output
      console.error('GetCurrentUserMessageNode error:', error);
    }
  }
}

// Backend-specific GetUserMessageText Node - actual implementation
export class GetUserMessageTextNode extends BaseGetUserMessageTextNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const text = getUserMessageText();
      const hasText = !!text;

      // Update outputs with success results
      this.setOutputData(1, text); // text output
      this.setOutputData(2, hasText); // hasText output

      // Trigger the textRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get user message text`;
      this.setOutputData(1, ""); // text output
      this.setOutputData(2, false); // hasText output
      console.error('GetUserMessageTextNode error:', error);
    }
  }
}

// Backend-specific HasCurrentUserMessage Node - actual implementation
export class HasCurrentUserMessageNode extends BaseHasCurrentUserMessageNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const hasMessage = hasCurrentUserMessage();
      const timestamp = getUserMessageTimestamp();
      const messageId = getMessageId();

      // Update outputs with success results
      this.setOutputData(1, hasMessage); // hasMessage output
      this.setOutputData(2, timestamp || ""); // timestamp output
      this.setOutputData(3, messageId || ""); // messageId output

      // Trigger the checked event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to check for current user message`;
      this.setOutputData(1, false); // hasMessage output
      this.setOutputData(2, ""); // timestamp output
      this.setOutputData(3, ""); // messageId output
      console.error('HasCurrentUserMessageNode error:', error);
    }
  }
}

// Backend-specific ClearUserMessage Node - actual implementation
export class ClearUserMessageNode extends BaseClearUserMessageNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      clearUserMessage();

      // Update outputs with success results
      this.setOutputData(1, true); // success output

      // Trigger the messageCleared event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to clear user message`;
      this.setOutputData(1, false); // success output
      console.error('ClearUserMessageNode error:', error);
    }
  }
}

// Backend-specific GetMentionedFiles Node - actual implementation
export class GetMentionedFilesNode extends BaseGetMentionedFilesNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const files = getMentionedFiles();
      const count = files.length;

      // Update outputs with success results
      this.setOutputData(1, files); // files output
      this.setOutputData(2, count); // count output

      // Trigger the filesRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get mentioned files`;
      this.setOutputData(1, []); // files output
      this.setOutputData(2, 0); // count output
      console.error('GetMentionedFilesNode error:', error);
    }
  }
}

// Backend-specific GetMentionedMCPs Node - actual implementation
export class GetMentionedMCPsNode extends BaseGetMentionedMCPsNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const mcps = getMentionedMCPs();
      const count = mcps.length;

      // Update outputs with success results
      this.setOutputData(1, mcps); // mcps output
      this.setOutputData(2, count); // count output

      // Trigger the mcpsRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get mentioned MCPs`;
      this.setOutputData(1, []); // mcps output
      this.setOutputData(2, 0); // count output
      console.error('GetMentionedMCPsNode error:', error);
    }
  }
}

// Backend-specific GetCurrentFile Node - actual implementation
export class GetCurrentFileNode extends BaseGetCurrentFileNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const filePath = getCurrentFile();
      const hasFile = !!filePath;

      // Update outputs with success results
      this.setOutputData(1, filePath || ""); // filePath output
      this.setOutputData(2, hasFile); // hasFile output

      // Trigger the fileRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get current file`;
      this.setOutputData(1, ""); // filePath output
      this.setOutputData(2, false); // hasFile output
      console.error('GetCurrentFileNode error:', error);
    }
  }
}

// Backend-specific GetSelection Node - actual implementation
export class GetSelectionNode extends BaseGetSelectionNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const selection = getSelection();
      const hasSelection = !!selection;

      // Update outputs with success results
      this.setOutputData(1, selection || ""); // selection output
      this.setOutputData(2, hasSelection); // hasSelection output

      // Trigger the selectionRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get selection`;
      this.setOutputData(1, ""); // selection output
      this.setOutputData(2, false); // hasSelection output
      console.error('GetSelectionNode error:', error);
    }
  }
}

// Backend-specific GetRemixPrompt Node - actual implementation
export class GetRemixPromptNode extends BaseGetRemixPromptNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const prompt = getRemixPrompt();
      const hasPrompt = !!prompt;

      // Update outputs with success results
      this.setOutputData(1, prompt || ""); // prompt output
      this.setOutputData(2, hasPrompt); // hasPrompt output

      // Trigger the promptRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get remix prompt`;
      this.setOutputData(1, ""); // prompt output
      this.setOutputData(2, false); // hasPrompt output
      console.error('GetRemixPromptNode error:', error);
    }
  }
}

// Backend-specific GetUploadedImages Node - actual implementation
export class GetUploadedImagesNode extends BaseGetUploadedImagesNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const images = getUploadedImages();
      const count = images.length;

      // Update outputs with success results
      this.setOutputData(1, images); // images output
      this.setOutputData(2, count); // count output

      // Trigger the imagesRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get uploaded images`;
      this.setOutputData(1, []); // images output
      this.setOutputData(2, 0); // count output
      console.error('GetUploadedImagesNode error:', error);
    }
  }
}

// Backend-specific SetUserSessionData Node - actual implementation
export class SetUserSessionDataNode extends BaseSetUserSessionDataNode {
  constructor() {
    super();
  }

  async onExecute() {
    const key: any = this.getInputData(1);
    const value: any = this.getInputData(2);

    if (!key) {
      console.error('SetUserSessionDataNode error: key is required');
      this.setOutputData(1, false);
      return;
    }

    try {
      setUserSessionData(key, value);

      // Update outputs with success results
      this.setOutputData(1, true); // success output

      // Trigger the dataSaved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to set user session data`;
      this.setOutputData(1, false); // success output
      console.error('SetUserSessionDataNode error:', error);
    }
  }
}

// Backend-specific GetUserSessionData Node - actual implementation
export class GetUserSessionDataNode extends BaseGetUserSessionDataNode {
  constructor() {
    super();
  }

  async onExecute() {
    const key: any = this.getInputData(1);

    if (!key) {
      console.error('GetUserSessionDataNode error: key is required');
      this.setOutputData(2, false);
      return;
    }

    try {
      const value = getUserSessionData(key);
      const hasValue = value !== undefined;

      // Update outputs with success results
      this.setOutputData(1, value); // value output
      this.setOutputData(2, hasValue); // hasValue output

      // Trigger the dataRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get user session data`;
      this.setOutputData(1, null); // value output
      this.setOutputData(2, false); // hasValue output
      console.error('GetUserSessionDataNode error:', error);
    }
  }
}