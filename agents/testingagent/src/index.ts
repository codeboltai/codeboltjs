import codebolt from "@codebolt/codeboltjs";

import { FlatUserMessage } from "@codebolt/types/sdk";

codebolt.onMessage(async (_reqMessage: FlatUserMessage) => {
  await codebolt.chat.sendMessage("Testing updated terminal SDK execution options");
//   const response = await codebolt.terminal.executeCommand(
//       'echo background-start && sleep 1m && echo background-end',
//       {
//         executionMode: 'background_scoped',
//         waitMs:500,
//         returnEmptyStringOnSuccess: true,
//       }
//     );

     const response = await codebolt.terminal.executeCommand(
      'echo auto-start && sleep 1m && echo auto-end',
      {
        executionMode: 'auto_scoped',
        waitMs:500,
        returnEmptyStringOnSuccess: true,
      }
    );

    //   const response = await codebolt.terminal.executeCommand(
    //   'echo auto-start && sleep 1 && echo auto-end',
    //   {
    //     executionMode: 'auto_scoped',
    //     waitMs:500,
    //     returnEmptyStringOnSuccess: true,
    //   }
    // );

    // Test foreground_scoped:
    // - Expected: waits inline up to waitMs.
    // - If command finishes before waitMs, response.type should not be "commandRunning".
    // - Uncomment this block and comment the active response block below.
    // const response = await codebolt.terminal.executeCommand(
    //   'echo foreground-start && sleep 1 && echo foreground-end',
    //   {
    //     executionMode: 'foreground_scoped',
    //     waitMs:3000,
    //     returnEmptyStringOnSuccess: true,
    //   }
    // );

    // Test background_scoped:
    // - Expected: returns "commandRunning" quickly and emits backgroundCommandCompletion later.
    // - Scoped command is tied to this agent run.
    // - Uncomment this block and comment the active response block below.
    // const response = await codebolt.terminal.executeCommand(
    //   'echo background-scoped-start && sleep 2 && echo background-scoped-end',
    //   {
    //     executionMode: 'background_scoped',
    //     waitMs:500,
    //     returnEmptyStringOnSuccess: true,
    //   }
    // );

    // Test background_detached:
    // - Expected: returns "commandRunning" quickly and emits backgroundCommandCompletion later.
    // - Detached command can survive agent force-stop, so use it for intentional background work.
    // - Uncomment this block and comment the active response block below.
    // const response = await codebolt.terminal.executeCommand(
    //   'echo background-detached-start && sleep 1m && echo background-detached-end',
    //   {
    //     executionMode: 'background_detached',
    //     waitMs:500,
    //     returnEmptyStringOnSuccess: true,
    //   }
    // );


    
 
    if (response.type !== 'commandRunning') {
      console.log('Command finished inline:', response);
      return response;
    }
 
    const processId = response.processId;
    const taskId = `command:${processId}`;
 
    console.log(`Command running in background: ${taskId}`);
 
    while (true) {
      const event = await codebolt.agentEventQueue.waitForNextQueueEvent(1);
      const events = Array.isArray(event) ? event : [event];
 
      for (const item of events) {
        const payload = item.payload as any;
        if (
          payload?.eventName === 'backgroundCommandCompletion' &&
          payload?.data?.processId === processId
        ) {
          const data = payload.data as any;
          codebolt.chat.sendMessage("received completion from background running agent ")
 
          console.log('Command completed');
          console.log('Status:', data.status);
          console.log('Exit code:', data.exitCode);
          console.log('Output:', data.outputTail);
 
          return data;
        }
      }
    }


  
  
  
    // try {
  //   // await runCommand(
  //   //   "foreground timeout",
  //   //   "echo foreground-start && sleep 1m && echo foreground-end",
  //   //   "foreground_scoped",
  //   //   30000,
  //   // );

  //   // const autoResponse = await runCommand(
  //   //   "auto yield",
  //   //   "echo auto-start && sleep 2 && echo auto-end",
  //   //   "auto_scoped",
  //   //   30000,
  //   // );

  //   // const autoProcessId = getProcessId(autoResponse);
  //   // if (autoProcessId) {
  //   //   await inspectManagedCommand(autoProcessId);
  //   // }

  //   await runBackgroundScopedCommandAndWaitForEvent(
  //     "Background Scoped",
  //     "echo background-start && sleep 1 && echo background-end",
  //   );

  //   // const commands = await codebolt.terminal.listCommands();
  //   // await codebolt.chat.sendMessage(summarize("managed list", commands));
  // } catch (error) {
  //   const message = error instanceof Error ? error.message : String(error);
  //   await codebolt.chat.sendMessage("Terminal SDK test failed: " + message);
  // }
});
