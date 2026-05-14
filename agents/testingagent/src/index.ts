import codebolt from '@codebolt/codeboltjs';

import { FlatUserMessage } from "@codebolt/types/sdk";


codebolt.onMessage(async (reqMessage: FlatUserMessage) => {

    await codebolt.agent.startAgent("c4d3fdb9-cf9e-4f82-8a1d-0160bbfc9ae9", "run this app")





})


