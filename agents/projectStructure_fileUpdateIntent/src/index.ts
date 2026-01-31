import codebolt from '@codebolt/codeboltjs';
import { TestRunner } from './testRunner';
import {
  InitialPromptGenerator,

  ResponseExecutor
} from '@codebolt/agent/unified'
import { FlatUserMessage } from "@codebolt/types/sdk";
import {
  EnvironmentContextModifier,
  CoreSystemPromptModifier,
  DirectoryContextModifier,
  IdeContextModifier,
  AtFileProcessorModifier,
  ToolInjectionModifier,
  ChatHistoryMessageModifier


} from '@codebolt/agent/processor-pieces';







codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
  // console.log("Message received:", reqMessage.userMessage);
  // await codebolt.chat.sendMessage("Message received: " + reqMessage.userMessage);

  // try {
  //   const threadId = "0454cba7-4604-4927-8f20-b980bb5d2662" // reqMessage.threadId;
  //   if (!threadId) {
  //     await codebolt.chat.sendMessage("Error: No thread ID found in message.");
  //     return;
  //   }

  //   await codebolt.chat.sendMessage("Fetching file changes summary for thread...");

  //   // @ts-ignore - method added in local SDK but not in types yet
  //   const summaryResponse = await codebolt.thread.getThreadFileChangesSummary(threadId);

  //   if (!summaryResponse || !summaryResponse.success) {
  //     await codebolt.chat.sendMessage("Failed to fetch file changes summary.");
  //     return;
  //   }

  //   const summaryData = summaryResponse;

  //   if (!summaryData || !summaryData.changes || summaryData.changes.length === 0) {
  //     await codebolt.chat.sendMessage("No file changes found for this thread.");
  //     return;
  //   }

  //   await codebolt.chat.sendMessage(`Found ${summaryData.changes.length} change entries. Creating summary file...`);

  //   // Create the changesSummary.changes file in .codebolt directory
  //   // This file format is compatible with ChangesSummaryPanel
  //   const changesSummaryContent = JSON.stringify({
  //     title: summaryData.title || `Changes Summary for Thread ${threadId}`,
  //     changes: summaryData.changes,
  //     files: summaryData.files || []
  //   }, null, 2);

  //   codebolt.chat.sendMessage(`${JSON.stringify(changesSummaryContent)}`);

  //   // Write the changes summary file
  //   await codebolt.fs.writeToFile('changesSummary.changes', {
  //     title: summaryData.title || `Changes Summary for Thread ${threadId}`,
  //     changes: summaryData.changes,
  //     files: summaryData.files || []
  //   }.toString());

  //   await codebolt.chat.sendMessage("Created changesSummary.changes file in .codebolt directory.");

  //   // Also create review merge request for the changes
  //   // @ts-ignore - method added in local SDK but not in types yet
  //   const changesResponse = await codebolt.thread.getThreadFileChanges(threadId);
  //   const changesData = changesResponse?.data || changesResponse;

  //   if (changesData && changesData.majorFilesChanged && changesData.majorFilesChanged.length > 0) {
  //     await codebolt.chat.sendMessage(`Processing file changes. Major files: ${changesData.majorFilesChanged.join(', ')}`);
  //     await codebolt.chat.sendMessage("Creating review merge request...");

  //     const result = await codebolt.reviewMergeRequest.create({
  //       title: `Review for Thread ${threadId}`,
  //       description: `File changes review for thread ${threadId}`,
  //       majorFilesChanged: changesData.majorFilesChanged || [],
  //       diffPatch: changesData.diffPatch || '',
  //       mergeConfig: changesData.mergeConfig || { strategy: 'patch' },
  //       issuesFaced: changesData.issuesFaced || [],
  //       remainingTasks: changesData.remainingTasks || [],
  //       type: 'review_merge',
  //       agentId: 'projectStructure_fileUpdateIntent',
  //       agentName: 'Project Structure Agent',
  //       initialTask: reqMessage.userMessage
  //     });

  //     const anyResult = result as any;
  //     if (anyResult && anyResult.data && anyResult.data.request) {
  //       await codebolt.chat.sendMessage(`Successfully created Review Merge Request: ${anyResult.data.request.id}`);
  //     } else {
  //       await codebolt.chat.sendMessage(`Review Merge Request result: ${JSON.stringify(result)}`);
  //     }
  //   }

  //   await codebolt.chat.sendMessage("Done! Changes summary is available at .codebolt/changesSummary.changes");

  // } catch (error) {
  //   console.error("Error processing request:", error);
  //   await codebolt.chat.sendMessage(`Error happened: ${error}`);
  // }
});



