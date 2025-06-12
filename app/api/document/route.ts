import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/document`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la récupération des documents');
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Erreur GET :', error);
    return NextResponse.json({ message: error.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/document`, {
      method: 'POST',
      body: formData, // ✅ PAS de headers, FormData s'en charge
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la création du document");
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
      return NextResponse.json({ message: 'Paramètre id manquant' }, { status: 400 });
    }

    const formData = await request.formData();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/document/${id}`, {
      method: 'PUT',
      body: formData, // ✅ on passe le FormData brut
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la mise à jour du document");
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Erreur PUT :", error);
    return NextResponse.json({ message: error.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Paramètre id manquant' }, { status: 400 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/document/${id}`, {
      method: 'DELETE',
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la suppression du document");
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Erreur DELETE :", error);
    return NextResponse.json({ message: error.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}
