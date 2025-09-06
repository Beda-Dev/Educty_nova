"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  Building2,
  Loader2,
  X,
  Check,
  ImagePlus,
  Trash2,
  Upload,
  ChevronDown,
  Search,
  MapPin,
  Clock,
} from "lucide-react";
import { useSchoolStore } from "@/store";
import { toast } from "sonner";
import { motion, Variants } from "framer-motion";
import { useRef } from "react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetchSetting, fetchUsers } from "@/store/schoolservice";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

export interface Setting {
  registration_number_format?: string;
  establishment_phone_1?: string;
  establishment_phone_2?: string | null;
  establishment_logo?: string | null;
  establishment_name?: string;
  approval_number?: string | null;
  status?: string;
  address?: string;
  email?: string | null;
  longitude?: string | number | null;
  latitude?: string | number | null;
  expense_approval_level?: number;
  primary_validator?: string | null;
  currency?: string | null;
  login_time?: string | null;
  session_closure_time?: string | null;
  login_session_duration?: number | null;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Composant MapSelector inline pour éviter les imports externes
import { useRef as useReactRef } from "react"; // Ajout import useRef

const MapSelector = ({
  latitude,
  longitude,
  onLocationChange,
}: {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}) => {
  const mapRef = useReactRef<any>(null); // Référence pour l'instance de carte

  useEffect(() => {
    let isMounted = true;
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        const iconUrl =
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
        const shadowUrl =
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
        const markerIcon = new L.Icon({
          iconUrl,
          shadowUrl,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        // Nettoyage de la carte existante si elle existe
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        // Créer la nouvelle carte
        const map = L.map("map").setView(
          [latitude || 3.848, longitude || 11.502],
          13
        );
        mapRef.current = map; // Stocker la référence

        // Ajouter les tuiles OpenStreetMap
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        let marker: any = null;

        // Ajouter un marqueur s'il y a des coordonnées
        if (latitude && longitude) {
          marker = L.marker([latitude, longitude], { icon: markerIcon }).addTo(map);
        }

        // Écouter les clics sur la carte
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          if (marker) {
            map.removeLayer(marker);
          }
          marker = L.marker([lat, lng]).addTo(map);
          if (isMounted) {
            onLocationChange(lat, lng);
          }
        });
      });
    }
    // Cleanup lors du démontage du composant
    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, onLocationChange]);

  return <div id="map" className="h-64 w-full rounded-md border" />;
};

