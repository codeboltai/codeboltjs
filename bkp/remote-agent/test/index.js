"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const codeboltjs_1 = __importDefault(require("@codebolt/codeboltjs"));
codeboltjs_1.default.onMessage(async (reqMessage) => {
    codeboltjs_1.default.chat.sendMessage("Hey Message from Remote Agent", {});
    let messageForLLM = {
        messages: [
            {
                role: 'user',
                content: 'This is a dummy message for testing the remote agent'
            }
        ]
    };
    let { completion } = await codeboltjs_1.default.llm.inference(messageForLLM);
    codeboltjs_1.default.chat.sendMessage(completion?.choices?.[0]?.message?.content || "No response", {});
});
//# sourceMappingURL=index.js.map