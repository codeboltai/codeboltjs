import codebolt from '@codebolt/codeboltjs';

export function parseJson<T>(response: string): T | null {
    try {
        let jsonStr = response.replace(/```json\n?|\n?```/g, '').trim();
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }
        return JSON.parse(jsonStr) as T;
    } catch (error) {
        codebolt.chat.sendMessage(`JSON parse error: ${error}`);
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

export async function llmWithJsonRetry<T>(
    systemPrompt: string,
    userPrompt: string,
    maxRetries: number = 3
): Promise<T | null> {
    let lastResponse = '';
    let lastError = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        let currentPrompt = userPrompt;

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

        try {
            JSON.parse(response);
        } catch (error) {
            lastError = error instanceof Error ? error.message : 'Invalid JSON format';
        }

        codebolt.chat.sendMessage(`JSON parse failed (attempt ${attempt}/${maxRetries}), retrying...`, {});
    }

    codebolt.chat.sendMessage(`Failed to get valid JSON after ${maxRetries} attempts`, {});
    return null;
}

export function formatTeamProposalMessage(
    teamName: string,
    description: string,
    neededRoles: string[]
): string {
    return `TEAM PROPOSAL
---
Team: ${teamName}
Description: ${description}
Needed Roles: ${neededRoles.join(', ')}`;
}
