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
    },
    {
        "content": "I will help you get the temperature of Delhi! Let me first search for a weather-related tool.",
        "reasoning_content": "The user wants to get the temperature of Delhi. Let me first search for available weather-related tools.",
        "role": "assistant",
        "tool_calls": [
          {
            "function": {
              "arguments": "{\"query\":\"weather temperature\"}",
              "name": "tool_search"
            },
            "id": "call_-7459678454447861576",
            "index": 0,
            "type": "function"
          }
        ]
      },
    {
      "role": "tool",
      "name": "tool_search",
      "tool_call_id": "call_-7459678454447861576",
      "content": "{\"status\":\"completed\",\"execution\":\"client\",\"tools\":[{\"type\":\"function\",\"name\":\"get_current_time\",\"description\":\"Get the current time for a location or timezone.\",\"parameters\":{\"type\":\"object\",\"properties\":{\"location\":{\"type\":\"string\",\"description\":\"City, country, or timezone to get the current time for.\"}},\"required\":[\"location\"]}},{\"type\":\"function\",\"name\":\"executeScript\",\"description\":\"Execute a saved script by name with arguments.\",\"parameters\":{\"type\":\"object\",\"properties\":{\"scriptName\":{\"type\":\"string\"},\"args\":{\"type\":\"object\"}},\"required\":[\"scriptName\"]}}],\"resources\":[{\"type\":\"script\",\"name\":\"get_weather_script\",\"description\":\"Get the current weather report and temperature for a requested location.\",\"argsSchema\":{\"type\":\"object\",\"properties\":{\"location\":{\"type\":\"string\",\"description\":\"City or place name to get the weather for.\"}},\"required\":[\"location\"]},\"call\":{\"tool\":\"executeScript\",\"arguments\":{\"scriptName\":\"get_weather_script\"}}}]}"
    }
  ],
  "model": "glm-5.2",
  "stream": true,
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
    },
    {
      "type": "function",
      "function": {
        "name": "get_current_time",
        "description": "Get the current time for a location or timezone.",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "City, country, or timezone to get the current time for."
            }
          },
          "required": [
            "location"
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
