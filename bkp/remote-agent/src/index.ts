import codebolt from '@codebolt/codeboltjs';

import { FlatUserMessage ,LLMInferenceParams} from '@codebolt/types/sdk';


codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
   codebolt.chat.sendMessage("Hey Message from Remote Agent",{})
   let messageForLLM: LLMInferenceParams={
      messages: [
         {
            role: 'user',
            content: 'This is a dummy message for testing the remote agent'
         }
      ]
   }
   let {completion}= await codebolt.llm.inference(messageForLLM);
   codebolt.chat.sendMessage(completion?.choices?.[0]?.message?.content || "No response",{})
   
})


