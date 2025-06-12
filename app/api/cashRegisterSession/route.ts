import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/cashRegisterSession
 * Retrieves a list of cash register sessions.
 */
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cashRegisterSession`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la récupération des sessions de caisse');
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Erreur GET :', error);
    return NextResponse.json({ message: error.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}

/**
 * POST /api/cashRegisterSession
 * Creates a new cash register session.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cashRegisterSession`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la création de la session de caisse");
    }
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Erreur POST :', error);
    return NextResponse.json({ message: error.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}

/**
 * PUT /api/cashRegisterSession/:id
 * Updates an existing cash register session.
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Paramètre id manquant' }, { status: 400 });
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cashRegisterSession/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la mise à jour de la session de caisse");
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Erreur PUT :', error);
    return NextResponse.json({ message: error.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}

/**
 * DELETE /api/cashRegisterSession/:id
 * Deletes a cash register session.
 */
export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Paramètre id manquant' }, { status: 400 });
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cashRegisterSession/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la suppression de la session de caisse");
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Erreur DELETE :', error);
    return NextResponse.json({ message: error.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}
