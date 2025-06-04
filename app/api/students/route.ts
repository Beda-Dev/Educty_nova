import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    const url = id 
      ? `https://educty.digifaz.com/api/student/${id}`
      : 'https://educty.digifaz.com/api/student';

    const response = await fetch(url);
    
    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(`Erreur: ${data.error || response.status}`);
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    let body: FormData | any;
    let options: any = { method: 'POST' };

    if (contentType?.includes('multipart/form-data')) {
      body = await request.formData();
      // Pas besoin de headers pour FormData, le navigateur les définit automatiquement
    } else {
      body = await request.json();
      options.headers = {
        'Content-Type': 'application/json',
      };
      options.body = JSON.stringify(body);
    }

    const response = await fetch('https://educty.digifaz.com/api/student', {
      ...options,
      body: body instanceof FormData ? body : options.body,
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(`Erreur: ${ JSON.stringify(data.error)}`);
    }

    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'ajout des données :", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'ID requis pour la mise à jour' },
        { status: 400 }
      );
    }

    const contentType = request.headers.get('content-type');
    let body: FormData | any;
    let options: any = { method: 'PUT' };

    if (contentType?.includes('multipart/form-data')) {
      body = await request.formData();
      // Pas besoin de headers pour FormData
    } else {
      body = await request.json();
      options.headers = {
        'Content-Type': 'application/json',
      };
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`https://educty.digifaz.com/api/student/${id}`, {
      ...options,
      body: body instanceof FormData ? body : options.body,
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
    const id = request.nextUrl.searchParams.get('id') || (await request.json()).id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID requis pour la suppression' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://educty.digifaz.com/api/student/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression des données :", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}