// app/api/image-proxy/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 1. Extraire l'URL de l'image depuis les paramètres de requête
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    

    // 2. Validation de base
    if (!imageUrl) {
      return new NextResponse('Paramètre URL manquant', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // 3. Sécurité : Vérifier que l'URL provient uniquement de votre API
    const allowedDomains = [
      process.env.NEXT_PUBLIC_API_BASE_URL_2 , process.env.NEXT_PUBLIC_API_BASE_URL
    ].filter(Boolean);

    const isAllowed = allowedDomains.some(domain => 
      imageUrl.startsWith(domain as string)
    );

    if (!isAllowed) {
      console.warn(`URL non autorisée tentée: ${imageUrl}`);
      return new NextResponse('Domaine non autorisé', { 
        status: 403,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // 4. Décoder l'URL si elle a été encodée
    const decodedImageUrl = decodeURIComponent(imageUrl);
    
    console.log(`Chargement de l'image via proxy: ${decodedImageUrl}`);

    // 5. Faire la requête vers l'API Laravel
    const response = await fetch(decodedImageUrl, {
      method: 'GET',
      headers: {
        // Ajouter des en-têtes pour ressembler à un navigateur normal
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS-ImageProxy/1.0)',
        'Accept': 'image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache',
      },
      // Timeout de 10 secondes
      signal: AbortSignal.timeout(10000)
    });

    // 6. Vérifier si la requête a réussi
    if (!response.ok) {
      console.error(`Erreur ${response.status} lors du chargement: ${decodedImageUrl}`);
      return new NextResponse(`Image non trouvée (${response.status})`, { 
        status: response.status,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // 7. Obtenir le type de contenu
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    console.log(contentType);
    
    // Vérifier que c'est bien une image
    if (!contentType.startsWith('image/')) {
      console.warn(`Type de contenu non-image reçu: ${contentType}`);
      return new NextResponse('Le fichier demandé n\'est pas une image', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // 8. Lire le contenu de l'image
    const imageBuffer = await response.arrayBuffer();
    
    // 9. Vérifier la taille (limite à 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageBuffer.byteLength > maxSize) {
      console.warn(`Image trop volumineuse: ${imageBuffer.byteLength} bytes`);
      return new NextResponse('Image trop volumineuse', { 
        status: 413,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // 10. Retourner l'image avec les bons en-têtes
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.byteLength.toString(),
        // En-têtes de cache pour optimiser les performances
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800', // 24h cache, 7j stale
        'ETag': `"${Date.now()}"`, // ETag simple basé sur le timestamp
        // En-têtes CORS pour permettre l'accès depuis votre frontend
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        // En-têtes de sécurité
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });

  } catch (error) {
    // 11. Gestion des erreurs
    console.error('Erreur dans le proxy d\'image:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return new NextResponse('Timeout lors du chargement de l\'image', { 
          status: 504,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      if (error.message.includes('fetch')) {
        return new NextResponse('Impossible de se connecter au serveur d\'images', { 
          status: 502,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }

    return new NextResponse('Erreur interne du serveur', { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// 12. Gérer les requêtes OPTIONS pour CORS (optionnel)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}