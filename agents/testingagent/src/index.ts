import codebolt from '@codebolt/codeboltjs';

import { FlatUserMessage } from "@codebolt/types/sdk";


codebolt.onMessage(async (reqMessage: FlatUserMessage) => {

    let response = await codebolt.mcp.executeTool('codebolt', 'read_file', {
        "absolute_path": "/Users/ravirawat/Documents/cbtest/handicapped-crimson/package.json",
        "explanation": "Creating package.json for the WhatsApp clone backend with all required dependencies"
    })





})


