

import codebolt from "@codebolt/codeboltjs";
import { FlatUserMessage } from "@codebolt/types/sdk";



codebolt.onMessage(async (_reqMessage: FlatUserMessage) => {
    await codebolt.chat.sendMessage("Testing tool_search resources flow");
    let response = await codebolt.mcp.executeTool('codebolt', 'tool_search', { "explanation": "Searching with broader query to find any weather tools available.", "limit": 15, "query": "weather", "searchScope": "tools+actionBlock" })
    codebolt.chat.sendMessage(JSON.stringify(response))

});
