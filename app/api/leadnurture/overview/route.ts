import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'user_id is required' },
      { status: 400 }
    );
  }

  try {
    // Use local backend in development, production URL otherwise
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    const response = await fetch(
      `${backendUrl}/api/leadnurture/overview?user_id=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching overview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch overview data' },
      { status: 500 }
    );
  }
}
