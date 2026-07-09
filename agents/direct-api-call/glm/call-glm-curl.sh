#!/usr/bin/env bash
set -euo pipefail

API_URL="${ZAI_API_URL:-https://api.z.ai/api/coding/paas/v4/chat/completions}"
API_KEY=""
PAYLOAD='{
  "messages": [
    {
      "role": "system",
      "content": "You are testing CodeBolt LLM tool search.\nWhen the user asks for weather, first call tool_search.\nAfter tool_search returns a script resource, call executeScript with that scriptName and args."
    },
    {
      "role": "user",
      "content": "Serarch and use tool to get temperature  of delhi"
    }
  ],
  "model": "glm-5.2",
  "stream": false,
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "tool_search",
        "description": "Search available tools and resources.",
        "parameters": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string"
            }
          },
          "required": [
            "query"
          ]
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "executeScript",
        "description": "Execute a saved script by name with arguments.",
        "parameters": {
          "type": "object",
          "properties": {
            "scriptName": {
              "type": "string"
            },
            "args": {
              "type": "object"
            }
          },
          "required": [
            "scriptName"
          ]
        }
      }
    }
  ],
  "tool_choice": "auto"
}'

usage() {
  cat >&2 <<'EOF'
Usage:
  ./agents/direct-api-call/call-glm-curl.sh
  ZAI_API_KEY=your_key ./agents/direct-api-call/call-glm-curl.sh payload.json
  ZAI_API_KEY=your_key ./agents/direct-api-call/call-glm-curl.sh '{"model":"glm-5.2","messages":[...]}'
  cat payload.json | ZAI_API_KEY=your_key ./agents/direct-api-call/call-glm-curl.sh

Optional:
  ZAI_API_URL  Override the chat completions endpoint.
  ZAI_API_KEY  Override the hardcoded API_KEY value.
EOF
}

if [[ -n "${ZAI_API_KEY:-}" ]]; then
  API_KEY="$ZAI_API_KEY"
fi

if [[ "$API_KEY" == "REPLACE_WITH_ZAI_API_KEY" || -z "$API_KEY" ]]; then
  echo "Replace API_KEY in this script or set ZAI_API_KEY." >&2
  usage
  exit 1
fi

if [[ $# -gt 0 ]]; then
  input="$1"

  if [[ "$input" == @* ]]; then
    file_path="${input#@}"
    PAYLOAD="$(<"$file_path")"
  elif [[ -f "$input" ]]; then
    PAYLOAD="$(<"$input")"
  else
    PAYLOAD="$input"
  fi
elif [[ ! -t 0 ]] && payload_from_stdin="$(cat)" && [[ -n "$payload_from_stdin" ]]; then
  PAYLOAD="$payload_from_stdin"
fi

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en-US,en" \
  -H "Authorization: Bearer ${API_KEY}" \
  -d "$PAYLOAD"
