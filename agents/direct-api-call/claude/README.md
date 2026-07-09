# Claude Direct API Call

Runs a static Anthropic Messages API JSON request using the same Claude OAuth auth file as `plugins/anthropic-plugin`.

```bash
node agents/direct-api-call/claude/index.js
```

Optional:

```bash
CLAUDE_MODEL=claude-sonnet-5 node agents/direct-api-call/claude/index.js
MAX_TOKENS=1024 node agents/direct-api-call/claude/index.js "Return a short JSON status object"
```

The script reads credentials from:

```text
~/.codebolt/plugins/anthropic-plugin/auth.json
```

It writes the two request bodies and raw responses here:

```text
agents/direct-api-call/claude/body1.json
agents/direct-api-call/claude/body2.json
agents/direct-api-call/claude/response1.txt
agents/direct-api-call/claude/response2.txt
```
