import { NextRequest, NextResponse } from 'next/server';
import codebolt from '@codebolt/codeboltjs';

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
    let targetFunction: unknown = moduleObj;
    const functionParts = functionName.split('.');

    for (const part of functionParts) {
      if (targetFunction && typeof targetFunction === 'object' && part in targetFunction) {
        targetFunction = (targetFunction as Record<string, unknown>)[part];
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
    // Convert parameters object to array of values if needed
    const paramValues = parameters ? Object.values(parameters) : [];

    // Call the function
    const result = await (targetFunction as (...args: unknown[]) => Promise<unknown>)(...paramValues);

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
  return NextResponse.json({
    status: 'ok',
    message: 'CodeboltJS API endpoint. Use POST to execute functions.',
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
