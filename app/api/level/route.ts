import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
    try {
      // Récupération des niveaux et des classes en parallèle
      const [levelsResponse, classesResponse] = await Promise.all([
        fetch("https://educty.digifaz.com/api/level"),
        fetch("https://educty.digifaz.com/api/classe"),
      ]);
  
      if (!levelsResponse.ok || !classesResponse.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }
  
      const levels = await levelsResponse.json();
      const classes = await classesResponse.json();
  
      // Comptage des classes par level_id
      const levelCounts: Record<number, number> = {};
      classes.forEach((classe: any) => {
        levelCounts[classe.level_id] = (levelCounts[classe.level_id] || 0) + 1;
      });
  
      // Fusion des données
      const mergedData = levels.map((level: any) => ({
        ...level,
        class_count: levelCounts[level.id] || 0, // Ajout du nombre de classes
      }));
  
      return NextResponse.json(mergedData, { status: 200 });
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
      return NextResponse.json(
        { error: "Erreur interne du serveur" },
        { status: 500 }
      );
    }
  }
  

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch('https://educty.digifaz.com/api/level', {
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
    
    const response = await fetch(`https://educty.digifaz.com/api/level/${id}`, {
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
    
    const response = await fetch(`https://educty.digifaz.com/api/level/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression des données :', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
