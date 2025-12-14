import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";
import { CreateTaskOptions } from '@codebolt/types/agent-to-app-ws-schema';

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    codebolt.chat.sendMessage("starting side executor")
let response= await  codebolt.sideExecution.startWithActionBlock('/Users/ravirawat/Documents/codeboltai/codeboltjs/actionBlocks/testActionBlock/dist');

codebolt.chat.sendMessage(JSON.stringify(response))

});



