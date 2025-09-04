"use client";

import * as React from "react";
import {
  useDropzone,
  type DropzoneOptions,
  type FileRejection,
} from "react-dropzone";
import { X, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: File | null;
  onValueChange?: (file: File | null) => void;
  accept?: DropzoneOptions["accept"];
  maxSize?: number;
  maxFiles?: number;
}

export function FileUploader({
  value,
  onValueChange,
  accept = {
    "image/*": [".jpg", ".jpeg", ".png", ".svg"],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 1,
  className,
  ...props
}: FileUploaderProps) {
  const [file, setFile] = React.useState<File | null>(value ?? null);
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!file) return setPreview(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, [file]);

  const onDrop: DropzoneOptions["onDrop"] = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        const { errors } = rejectedFiles[0];
        const error = errors[0];
        if (error?.code === "file-too-large") {
          toast({
            title: "Fichier trop volumineux",
            description: `La taille maximale autorisée est ${
              maxSize / 1024 / 1024
            }MB`,
            color: "destructive",
          });
        } else if (error?.code === "file-invalid-type") {
          toast({
            title: "Type de fichier non supporté",
            description: "Seuls les formats JPG, PNG et SVG sont acceptés",
            color: "destructive",
          });
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const newFile = acceptedFiles[0];
        setFile(newFile);
        onValueChange?.(newFile);
      }
    },
    [maxSize, onValueChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: maxFiles > 1,
  });

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    onValueChange?.(null);
  };

  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardContent className="p-0">
        {preview ? (
          <div className="relative group flex items-center justify-center" >
            <div className=" bg-red-700 relative h-48 w-48 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src={preview}
                alt="Preview"
                className="object-cover w-48 h-48 rounded-full"
              />
            </div>
            <Button
              type="button"
              size="sm"
              color="destructive"
              className="absolute top-2 right-2 rounded-full p-2 h-8 w-8"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Supprimer l'image</span>
            </Button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              "p-6 cursor-pointer transition-colors",
              isDragActive ? "bg-accent" : "bg-muted/50"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <UploadCloud className="h-10 w-10 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {isDragActive
                    ? "Déposez le fichier ici"
                    : "Glissez-déposez votre fichier ou cliquez pour sélectionner"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Formats supportés: JPG, PNG, SVG (max. {maxSize / 1024 / 1024}
                  MB)
                </p>
              </div>
              {/* <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={(e) => e.stopPropagation()}
              >
                Sélectionner un fichier
              </Button> */}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
