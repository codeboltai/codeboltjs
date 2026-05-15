import codebolt from '@codebolt/codeboltjs';

import { FlatUserMessage } from "@codebolt/types/sdk";


codebolt.onMessage(async (reqMessage: FlatUserMessage) => {

    let response = await codebolt.actionBlock.start("generated-action-block", {
        "spec": {
            includeCursor: true,
        }
    })

    // await codebolt.agent.startAgent("c4d3fdb9-cf9e-4f82-8a1d-0160bbfc9ae9", "run this app")


    codebolt.chat.sendMessage(JSON.stringify(response))



})


