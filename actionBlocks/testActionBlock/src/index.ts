import codebolt from '@codebolt/codeboltjs';

codebolt.onActionBlockInvocation(async (context,additionalVariable) => {
   codebolt.chat.sendMessage("hello from side executor")
})


