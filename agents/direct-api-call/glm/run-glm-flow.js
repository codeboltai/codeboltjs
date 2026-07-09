#!/usr/bin/env node
'use strict';

const https = require('node:https');

const API_HOST = 'api.z.ai';
const API_PATH = '/api/coding/paas/v4/chat/completions';
const API_KEY = '';
const RETRY_DELAY_MS = 2000;

const firstPayload = {
  messages: [
    {
      role: 'system',
      content: 'You are testing CodeBolt LLM tool search.\nWhen the user asks for latitude, first call tool_search.\nAfter tool_search returns a script resource, call executeScript with that scriptName and args.',
    },
    {
      role: 'user',
      content: 'Serarch and use tool to get latitude  of delhi',
    },
  ],
  model: 'glm-5.2',
  stream: false,
  tools: [
    {
      type: 'function',
      function: {
        name: 'tool_search',
        description: 'Search available tools and resources.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
            },
          },
          required: ['query'],
        },
      },
    },

  ],
  tool_choice: 'auto',
};

async function main() {
  console.log('Calling GLM first request...');

  const firstBody = JSON.stringify(firstPayload);
  let firstData = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: API_HOST,
      path: API_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US,en',
        Accept: '*/*',
        'User-Agent': 'curl/8.7.1',
        Authorization: `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(firstBody),
      },
    }, (res) => {
      let responseBody = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        const parsed = JSON.parse(responseBody);
        parsed.httpStatus = res.statusCode;
        resolve(parsed);
      });
    });

    req.on('error', reject);
    req.write(firstBody);
    req.end();
  });

  if (firstData.error?.code === '1305') {
    console.log('First request got 1305 overload. Retrying once...');
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));

    firstData = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: API_HOST,
        path: API_PATH,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'en-US,en',
          Accept: '*/*',
          'User-Agent': 'curl/8.7.1',
          Authorization: `Bearer ${API_KEY}`,
          'Content-Length': Buffer.byteLength(firstBody),
        },
      }, (res) => {
        let responseBody = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          const parsed = JSON.parse(responseBody);
          parsed.httpStatus = res.statusCode;
          resolve(parsed);
        });
      });

      req.on('error', reject);
      req.write(firstBody);
      req.end();
    });
  }

  if (firstData.httpStatus < 200 || firstData.httpStatus >= 300) {
    console.error('First request failed:');
    console.error(JSON.stringify(firstData, null, 2));
    process.exit(1);
  }

  console.log('First response:');
  console.log(JSON.stringify(firstData, null, 2));

  const assistantMessage = {
    role: firstData.choices[0].message.role,
    content: firstData.choices[0].message.content || '',
  };

  if (firstData.choices[0].message.tool_calls) {
    assistantMessage.tool_calls = firstData.choices[0].message.tool_calls;
  }

  const secondMessages = [
    ...firstPayload.messages,
    assistantMessage,
  ];

  if (assistantMessage.tool_calls?.length) {
    for (const toolCall of assistantMessage.tool_calls) {
      if (toolCall.function.name === 'tool_search') {
        secondMessages.push({
          role: 'tool',
          name: 'tool_search',
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            searchResult: {
              summary: "found 1 tool and 1 resource",
              tools: ["get_current_time"],
              resources: [
                {
                  type: 'script',
                  name: 'get_latitude_script',
                  description: 'Get the current  latitude for a requested location.',
                  argsSchema: {
                    type: 'object',
                    properties: {
                      location: {
                        type: 'string',
                        description: 'City or place name to get the latitude for.',
                      },
                    },
                    required: ['location'],
                  },
                  call: {
                    tool: 'executeScript',
                    arguments: {
                      scriptName: 'get_latitude_script',
                    },
                  },
                },
              ],
            },

          }),
        });
      }

      if (toolCall.function.name === 'executeScript') {
        secondMessages.push({
          role: 'tool',
          name: 'executeScript',
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            status: 'completed',
            execution: 'client',
            result: 'Delhi temperature is 32 C.',
          }),
        });
      }
    }
  }

  const secondPayload = {
    ...firstPayload,
    stream: false,
    messages: secondMessages,
    tools: [
      ...firstPayload.tools,
      {
        "type": "function",
        "function": {
          "name": "get_current_time",
          "description": "get current time",
          "parameters": {
            "type": "object",
            "properties": {
              "location": {
                "type": "string",
                "description": "City, country, or timezone to get the current time for.",
              },
            },
            "required": [
              "location"
            ]
          },
        }
      },
      {
        type: 'function',
        function: {
          name: 'executeScript',
          description: 'Execute a saved script by name with arguments.',
          parameters: {
            type: 'object',
            properties: {
              scriptName: {
                type: 'string',
              },
              args: {
                type: 'object',
              },
            },
            required: ['scriptName'],
          },
        },
      },
    ],
  };

  console.log('Second request payload:');
  console.log(JSON.stringify(secondPayload, null, 2));
  console.log('Calling GLM second request...');

  const secondBody = JSON.stringify(secondPayload);
  let secondData = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: API_HOST,
      path: API_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US,en',
        Accept: '*/*',
        'User-Agent': 'curl/8.7.1',
        Authorization: `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(secondBody),
      },
    }, (res) => {
      let responseBody = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        const parsed = JSON.parse(responseBody);
        parsed.httpStatus = res.statusCode;
        resolve(parsed);
      });
    });

    req.on('error', reject);
    req.write(secondBody);
    req.end();
  });

  if (secondData.error?.code === '1305') {
    console.log('Second request got 1305 overload. Retrying once...');
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));

    secondData = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: API_HOST,
        path: API_PATH,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'en-US,en',
          Accept: '*/*',
          'User-Agent': 'curl/8.7.1',
          Authorization: `Bearer ${API_KEY}`,
          'Content-Length': Buffer.byteLength(secondBody),
        },
      }, (res) => {
        let responseBody = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          const parsed = JSON.parse(responseBody);
          parsed.httpStatus = res.statusCode;
          resolve(parsed);
        });
      });

      req.on('error', reject);
      req.write(secondBody);
      req.end();
    });
  }

  if (secondData.httpStatus < 200 || secondData.httpStatus >= 300) {
    console.error('Second request failed:');
    console.error(JSON.stringify(secondData, null, 2));
    process.exit(1);
  }

  console.log('Second response:');
  console.log(JSON.stringify(secondData, null, 2));

  const secondAssistantMessage = {
    role: secondData.choices[0].message.role,
    content: secondData.choices[0].message.content || '',
  };

  if (secondData.choices[0].message.tool_calls) {
    secondAssistantMessage.tool_calls = secondData.choices[0].message.tool_calls;
  }

  const thirdMessages = [
    ...secondPayload.messages,
    secondAssistantMessage,
  ];

  if (secondAssistantMessage.tool_calls?.length) {
    for (const toolCall of secondAssistantMessage.tool_calls) {
      if (toolCall.function.name === 'executeScript') {
        thirdMessages.push({
          role: 'tool',
          name: 'executeScript',
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            status: 'completed',
            execution: 'client',
            scriptName: 'get_latitude_script',
            args: {
              location: 'Delhi',
            },
            result: {
              location: 'Delhi',
              latitude: 28.6139,
            },
          }),
        });
      }
    }
  }

  const thirdPayload = {
    model: secondPayload.model,
    stream: false,
    messages: thirdMessages,
    tools: firstPayload.tools,
  };

  console.log('Third request payload:');
  console.log(JSON.stringify(thirdPayload, null, 2));
  console.log('Calling GLM third request...');

  const thirdBody = JSON.stringify(thirdPayload);
  let thirdData = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: API_HOST,
      path: API_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US,en',
        Accept: '*/*',
        'User-Agent': 'curl/8.7.1',
        Authorization: `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(thirdBody),
      },
    }, (res) => {
      let responseBody = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        const parsed = JSON.parse(responseBody);
        parsed.httpStatus = res.statusCode;
        resolve(parsed);
      });
    });

    req.on('error', reject);
    req.write(thirdBody);
    req.end();
  });

  if (thirdData.error?.code === '1305') {
    console.log('Third request got 1305 overload. Retrying once...');
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));

    thirdData = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: API_HOST,
        path: API_PATH,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'en-US,en',
          Accept: '*/*',
          'User-Agent': 'curl/8.7.1',
          Authorization: `Bearer ${API_KEY}`,
          'Content-Length': Buffer.byteLength(thirdBody),
        },
      }, (res) => {
        let responseBody = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          const parsed = JSON.parse(responseBody);
          parsed.httpStatus = res.statusCode;
          resolve(parsed);
        });
      });

      req.on('error', reject);
      req.write(thirdBody);
      req.end();
    });
  }

  if (thirdData.httpStatus < 200 || thirdData.httpStatus >= 300) {
    console.error('Third request failed:');
    console.error(JSON.stringify(thirdData, null, 2));
    process.exit(1);
  }

  console.log('Third response:');
  console.log(JSON.stringify(thirdData, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
