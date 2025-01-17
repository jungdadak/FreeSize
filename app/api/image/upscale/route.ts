import { NextResponse } from 'next/server';

const SPRING_API_URL = process.env.SPRING_API_URL || 'http://localhost:8080';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const response = await fetch(`${SPRING_API_URL}/api/v1/image/upscale`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        `Spring server responded with status: ${response.status}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in upscale API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
