import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { threadToken, agentId } = body;

    // Mock response for action plans
    const mockResponse = {
      success: true,
      message: 'Action plans retrieved successfully',
      data: [
        {
          id: 'plan-001',
          name: 'Setup Development Environment',
          description: 'Configure development environment for the project',
          status: 'active',
          agentId: agentId || '03ad0d21-738b-4b55-8ba5-ea8c39d3c539',
          created: new Date().toISOString(),
          tasks: [
            {
              id: 'task-001',
              name: 'Install dependencies',
              status: 'completed',
              priority: 'high',
            },
            {
              id: 'task-002',
              name: 'Configure database',
              status: 'in_progress',
              priority: 'medium',
            },
          ],
        },
        {
          id: 'plan-002',
          name: 'Implement User Authentication',
          description: 'Add user authentication system',
          status: 'pending',
          agentId: agentId || '03ad0d21-738b-4b55-8ba5-ea8c39d3c539',
          created: new Date().toISOString(),
          tasks: [],
        },
      ],
      threadToken,
      agentId,
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Get all plans error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
