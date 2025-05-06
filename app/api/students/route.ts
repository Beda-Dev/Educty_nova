import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const data = await fetch('https://educty.digifaz.com/api/student').then(res => res.json());
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData(); // Récupérer FormData depuis la requête

    const response = await fetch('https://educty.digifaz.com/api/student', {
      method: 'POST',
      body: formData, // Envoyer FormData directement
    });

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'ajout des données :", error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    
    const jsonData = await request.json();

    const response = await fetch(`https://educty.digifaz.com/api/student/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des données :", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    const response = await fetch(`https://educty.digifaz.com/api/student/${id}`, {
      method: 'DELETE',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la suppression des données :", error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
