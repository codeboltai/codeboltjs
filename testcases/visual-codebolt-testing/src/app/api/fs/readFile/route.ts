import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filePath, threadToken, agentId } = body;

    if (!filePath) {
      return NextResponse.json(
        { error: 'Missing required parameter: filePath' },
        { status: 400 }
      );
    }

    // Mock response
    const mockResponse = {
      success: true,
      message: `File read successfully: ${filePath}`,
      data: {
        filePath,
        content: `// Mock file content for ${filePath}\n// This is simulated data\nexport const mockData = 'Hello from codeboltjs testing UI';`,
        size: 150,
        modified: new Date().toISOString(),
      },
      threadToken,
      agentId,
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Read file error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
