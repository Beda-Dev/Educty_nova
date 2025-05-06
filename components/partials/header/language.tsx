"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { useThemeStore } from "@/store";

// Liste des langues mises à jour
const languages = [
  { name: "en", flag: require("@/public/images/all-img/flag-1.png") },
  { name: "fr", flag: require("@/public/images/all-img/flag-4.png") },
];

// Dictionnaire des labels affichés
const languageLabels: Record<string, string> = {
  en: "English",
  fr: "Français",
};

const Language = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isRtl, setRtl } = useThemeStore();

  // Trouver la langue actuelle basée sur l'URL
  const found = pathname ? languages.find((lang) => pathname.includes(`/${lang.name}/`)) : null;
  const [selectedLanguage, setSelectedLanguage] = useState(found ?? languages[0]);

  const handleSelected = (lang: string) => {
    const newLang = languages.find((l) => l.name === lang);
    if (!newLang) return;

    setSelectedLanguage(newLang);
    setRtl(lang === "ar");

    // Générer une nouvelle URL en conservant le reste du pathname
    const pathSegments = pathname ? pathname.split("/") : [];
    pathSegments[1] = lang; // Remplace le segment de la langue
    const newPath = pathSegments.filter(Boolean).join("/") || "/";
    router.push(`/${newPath}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" className="bg-transparent hover:bg-transparent flex items-center">
          <span className="w-6 h-6 rounded-full me-1.5">
            <Image
              src={selectedLanguage.flag}
              alt={selectedLanguage.name}
              className="w-full h-full object-cover rounded-full"
            />
          </span>
          <span className="text-sm text-default-600 capitalize">
            {languageLabels[selectedLanguage.name]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2">
        {languages.map((item) => (
          <DropdownMenuItem
            key={item.name}
            className={cn(
              "py-1.5 px-2 cursor-pointer dark:hover:bg-background mb-[2px] last:mb-0",
              selectedLanguage.name === item.name && "bg-primary-100"
            )}
            onClick={() => handleSelected(item.name)}
          >
            <span className="w-6 h-6 rounded-full me-1.5">
              <Image
                src={item.flag}
                alt={item.name}
                className="w-full h-full object-cover rounded-full"
              />
            </span>
            <span className="text-sm text-default-600 capitalize">
              {languageLabels[item.name]}
            </span>
            {selectedLanguage.name === item.name && (
              <Check className="w-4 h-4 flex-none ltr:ml-auto rtl:mr-auto text-default-700" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Language;
