const codebolt = require('@codebolt/codeboltjs');

const { UserMessage, SystemPrompt, TaskInstruction, Agent } = require("@codebolt/codeboltjs/utils");
codebolt.default.onMessage(message => {

    codebolt.default.fs.readFile('/Users/ravirawat/Documents/codeboltai/remote-codeboltdocker/packages/dockerserver/test.js').then(content => {
        console.log('File content:', content);
    }).catch(err => {
        console.error('Error reading file:', err);
    });
})

