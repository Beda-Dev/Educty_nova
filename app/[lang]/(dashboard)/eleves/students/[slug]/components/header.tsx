"use client";

import { Card, CardContent } from "@/components/ui/card";
import coverImage from "@/public/images/all-img/user-cover.png";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import User from "@/public/images/avatar/user.png"; // Image par défaut
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Fragment, useState, useRef } from "react";
import { Student, StudentPhoto } from '@/lib/interface';

interface HeaderProps {
  eleve: Student;
}

const Header = ({ eleve }: HeaderProps) => {
  const location = usePathname();
  const formatPhoto = (photo: StudentPhoto | undefined): string | null => {
    if (!photo) return null;
    if (typeof photo === 'string') return photo;
    if ('file' in photo && photo.file) {
      return URL.createObjectURL(photo.file);
    }
    if ('stored' in photo && photo.stored) {
      // Handle the case where the photo is stored in IndexedDB
      // You'll need to implement a function to retrieve it from IndexedDB
      return null; // or a loading state
    }
    return null;
  };
  const [photo, setPhoto] = useState<string | null>(() => {
    return formatPhoto(eleve.photo);
  });



  const fileInputRef = useRef<HTMLInputElement>(null); // Référence pour le champ de fichier

  // Gestion des erreurs pour les images invalides
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = User.src; // Remplace par l'image par défaut
  };

  // Gestion du téléchargement de la photo
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhoto(e.target.result as string); // Met à jour l'état avec la nouvelle photo
          uploadPhotoToServer(file); // Envoie la photo au serveur
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Envoie la photo au serveur
  const uploadPhotoToServer = async (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await fetch(`/api/eleves/${eleve.id}/upload-photo`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Échec du téléchargement de la photo");
      }

      const data = await response.json();
      console.log("Photo téléchargée avec succès :", data);
    } catch (error) {
      console.error("Erreur lors du téléchargement de la photo :", error);
    }
  };

  return (

    <Card className="mt-6 rounded-t-2xl">
      <CardContent className="p-0">
        <div
          className="relative h-[200px] lg:h-[296px] rounded-t-2xl w-full object-cover bg-no-repeat"
          style={{ backgroundImage: `url(${coverImage.src})` }}
        >
          <div className="flex items-center gap-4 absolute ltr:left-10 rtl:right-10 -bottom-2 lg:-bottom-8">
            <div>
              {/* Afficher la photo de l'étudiant ou une image par défaut */}
              <Image
                src={photo || User.src} // Utilise la photo de l'étudiant ou l'image par défaut
                alt={`${eleve.name} ${eleve.first_name}`}
                className="h-20 w-20 lg:w-32 lg:h-32 rounded-full"
                width={128}
                height={128}
                onError={handleImageError} // Gestion des erreurs d'image
              />
            </div>
            <div>
              {/* Afficher le nom et le prénom de l'étudiant */}
              <div className="text-xl lg:text-2xl font-semibold text-skyblue-foreground mb-1">
                {eleve.name} {eleve.first_name}
              </div>
              {/* Afficher le statut de l'étudiant */}
              <div className="text-xs lg:text-sm font-medium text-default-100 dark:text-default-900 pb-1.5">
                {eleve.assignment_type.label}
              </div>
            </div>
          </div>
          {/* Bouton pour modifier la photo */}
          <Button
            className="absolute bottom-5 ltr:right-6 rtl:left-6 rounded px-5 hidden lg:flex"
            size="sm"
            onClick={() => fileInputRef.current?.click()} // Déclenche le champ de fichier
          >
            <Icon
              className="w-4 h-4 ltr:mr-1 rtl:ml-1"
              icon="heroicons:pencil-square"
            />
            Modifier la photo
          </Button>
          {/* Champ de fichier caché */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>
        {/* <div className="flex flex-wrap justify-end gap-4 lg:gap-8 pt-7 lg:pt-5 pb-4 px-6">
            {[
              {
                title: "Overview",
                link: "/user-profile",
              },
              {
                title: "Documents",
                link: "/user-profile/documents",
              },
              {
                title: "Activity",
                link: "/user-profile/activity",
              },
              {
                title: "Settings",
                link: "/user-profile/settings",
              },
            ].map((item, index) => (
              <Link
                key={`user-profile-link-${index}`}
                href={item.link}
                className={cn(
                  "text-sm font-semibold text-default-500 hover:text-skyblue relative lg:before:absolute before:-bottom-4 before:left-0 before:w-full lg:before:h-[1px] before:bg-transparent",
                  {
                    "text-skyblue lg:before:bg-primary":
                      location === item.link,
                  }
                )}
              >
                {item.title}
              </Link>
            ))}
          </div> */}
      </CardContent>
    </Card>
  );
};

export default Header;