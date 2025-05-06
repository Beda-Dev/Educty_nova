"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface FileWithPreview extends File {
  preview: string;
}

interface ImageUploaderProps {
  initialImage?: string; // L'image de base à afficher
  onImageChange: (file: File) => void; // Callback pour envoyer l'image au parent
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ initialImage, onImageChange }) => {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [file, setFile] = useState<File | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
    onDrop: (acceptedFiles) => {
      const newFile = acceptedFiles[0];
      if (newFile) {
        const previewURL = URL.createObjectURL(newFile);
        setImage(previewURL);
        setFile(newFile)

        // Envoi de l'image au parent
        onImageChange(newFile);
      }
    },
  });

  // Effet pour afficher l’image initiale s’il y en a une
  useEffect(() => {
    if (initialImage) {
      setImage(initialImage);
    }
  }, [initialImage]);

  const removeImage = () => {
    setImage(null);
    setFile(null);
  };

  return (
    <div className={image ? "h-[300px] w-full col-span-2" : "col-span-2"}>
      {image ? (
        <div className="w-full h-full relative">
          <Button
            type="button"
            className="absolute top-4 right-4 h-12 w-12 rounded-full bg-default-900 hover:bg-background hover:text-default-900 z-20"
            onClick={removeImage}
          >
            <span className="text-xl">
              <Icon icon="fa6-solid:xmark" />
            </span>
          </Button>
          <Image
            alt="Uploaded image"
            width={100}
            height={100}
            className="w-full h-full object-cover rounded-md"
            src={image}
          />
        </div>
      ) : (
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />

          <div className="w-full text-center border-dashed border rounded-md py-[52px] flex items-center flex-col">
            <div className="h-12 w-12 inline-flex rounded-md bg-muted items-center justify-center mb-3">
              <Upload className="text-default-500" />
            </div>
            <h4 className="text-2xl font-medium mb-1 text-card-foreground/80">
              Déposez l'image ici ou cliquez selectionner l'image de l'eleve.
            </h4>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
