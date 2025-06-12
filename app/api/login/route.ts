import { NextRequest, NextResponse } from 'next/server';



export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL
  try {
    const body = await request.json();
    
    const response = await fetch(`${url}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}



