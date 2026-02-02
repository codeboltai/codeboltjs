import { NextRequest, NextResponse } from 'next/server';
import codebolt from '@codebolt/codeboltjs';

// Set default environment variables before any codebolt imports trigger initialization
if (!process.env.SOCKET_PORT) {
  process.env.SOCKET_PORT = '12345';
}
if (!process.env.CODEBOLT_SERVER_URL) {
  process.env.CODEBOLT_SERVER_URL = 'localhost';
}

console.log('[API] Environment configured - SOCKET_PORT:', process.env.SOCKET_PORT, 'SERVER_URL:', process.env.CODEBOLT_SERVER_URL);

// The codebolt singleton automatically initializes WebSocket on import
// We just need to wait for it to be ready before executing functions
async function ensureInitialized(): Promise<void> {
  console.log('[API] Waiting for Codebolt WebSocket to be ready...');
  await codebolt.waitForReady();
  console.log('[API] Codebolt WebSocket is ready');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { module: moduleName, function: functionName, parameters } = body;

    if (!moduleName || !functionName) {
      return NextResponse.json(
        { error: 'Module and function names are required' },
        { status: 400 }
      );
    }

    // Ensure WebSocket is initialized before executing
    try {
      await ensureInitialized();
    } catch (initError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to connect to Codebolt server. Make sure Codebolt is running on port 12345.',
          details: initError instanceof Error ? initError.message : 'Connection failed',
        },
        { status: 503 }
      );
    }

    // Get the module from codebolt
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moduleObj = (codebolt as any)[moduleName];

    if (!moduleObj) {
      return NextResponse.json(
        { error: `Module "${moduleName}" not found` },
        { status: 404 }
      );
    }

    // Handle nested function names like "json.save"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let targetFunction: any = moduleObj;
    const functionParts = functionName.split('.');

    for (const part of functionParts) {
      if (targetFunction && typeof targetFunction === 'object' && part in targetFunction) {
        targetFunction = targetFunction[part];
      } else {
        return NextResponse.json(
          { error: `Function "${functionName}" not found in module "${moduleName}"` },
          { status: 404 }
        );
      }
    }

    if (typeof targetFunction !== 'function') {
      return NextResponse.json(
        { error: `"${functionName}" is not a function in module "${moduleName}"` },
        { status: 400 }
      );
    }

    // Execute the function with parameters
    const paramValues = parameters ? Object.values(parameters) : [];

    // Call the function
    const result = await targetFunction(...paramValues);

    return NextResponse.json({
      success: true,
      data: result,
      module: moduleName,
      function: functionName,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Execution error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Check connection status using the codebolt singleton
  const connected = codebolt.ready;

  return NextResponse.json({
    status: connected ? 'connected' : 'disconnected',
    message: 'CodeboltJS API endpoint. Use POST to execute functions.',
    socketPort: process.env.SOCKET_PORT || '12345',
    serverUrl: process.env.CODEBOLT_SERVER_URL || 'localhost',
    usage: {
      method: 'POST',
      body: {
        module: 'string - Module name (e.g., "fs", "browser")',
        function: 'string - Function name (e.g., "readFile", "screenshot")',
        parameters: 'object - Function parameters as key-value pairs',
      },
    },
  });
}
