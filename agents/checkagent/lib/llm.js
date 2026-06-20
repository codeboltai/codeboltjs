const {
  codebolt,
  parseJsonObject
} = require("./runtime");

function llmText(response) {
  return (
    response?.completion?.choices?.[0]?.message?.content ||
    response?.completion?.choices?.[0]?.text ||
    response?.completion?.content ||
    response?.message ||
    response?.content ||
    ""
  );
}

async function inferJson(systemPrompt, userPrompt, options = {}) {
  let lastResponse = "";
  let lastError = "";
  const maxRetries = options.maxRetries || 2;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    const retryText = attempt === 1 ? "" : `\n\nPrevious response was not valid JSON.\nError: ${lastError}\nResponse: ${lastResponse.slice(0, 1000)}\nReturn only corrected JSON.`;
    const response = await codebolt.llm.inference({
      messages: [
        { role: "system", content: `${systemPrompt}\n\nReturn only valid JSON. Do not use markdown.` },
        { role: "user", content: `${userPrompt}${retryText}` }
      ],
      llmrole: options.llmrole || "testingllm",
      temperature: options.temperature ?? 0
    });
    lastResponse = llmText(response);
    const parsed = parseJsonObject(lastResponse);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
    lastError = "Response was not a JSON object.";
  }
  return undefined;
}

module.exports = {
  inferJson
};
