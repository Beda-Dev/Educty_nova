import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la récupération des utilisateurs');
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Erreur GET :', error);
    return NextResponse.json({ message: error.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de l'ajout de l'utilisateur");
    }
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Erreur POST :", error);
    return NextResponse.json({ message: error.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}


export async function PUT(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'ID requis pour la mise à jour' }, { status: 400 });
    }
    const body = await request.json();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la mise à jour de l'utilisateur");
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Erreur PUT :', error);
    return NextResponse.json({ message: error.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'ID requis pour la suppression' }, { status: 400 });
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la suppression de l'utilisateur");
    }
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur DELETE :', error);
    return NextResponse.json({ message: error.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}
