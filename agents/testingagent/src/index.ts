import codebolt from "@codebolt/codeboltjs";
import { FlatUserMessage } from "@codebolt/types/sdk";

codebolt.onMessage(async (_reqMessage: FlatUserMessage) => {
    const configResponse = await codebolt.swarm.getSwarmConfig("");
    codebolt.chat.sendMessage(JSON.stringify(configResponse))
  
});
