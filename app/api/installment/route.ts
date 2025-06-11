import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  try {
    
    const data = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/installment`).then(res => res.json());
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/installment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de l\'ajout des données :', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}


export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const id = new URL(request.url).searchParams.get('id');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/installment/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des données :', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/installment/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression des données :', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
