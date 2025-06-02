"use client";

import { useState, useEffect } from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";
import { Upload } from "lucide-react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import Image, { type StaticImageData } from "next/image";
import { toast } from "sonner"; // ou un autre système de notification

interface FileWithPreview extends File {
  preview: string;
}

interface ImageUploaderProps {
  initialImage?: string | StaticImageData;
  onImageChange?: (file: File | null) => void;
  maxFileSize?: number; // Taille max en octets (5MB par défaut)
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  initialImage, 
  onImageChange,
  maxFileSize = 2 * 1024 * 1024 
}) => {
  const [image, setImage] = useState<string | StaticImageData | null>(initialImage || null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dropzoneOptions: DropzoneOptions = {
    multiple: false,
    accept: { "image/*": [] },
    maxSize: maxFileSize,
    onDrop: (acceptedFiles: File[], fileRejections) => {
      setError(null); 
      
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors.some(e => e.code === 'file-too-large')) {
          const errorMsg = `Fichier trop lourd (max ${maxFileSize / (1024 * 1024)}MB)`;
          setError(errorMsg);
          toast.error(errorMsg); 
          return;
        }
      }

      const newFile = acceptedFiles[0];
      if (newFile) {
        const previewURL = URL.createObjectURL(newFile);
        setImage(previewURL);
        setFile(newFile);
        onImageChange?.(newFile);
      }
    },
  };

  const { getRootProps, getInputProps } = useDropzone(dropzoneOptions);

  useEffect(() => {
    return () => {
      if (image && typeof image === 'string' && image.startsWith('blob:')) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  useEffect(() => {
    setImage(initialImage || null);
  }, [initialImage]);

  const removeImage = (): void => {
    if (image && typeof image === 'string' && image.startsWith('blob:')) {
      URL.revokeObjectURL(image);
    }
    setImage(null);
    setFile(null);
    setError(null);
    onImageChange?.(null);
  };

  const getImagePriority = (): boolean | undefined => {
    if (!image) return undefined;
    return typeof image === 'string' 
      ? (image.startsWith('http:') || image.startsWith('https:'))
      : undefined;
  };

  return (
    <div className={image ? "h-[200px] w-full col-span-2" : "col-span-2"}>
      {image ? (
        <div className="w-full h-full relative">
          <Button
            type="button"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-default-900 hover:bg-background hover:text-default-900 z-20"
            onClick={removeImage}
          >
            <span className="text-sm">
              <Icon icon="fa6-solid:xmark" />
            </span>
          </Button>
          <Image
            alt="Uploaded image"
            width={200}
            height={200}
            className="w-full h-full object-cover rounded-md"
            src={image}
            priority={getImagePriority()}
            unoptimized={typeof image === 'string' ? !image.startsWith('http') && !image.startsWith('https') : undefined}
          />
        </div>
      ) : (
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />
          <div className="w-full text-center border-dashed border rounded-md py-[32px] flex items-center flex-col">
            <div className="h-10 w-10 inline-flex rounded-md bg-muted items-center justify-center mb-2">
              <Upload className="text-default-500" size={20} />
            </div>
            <h4 className="text-lg font-medium mb-1 text-card-foreground/80">
              Déposez l'image ici ou cliquez pour sélectionner
            </h4>
            <p className="text-sm text-muted-foreground">
              Formats acceptés: .png, .jpg, .jpeg, .gif (max {maxFileSize / (1024 * 1024)}MB)
            </p>
            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;