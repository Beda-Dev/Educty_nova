import { NextRequest, NextResponse } from 'next/server';



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch('https://educty.digifaz.com/api/login', {
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



