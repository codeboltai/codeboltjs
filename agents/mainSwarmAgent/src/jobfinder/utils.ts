import codebolt from '@codebolt/codeboltjs';

// ================================
// JSON PARSING HELPERS
// ================================

export function parseJson<T>(response: string): T | null {
    try {
        // Try to extract JSON from response
        let jsonStr = response.replace(/```json\n?|\n?```/g, '').trim();

        // Try to find JSON object in the response
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        return JSON.parse(jsonStr) as T;
    } catch (e) {
        codebolt.chat.sendMessage(`JSON parse error: ${e}`);
        return null;
    }
}

export async function llm(systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await codebolt.llm.inference({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        llmrole: 'default',
    });
    return res.completion?.choices?.[0]?.message?.content || '';
}

/**
 * Call LLM with retry for JSON parsing
 * If parsing fails, sends the error back to LLM to fix the JSON
 */
export async function llmWithJsonRetry<T>(
    systemPrompt: string,
    userPrompt: string,
    maxRetries: number = 3
): Promise<T | null> {
    let lastResponse = '';
    let lastError = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        let currentPrompt = userPrompt;

        // If this is a retry, include the error feedback
        if (attempt > 1 && lastError) {
            currentPrompt = `${userPrompt}

IMPORTANT: Your previous response was not valid JSON.
Error: ${lastError}
Your response was: ${lastResponse.substring(0, 500)}...

Please respond with ONLY a valid JSON object. No markdown, no explanation, just the JSON.`;
        }

        const response = await llm(systemPrompt, currentPrompt);
        lastResponse = response;

        const parsed = parseJson<T>(response);
        if (parsed) {
            return parsed;
        }

        // Store error for next retry
        try {
            JSON.parse(response);
        } catch (e) {
            lastError = e instanceof Error ? e.message : 'Invalid JSON format';
        }

        codebolt.chat.sendMessage(`⚠️ JSON parse failed (attempt ${attempt}/${maxRetries}), retrying...`);
    }

    codebolt.chat.sendMessage(`❌ Failed to get valid JSON after ${maxRetries} attempts`);
    return null;
}
