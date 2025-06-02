"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface ImageUploaderProps {
  initialImage?: string;
  onImageChange: (file: File) => void;
  maxSizeMB?: number;
}

const MAX_FILE_SIZE_MB = 2; // 2MB par défaut

export  function ImageUploader({ 
  initialImage, 
  onImageChange, 
  maxSizeMB = MAX_FILE_SIZE_MB 
}: ImageUploaderProps) {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: { "image/*": [] },
    maxSize: maxSizeMB * 1024 * 1024, // Convertir en bytes
    onDrop: (acceptedFiles, fileRejections) => {
      setIsDragActive(false);
      
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors[0].code === "file-too-large") {
          toast({
            title: "Fichier trop volumineux",
            description: `La taille maximale autorisée est ${maxSizeMB}MB`,
            color: "destructive",
          });
        }
        return;
      }

      const newFile = acceptedFiles[0];
      if (newFile) {
        // Simuler une progression d'upload
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 10;
          });
        }, 100);

        const previewURL = URL.createObjectURL(newFile);
        setImage(previewURL);
        setFile(newFile);
        onImageChange(newFile);

        setTimeout(() => setUploadProgress(0), 1500);
      }
    },
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  useEffect(() => {
    if (initialImage) {
      setImage(initialImage);
    }
  }, [initialImage]);

  const removeImage = () => {
    if (image) {
      URL.revokeObjectURL(image);
    }
    setImage(null);
    setFile(null);
  };

  return (
    <div className="space-y-4 w-full">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/30",
          image ? "h-auto" : "h-64 flex items-center justify-center"
        )}
      >
        <input {...getInputProps()} />
        
        {image ? (
          <div className="relative w-full h-full">
            <div className="relative aspect-square mx-auto max-w-md">
              <Image
                alt="Photo de l'élève"
                src={image}
                width={400}
                height={400}
                className="rounded-md object-cover w-full h-full"
                priority
              />
              <Button
                type="button"
                color="destructive"
                size="sm"
                className="absolute -top-3 -right-3 rounded-full p-2 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-muted">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-sm">
                Glissez-déposez votre image ici, ou cliquez pour sélectionner
              </h4>
              <p className="text-xs text-muted-foreground">
                Formats supportés: JPG, PNG (max. {maxSizeMB}MB)
              </p>
            </div>
            <Button variant="outline" size="sm" type="button">
              Sélectionner une image
            </Button>
          </div>
        )}
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Téléversement en cours...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {file && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md text-sm">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium truncate max-w-xs">{file.name}</span>
            <span className="text-muted-foreground text-xs">
              {(file.size / 1024 / 1024).toFixed(2)}MB
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive h-8 p-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}