// lib/image-proxy-utils.ts


/**
 * Génère l'URL du proxy pour une image externe
 * @param originalUrl - L'URL originale de l'image
 * @returns L'URL du proxy ou l'URL originale si pas besoin de proxy
 */
export const getProxiedImageUrl = (originalUrl: string): string => {
  // Si pas d'URL ou déjà en base64/blob, retourner tel quel
  if (!originalUrl || 
      originalUrl.startsWith('data:') || 
      originalUrl.startsWith('blob:') ||
      originalUrl.startsWith('/')) {
    return originalUrl;
  }
  
  // Liste des domaines qui nécessitent un proxy
  const domainsNeedingProxy = [
    process.env.NEXT_PUBLIC_API_BASE_URL_2 as string,
    process.env.NEXT_PUBLIC_API_BASE_URL as string
  ].filter(Boolean);
  
  // Vérifier si l'URL nécessite un proxy
  const needsProxy = domainsNeedingProxy.some(domain => 
    originalUrl.includes(domain)
  );
  
  if (!needsProxy) {
    return originalUrl;
  }
  
  // IMPORTANT: Le nom doit correspondre à votre route API
  const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
      
  return proxyUrl;
};

/**
 * Fonction pour précharger une image via le proxy
 */
export const preloadProxiedImage = (originalUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const proxiedUrl = getProxiedImageUrl(originalUrl);
        
    const img = new Image();
        
    img.onload = () => {
      resolve(proxiedUrl);
    };
        
    img.onerror = (error) => {
      console.warn(`Impossible de précharger l'image: ${originalUrl}`, error);
      reject(new Error(`Échec du préchargement: ${originalUrl}`));
    };
        
    img.src = proxiedUrl;
  });
};