export default function SettingsPage() {
  const { settings, setSettings, users, setUsers } = useSchoolStore();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  // Pour UserSelect local
  const [userSelectOpen, setUserSelectOpen] = useState(false);
  const [userSelectLoading, setUserSelectLoading] = useState(false);
  const [userSelectSearch, setUserSelectSearch] = useState("");
  const [selectedValidator, setSelectedValidator] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<Setting>({
    defaultValues: {
      registration_number_format: "REG-{YYYY}-{####}",
      establishment_name: "",
      establishment_phone_1: "",
      establishment_phone_2: "",
      email: "",
      address: "",
      approval_number: "",
      status: "public",
      expense_approval_level: 1,
      primary_validator: "",
      currency: "FCFA",
      longitude: null,
      latitude: null,
      login_time: null,
      session_closure_time: null,
      login_session_duration: null,
    },
  });

  useEffect(() => {
    // Charger les paramètres existants
    const fetchSettings = async () => {
      const fetchedSettings = await fetchSetting();
      setSettings(fetchedSettings);
      // Après avoir mis à jour le store, on fait le reset ici pour éviter la boucle
      if (fetchedSettings && fetchedSettings.length > 0) {
        const currentSetting = fetchedSettings[0];
        reset(currentSetting);
        if (currentSetting.establishment_logo) {
          setPreviewUrl(
            `${process.env.NEXT_PUBLIC_API_BASE_URL_2}/${currentSetting.establishment_logo}`
          );
        }
      }
    };
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset, setSettings]);

  // Synchroniser la sélection avec la valeur du formulaire
  useEffect(() => {
    const primaryValidator = watch("primary_validator");
    if (primaryValidator && users.length > 0) {
      const user =
        users.find((u) => u.id === Number(primaryValidator)) ||
        users.find((u) => u.name === primaryValidator);
      setSelectedValidator(user || null);
    } else if (!primaryValidator) {
      setSelectedValidator(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("primary_validator"), users]);

  // Charger les utilisateurs si besoin
  useEffect(() => {
    if (userSelectOpen && users.length === 0 && !userSelectLoading) {
      setUserSelectLoading(true);
      fetchUsers()
        .then((data) => setUsers(data))
        .finally(() => setUserSelectLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSelectOpen]);

  const onSubmit = async (data: Setting) => {
    setIsLoading(true);
    setUploadProgress(0);

    try {
      const isUpdate = settings.length > 0;
      const method = "POST";
      const url = isUpdate
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/setting/${settings[0].id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/setting`;

      // Toujours utiliser FormData
      const formData = new FormData();

      // Ajouter la photo seulement si elle a été modifiée
      if (file) {
        formData.append("establishment_logo", file);
      }

      // Ajouter tous les autres champs
      Object.keys(data).forEach((key) => {
        if (
          key !== "establishment_logo" &&
          data[key as keyof Setting] !== undefined &&
          data[key as keyof Setting] !== null
        ) {
          if (
            key === "primary_validator" &&
            data.expense_approval_level === 0
          ) {
            formData.append(key, "");
          } else {
            formData.append(key, String(data[key as keyof Setting]));
          }
        }
      });

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      const result = await response.json();
      setSettings([result]);

      toast.success("Paramètres sauvegardés avec succès", {
        position: "top-right",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Erreur lors de la sauvegarde des paramètres", {
        position: "top-right",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Vérification du type de fichier
    if (!selectedFile.type.match(/image\/(jpeg|jpg|png|webp|svg\+xml)/)) {
      toast.error(
        "Format non supporté (seuls JPEG, JPG, PNG, WEBP, SVG sont autorisés)"
      );
      return;
    }

    // Vérification de la taille (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("Le fichier est trop volumineux (max 10MB)");
      return;
    }

    setFile(selectedFile);
    setIsImageLoading(true);

    // Création de l'URL de prévisualisation
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
      setIsImageLoading(false);
    };
    reader.onerror = () => {
      toast.error("Erreur lors de la lecture du fichier");
      setIsImageLoading(false);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveLogo = () => {
    setFile(null);
    setPreviewUrl(null);
    setValue("establishment_logo", null, { shouldDirty: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setValue("latitude", lat, { shouldDirty: true });
    setValue("longitude", lng, { shouldDirty: true });
  };

  // Filtrage local des utilisateurs
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(userSelectSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSelectSearch.toLowerCase())
  );

  return (
    <motion.div
      className=""
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">
                Paramètres de l'établissement
              </CardTitle>
              <CardDescription>
                Configurez les informations de votre établissement scolaire
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="pt-6 space-y-6">
            {/* Informations générales */}
            <motion.div variants={itemVariants}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                  <CardDescription>
                    Informations de base de l'établissement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="establishment_name">
                        Nom de l'établissement *
                      </Label>
                      <Input
                        id="establishment_name"
                        {...register("establishment_name", {
                          required: "Le nom est requis",
                        })}
                        placeholder="École Primaire Exemple"
                        className="focus-visible:ring-2 focus-visible:ring-primary/50"
                      />
                      {errors.establishment_name && (
                        <p className="text-sm text-destructive">
                          {errors.establishment_name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="approval_number">
                        Numéro d'approbation
                      </Label>
                      <Input
                        id="approval_number"
                        {...register("approval_number")}
                        placeholder="APP-2024-001"
                        className="focus-visible:ring-2 focus-visible:ring-primary/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Statut de l'établissement</Label>
                      <Select
                        onValueChange={(value) =>
                          setValue("status", value, { shouldDirty: true })
                        }
                        defaultValue={watch("status")}
                      >
                        <SelectTrigger className="focus-visible:ring-2 focus-visible:ring-primary/50">
                          <SelectValue placeholder="Sélectionner le statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="privé">Privé</SelectItem>
                          <SelectItem value="semi-privé">Semi-privé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registration_number_format">
                        Format numéro d'inscription
                      </Label>
                      <Input
                        id="registration_number_format"
                        {...register("registration_number_format")}
                        placeholder="REG-{YYYY}-{####}"
                        className="focus-visible:ring-2 focus-visible:ring-primary/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Textarea
                      id="address"
                      {...register("address")}
                      placeholder="Adresse complète de l'établissement"
                      className="min-h-[80px] focus-visible:ring-2 focus-visible:ring-primary/50"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact */}
            <motion.div variants={itemVariants}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Informations de contact</CardTitle>
                  <CardDescription>
                    Coordonnées de l'établissement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="establishment_phone_1">
                        Téléphone principal *
                      </Label>
                      <Input
                        id="establishment_phone_1"
                        {...register("establishment_phone_1", {
                          required: "Le téléphone est requis",
                        })}
                        placeholder="+237 6XX XXX XXX"
                        className="focus-visible:ring-2 focus-visible:ring-primary/50"
                      />
                      {errors.establishment_phone_1 && (
                        <p className="text-sm text-destructive">
                          {errors.establishment_phone_1.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="establishment_phone_2">
                        Téléphone secondaire
                      </Label>
                      <Input
                        id="establishment_phone_2"
                        {...register("establishment_phone_2")}
                        placeholder="+237 6XX XXX XXX"
                        className="focus-visible:ring-2 focus-visible:ring-primary/50"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="contact@etablissement.com"
                        className="focus-visible:ring-2 focus-visible:ring-primary/50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Logo */}
            <motion.div variants={itemVariants}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Logo de l'établissement</CardTitle>
                  <CardDescription>
                    Téléchargez le logo de votre établissement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                      <div className="relative w-full sm:w-64 h-64 rounded-md overflow-hidden border border-dashed border-gray-300 flex items-center justify-center bg-muted/50">
                        {isImageLoading ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Chargement...
                            </p>
                          </div>
                        ) : previewUrl ? (
                          <>
                            <img
                              src={previewUrl || "/placeholder.svg"}
                              alt="Logo de l'établissement"
                              className="object-contain p-2 w-full h-full"
                            />
                            <div className="absolute top-2 right-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      color="destructive"
                                      size="sm"
                                      className="p-1 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                                      onClick={handleRemoveLogo}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Supprimer l'image</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </>
                        ) : (
                          <div className="text-muted-foreground flex flex-col items-center p-4">
                            <ImagePlus className="h-8 w-8 mb-2" />
                            <span className="text-xs text-center">
                              Aucun logo sélectionné
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 w-full space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            asChild
                            variant="outline"
                            className="cursor-pointer bg-transparent"
                          >
                            <Label
                              htmlFor="logo-upload"
                              className="cursor-pointer flex items-center gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              {previewUrl
                                ? "Changer l'image"
                                : "Télécharger une image"}
                            </Label>
                          </Button>
                          <Input
                            id="logo-upload"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="hidden"
                          />
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <p>
                            Formats supportés: JPG, PNG, WEBP, SVG (max 10MB)
                          </p>
                          <p>Dimensions recommandées: 512x512 pixels</p>
                          <p>
                            Arrière-plan transparent recommandé pour les logos
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Coordonnées GPS avec carte */}
            <motion.div variants={itemVariants}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Coordonnées GPS
                  </CardTitle>
                  <CardDescription>
                    Cliquez sur la carte pour sélectionner l'emplacement de
                    l'établissement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="0.000001"
                        {...register("latitude")}
                        placeholder="Ex: 4.051056"
                        className="focus-visible:ring-2 focus-visible:ring-primary/50"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="0.000001"
                        {...register("longitude")}
                        placeholder="Ex: 9.767869"
                        className="focus-visible:ring-2 focus-visible:ring-primary/50"
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Carte interactive */}
                  <div className="space-y-2">
                    <Label>Sélectionner sur la carte</Label>
                    <MapSelector
                      latitude={
                        watch("latitude") ? Number(watch("latitude")) : null
                      }
                      longitude={
                        watch("longitude") ? Number(watch("longitude")) : null
                      }
                      onLocationChange={handleLocationChange}
                    />
                    <p className="text-sm text-muted-foreground">
                      Cliquez sur la carte pour définir l'emplacement de votre
                      établissement
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sessions de caisse */}
            <motion.div variants={itemVariants}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Configuration des sessions de caisse
                  </CardTitle>
                  <CardDescription>
                    Paramètres de gestion des sessions de caisse
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="login_time">
                        Heure d'ouverture de session
                      </Label>
                      <Input
                        id="login_time"
                        type="time"
                        {...register("login_time")}
                        className="focus-visible:ring-2 focus-visible:ring-primary/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="session_closure_time">
                        Heure de fermeture de session
                      </Label>
                      <Input
                        id="session_closure_time"
                        type="time"
                        {...register("session_closure_time")}
                        className="focus-visible:ring-2 focus-visible:ring-primary/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login_session_duration">
                        Durée d'inactivité (minutes)
                      </Label>
                      <Input
                        id="login_session_duration"
                        type="number"
                        min="1"
                        {...register("login_session_duration")}
                        placeholder="Ex: 30"
                        className="focus-visible:ring-2 focus-visible:ring-primary/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Durée en minutes après laquelle une session inactive
                        sera fermée automatiquement
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Paramètres financiers */}
            <motion.div variants={itemVariants}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Paramètres financiers</CardTitle>
                  <CardDescription>
                    Configuration des validations et devise
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="expense_approval_level">
                        Niveau de validation des dépenses
                      </Label>
                      <Select
                        onValueChange={(value) => {
                          const numValue = Number(value);
                          setValue("expense_approval_level", numValue, {
                            shouldDirty: true,
                          });
                          if (numValue === 0) {
                            setSelectedValidator(null);
                            setValue("primary_validator", "", {
                              shouldDirty: true,
                            });
                          }
                        }}
                        value={String(watch("expense_approval_level") || "")}
                      >
                        <SelectTrigger className="focus-visible:ring-2 focus-visible:ring-primary/50">
                          <SelectValue placeholder="Sélectionner le niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">
                            Niveau 0 - Aucune validation requise
                          </SelectItem>
                          <SelectItem value="1">
                            Niveau 1 - Validation simple
                          </SelectItem>
                          <SelectItem value="2">
                            Niveau 2 - Double validation
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Devise</Label>
                      <Select
                        onValueChange={(value) =>
                          setValue("currency", value, {
                            shouldDirty: true,
                          })
                        }
                        value={watch("currency") || ""}
                      >
                        <SelectTrigger className="focus-visible:ring-2 focus-visible:ring-primary/50">
                          <SelectValue placeholder="Sélectionner la devise" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          <SelectItem value="FCFA">
                            Franc CFA (FCFA) - Afrique Centrale/Ouest
                          </SelectItem>
                          <SelectItem value="NGN">
                            Naira (NGN) - Nigeria
                          </SelectItem>
                          <SelectItem value="ZAR">
                            Rand (ZAR) - Afrique du Sud
                          </SelectItem>
                          <SelectItem value="GHS">
                            Cedi (GHS) - Ghana
                          </SelectItem>
                          <SelectItem value="KES">
                            Shilling kenyan (KES) - Kenya
                          </SelectItem>
                          <SelectItem value="UGX">
                            Shilling ougandais (UGX) - Ouganda
                          </SelectItem>
                          <SelectItem value="TZS">
                            Shilling tanzanien (TZS) - Tanzanie
                          </SelectItem>
                          <SelectItem value="ETB">
                            Birr (ETB) - Éthiopie
                          </SelectItem>
                          <SelectItem value="MAD">
                            Dirham marocain (MAD) - Maroc
                          </SelectItem>
                          <SelectItem value="TND">
                            Dinar tunisien (TND) - Tunisie
                          </SelectItem>
                          <SelectItem value="EGP">
                            Livre égyptienne (EGP) - Égypte
                          </SelectItem>
                          <SelectItem value="DZD">
                            Dinar algérien (DZD) - Algérie
                          </SelectItem>
                          <SelectItem value="AOA">
                            Kwanza (AOA) - Angola
                          </SelectItem>
                          <SelectItem value="BWP">
                            Pula (BWP) - Botswana
                          </SelectItem>
                          <SelectItem value="BIF">
                            Franc burundais (BIF) - Burundi
                          </SelectItem>
                          <SelectItem value="CVE">
                            Escudo (CVE) - Cap-Vert
                          </SelectItem>
                          <SelectItem value="KMF">
                            Franc comorien (KMF) - Comores
                          </SelectItem>
                          <SelectItem value="CDF">
                            Franc congolais (CDF) - RD Congo
                          </SelectItem>
                          <SelectItem value="DJF">
                            Franc djiboutien (DJF) - Djibouti
                          </SelectItem>
                          <SelectItem value="ERN">
                            Nakfa (ERN) - Érythrée
                          </SelectItem>
                          <SelectItem value="SZL">
                            Lilangeni (SZL) - Eswatini
                          </SelectItem>
                          <SelectItem value="GMD">
                            Dalasi (GMD) - Gambie
                          </SelectItem>
                          <SelectItem value="GNF">
                            Franc guinéen (GNF) - Guinée
                          </SelectItem>
                          <SelectItem value="GWP">
                            Peso bissau-guinéen (GWP) - Guinée-Bissau
                          </SelectItem>
                          <SelectItem value="LRD">
                            Dollar libérien (LRD) - Liberia
                          </SelectItem>
                          <SelectItem value="LYD">
                            Dinar libyen (LYD) - Libye
                          </SelectItem>
                          <SelectItem value="MGA">
                            Ariary (MGA) - Madagascar
                          </SelectItem>
                          <SelectItem value="MWK">
                            Kwacha malawien (MWK) - Malawi
                          </SelectItem>
                          <SelectItem value="MRU">
                            Ouguiya (MRU) - Mauritanie
                          </SelectItem>
                          <SelectItem value="MUR">
                            Roupie mauricienne (MUR) - Maurice
                          </SelectItem>
                          <SelectItem value="MZN">
                            Metical (MZN) - Mozambique
                          </SelectItem>
                          <SelectItem value="NAD">
                            Dollar namibien (NAD) - Namibie
                          </SelectItem>
                          <SelectItem value="RWF">
                            Franc rwandais (RWF) - Rwanda
                          </SelectItem>
                          <SelectItem value="STN">
                            Dobra (STN) - Sao Tomé-et-Principe
                          </SelectItem>
                          <SelectItem value="SCR">
                            Roupie seychelloise (SCR) - Seychelles
                          </SelectItem>
                          <SelectItem value="SLL">
                            Leone (SLL) - Sierra Leone
                          </SelectItem>
                          <SelectItem value="SOS">
                            Shilling somalien (SOS) - Somalie
                          </SelectItem>
                          <SelectItem value="SSP">
                            Livre sud-soudanaise (SSP) - Soudan du Sud
                          </SelectItem>
                          <SelectItem value="SDG">
                            Livre soudanaise (SDG) - Soudan
                          </SelectItem>
                          <SelectItem value="ZMW">
                            Kwacha zambien (ZMW) - Zambie
                          </SelectItem>
                          <SelectItem value="ZWL">
                            Dollar zimbabwéen (ZWL) - Zimbabwe
                          </SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                          <SelectItem value="USD">Dollar US (USD)</SelectItem>
                          <SelectItem value="GBP">
                            Livre sterling (GBP)
                          </SelectItem>
                          <SelectItem value="CHF">
                            Franc suisse (CHF)
                          </SelectItem>
                          <SelectItem value="CAD">
                            Dollar canadien (CAD)
                          </SelectItem>
                          <SelectItem value="AUD">
                            Dollar australien (AUD)
                          </SelectItem>
                          <SelectItem value="JPY">
                            Yen japonais (JPY)
                          </SelectItem>
                          <SelectItem value="CNY">
                            Yuan chinois (CNY)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="primary_validator">
                        Validateur principal
                      </Label>
                      <div className="relative">
                        <div>
                          <div
                            className={cn(
                              "w-full flex items-center justify-between border rounded-md px-3 py-2 bg-background cursor-pointer min-h-[40px] transition-colors",
                              userSelectOpen && "ring-2 ring-primary/50",
                              watch("expense_approval_level") === 0 &&
                                "opacity-50 cursor-not-allowed bg-muted"
                            )}
                            tabIndex={
                              watch("expense_approval_level") === 0 ? -1 : 0
                            }
                            onClick={() => {
                              if (watch("expense_approval_level") !== 0) {
                                setUserSelectOpen((v) => !v);
                              }
                            }}
                            onBlur={() => setUserSelectOpen(false)}
                          >
                            <div className="flex items-center gap-2 flex-1 overflow-hidden">
                              {selectedValidator &&
                              watch("expense_approval_level") !== 0 ? (
                                <>
                                  <span className="font-medium truncate max-w-[180px]">
                                    {selectedValidator.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                                    {selectedValidator.email}
                                  </span>
                                </>
                              ) : (
                                <span className="text-muted-foreground truncate">
                                  {watch("expense_approval_level") === 0
                                    ? "Désactivé (Niveau 0 sélectionné)"
                                    : "Sélectionner un validateur principal"}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              {selectedValidator &&
                                watch("expense_approval_level") !== 0 && (
                                  <X
                                    className="h-4 w-4 opacity-70 hover:opacity-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedValidator(null);
                                      setValue("primary_validator", "", {
                                        shouldDirty: true,
                                      });
                                    }}
                                  />
                                )}
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 shrink-0 opacity-50 transition-transform",
                                  userSelectOpen && "rotate-180"
                                )}
                              />
                            </div>
                          </div>
                          {userSelectOpen &&
                            watch("expense_approval_level") !== 0 && (
                              <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg max-h-72 overflow-auto">
                                <div className="flex items-center border-b px-3 py-2 bg-accent/50">
                                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-70" />
                                  <input
                                    type="text"
                                    placeholder="Rechercher un utilisateur..."
                                    value={userSelectSearch}
                                    onChange={(e) =>
                                      setUserSelectSearch(e.target.value)
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    className="border-0 focus:ring-0 h-auto py-1 text-sm bg-transparent outline-none flex-1"
                                  />
                                </div>
                                <div className="max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                                  {userSelectLoading ? (
                                    <div className="space-y-2 p-2">
                                      {[...Array(5)].map((_, i) => (
                                        <div
                                          key={i}
                                          className="flex items-center space-x-3 p-2"
                                        >
                                          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                                          <div className="space-y-1 flex-1">
                                            <div className="h-4 w-[120px] bg-muted animate-pulse rounded" />
                                            <div className="h-3 w-[80px] bg-muted animate-pulse rounded" />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <>
                                      {filteredUsers.length === 0 ? (
                                        <div className="py-6 text-sm text-center text-muted-foreground">
                                          <div className="flex flex-col items-center gap-2">
                                            <Search className="h-8 w-8 opacity-30" />
                                            <span>
                                              Aucun utilisateur trouvé
                                            </span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="py-1">
                                          {filteredUsers.map((user) => (
                                            <div
                                              key={user.id}
                                              className={cn(
                                                "flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/50 transition-colors",
                                                selectedValidator?.id ===
                                                  user.id && "bg-accent/70"
                                              )}
                                              onMouseDown={(e) => {
                                                e.preventDefault();
                                                setSelectedValidator(user);
                                                setValue(
                                                  "primary_validator",
                                                  user.name,
                                                  { shouldDirty: true }
                                                );
                                                setUserSelectOpen(false);
                                                setUserSelectSearch("");
                                              }}
                                            >
                                              <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">
                                                  {user.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                  {user.email}
                                                </div>
                                              </div>
                                              {selectedValidator?.id ===
                                                user.id && (
                                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </CardContent>

          <CardFooter className="flex justify-between gap-4 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={!isDirty || isLoading}
              color="destructive"
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <div className="flex items-center gap-4">
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="flex items-center gap-2">
                  <Progress value={uploadProgress} className="w-32 h-2" />
                  <span className="text-sm text-muted-foreground">
                    {uploadProgress}%
                  </span>
                </div>
              )}
              <Button
                color="indigodye"
                type="submit"
                disabled={isLoading}
                className="transition-all hover:shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
