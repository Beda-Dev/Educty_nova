
import { useState, useEffect } from 'react';
import { getProxiedImageUrl } from '../lib/imageProxy';



export const useProxiedImage = (originalUrl: string) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!originalUrl) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const proxiedUrl = getProxiedImageUrl(originalUrl);

    // Test de chargement de l'image
    const img = new Image();
        
    img.onload = () => {
      setImageUrl(proxiedUrl);
      setIsLoading(false);
    };
        
    img.onerror = () => {
      setError('Impossible de charger l\'image');
      setImageUrl(''); 
      setIsLoading(false);
    };
        
    img.src = proxiedUrl;

    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [originalUrl]);

  return { imageUrl, isLoading, error };
};