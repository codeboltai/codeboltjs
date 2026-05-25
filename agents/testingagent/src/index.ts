import codebolt from '@codebolt/codeboltjs';

import { FlatUserMessage } from "@codebolt/types/sdk";


codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    let parms = {
        // ── Basic thread info ──────────────────────────────────────
        title: 'Test Remote Agent Run',
        description: 'Dummy test thread to verify createThreadInBackground works.',
        agentId: 'c4d3fdb9-cf9e-4f82-8a1d-0160bbfc9ae9',   // replace with real agentId
        status: 'pending',
        tags: ['test', 'remote'],
        metadata: { triggeredBy: 'dummy-test', version: '1.0' },
        // ── Message / prompt ───────────────────────────────────────
        userMessage: 'do npm run setup',
        selectedAgent: {
            id: 'c4d3fdb9-cf9e-4f82-8a1d-0160bbfc9ae9',
            agentId: 'c4d3fdb9-cf9e-4f82-8a1d-0160bbfc9ae9',
            name: 'My Remote Agent',
        },
        mentionedAgents: [],
        mentionedEnvironments: [],
        mentionedMCPs: [],
        remixPrompt: '',
        // ── Remote environment ─────────────────────────────────────
        isRemoteTask: true,
        remoteEnv: true,
        environment: {
            id: 'cloud:49098d4c-1ada-4123-b95e-c821f19745bb',  // replace with real env ID
        },
        environmentName: 'my-remote-env',
        environmentProvider: {
            name: 'cloud',
            unique_id: '49098d4c-1ada-4123-b95e-c821f19745bb',
            providerId: 'cloud',
        },
        // ── Grouping / scheduling ──────────────────────────────────
        groupId: undefined,
        isGrouped: false,
        processId: undefined,
        stepId: undefined,
        // ── Step / selection (optional) ────────────────────────────
        messageId: `test-msg-${Date.now()}`,
        activeStepId: undefined,
        currentStep: undefined,
        steps: [],
        selection: {
            selectedText: '',
        },
    };


    let response = await codebolt.thread.createThreadInBackground(parms)
    // await codebolt.agent.startAgent("c4d3fdb9-cf9e-4f82-8a1d-0160bbfc9ae9", "run this app")


    codebolt.chat.sendMessage(JSON.stringify(response))



})


