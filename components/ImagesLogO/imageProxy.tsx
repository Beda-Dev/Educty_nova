
import { useProxiedImage } from "../../hooks/useProxiedImage";


interface ProxiedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackComponent?: React.ReactNode;
}

export const ProxiedImage: React.FC<ProxiedImageProps> = ({ 
  src, 
  alt, 
  fallbackComponent,
  className,
  style,
  ...props 
}) => {
  const { imageUrl, isLoading, error } = useProxiedImage(src);

  if (isLoading) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse flex items-center justify-center ${className || ''}`}
        style={style}
      >
        <span className="text-gray-400 text-xs">Chargement...</span>
      </div>
    );
  }

  if (error || !imageUrl) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className || ''}`}
        style={style}
      >
        <span className="text-gray-400 text-xs">Logo</span>
      </div>
    );
  }

  return (
    <img
      {...props}
      src={imageUrl}
      alt={alt}
      className={className}
      style={style}
      crossOrigin="anonymous"
    />
  );
};