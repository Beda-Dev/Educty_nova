"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { MapPin, Save, Building2, Loader2, X, Check, ImagePlus, Trash2, Upload, RotateCw, ZoomIn, ZoomOut } from "lucide-react"
import dynamic from 'next/dynamic';
import UserSelect from "@/components/user-select"
import { useSchoolStore } from "@/store"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { useRef, Suspense } from "react"
import { Progress } from "@/components/ui/progress"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"

// Dynamically import MapSelector with SSR disabled
const MapSelector = dynamic(
    () => import('@/components/map-select/map-selector'),
    {
        ssr: false,
        loading: () => (
            <div className="h-96 w-full rounded-lg border flex items-center justify-center bg-muted">
                <p>Chargement de la carte...</p>
            </div>
        )
    }
)

export interface Setting {
    registration_number_format?: string
    establishment_phone_1?: string
    establishment_phone_2?: string | null
    establishment_logo?: string | null
    establishment_name?: string
    approval_number?: string | null
    status?: string
    address?: string
    email?: string | null
    longitude?: string | number | null
    latitude?: string | number | null
    expense_approval_level?: number
    primary_validator?: string | null
    currency?: string | null
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

export default function SettingsPage() {
    const { settings, setSettings, users } = useSchoolStore()
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [zoomLevel, setZoomLevel] = useState(100)
    const [rotation, setRotation] = useState(0)
    const [isImageLoading, setIsImageLoading] = useState(false)

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
        },
    })

    useEffect(() => {
        if (settings.length > 0) {
            const currentSetting = settings[0]
            reset(currentSetting)
            if (currentSetting.latitude && currentSetting.longitude) {
                setCoordinates({
                    lat: Number(currentSetting.latitude),
                    lng: Number(currentSetting.longitude),
                })
            }
            if (currentSetting.establishment_logo) {
                setPreviewUrl(`${process.env.NEXT_PUBLIC_API_BASE_URL_2}/${currentSetting.establishment_logo}`)
            }
        }
    }, [settings, reset])

    const onSubmit = async (data: Setting) => {
        setIsLoading(true)
        setUploadProgress(0)

        try {
            if (coordinates) {
                data.latitude = coordinates.lat
                data.longitude = coordinates.lng
            }

            // Si un fichier est présent, utiliser FormData
            if (file) {
                const formData = new FormData()
                formData.append("establishment_logo", file)

                // Ajouter les autres données
                Object.keys(data).forEach(key => {
                    if (key !== "establishment_logo" && data[key as keyof Setting] !== undefined) {
                        formData.append(key, String(data[key as keyof Setting]))
                    }
                })

                const xhr = new XMLHttpRequest()
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const progress = Math.round((event.loaded / event.total) * 100)
                        setUploadProgress(progress)
                    }
                }

                const method = settings.length > 0 ? "PUT" : "POST"
                const url = settings.length > 0 ? `/api/setting?id=${settings[0].id}` : "/api/setting"

                const response = await fetch(url, {
                    method,
                    body: formData,
                })

                if (!response.ok) {
                    throw new Error("Erreur lors de la sauvegarde")
                }

                const result = await response.json()
                setSettings([result])
            } else {
                // Si pas de fichier, envoyer en JSON
                const method = settings.length > 0 ? "PUT" : "POST"
                const url = settings.length > 0 ? `/api/setting?id=${settings[0].id}` : "/api/setting"

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                })

                if (!response.ok) {
                    throw new Error("Erreur lors de la sauvegarde")
                }

                const result = await response.json()
                setSettings([result])
            }

            toast.success("Paramètres sauvegardés avec succès", {
                position: "top-right",
                duration: 3000,
            })
        } catch (error) {
            console.error("Error updating settings:", error)
            toast.error("Erreur lors de la sauvegarde des paramètres", {
                position: "top-right",
                duration: 3000,
            })
        } finally {
            setIsLoading(false)
            setUploadProgress(0)
        }
    }

    const handleCoordinatesChange = (lat: number | null, lng: number | null) => {
        if (lat !== null && lng !== null) {
            setCoordinates({ lat, lng })
            setValue("latitude", lat, { shouldDirty: true })
            setValue("longitude", lng, { shouldDirty: true })
        } else {
            setCoordinates(null)
            setValue("latitude", null, { shouldDirty: true })
            setValue("longitude", null, { shouldDirty: true })
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        // Vérification du type de fichier
        if (!selectedFile.type.match(/image\/(jpeg|jpg|png|webp|svg\+xml)/)) {
            toast.error("Format non supporté (seuls JPEG, JPG, PNG, WEBP, SVG sont autorisés)")
            return
        }

        // Vérification de la taille
        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error("Le fichier est trop volumineux (max 5MB)")
            return
        }

        setFile(selectedFile)
        setIsImageLoading(true)

        // Création de l'URL de prévisualisation
        const reader = new FileReader()
        reader.onload = () => {
            setPreviewUrl(reader.result as string)
            setIsImageLoading(false)
        }
        reader.onerror = () => {
            toast.error("Erreur lors de la lecture du fichier")
            setIsImageLoading(false)
        }
        reader.readAsDataURL(selectedFile)
    }

    const handleRemoveLogo = () => {
        setFile(null)
        setPreviewUrl(null)
        setValue("establishment_logo", null, { shouldDirty: true })
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
        setZoomLevel(100)
        setRotation(0)
    }

    const rotateImage = () => {
        setRotation((prev) => (prev + 90) % 360)
    }

    const handleZoomChange = (value: number[]) => {
        setZoomLevel(value[0])
    }

    return (
        <motion.div
            className="container mx-auto py-8 px-4 max-w-4xl"
            initial="hidden"
            animate="show"
            variants={containerVariants}
        >
            <Card className="overflow-hidden">
                <CardHeader className="border-b">
                    <div className="flex items-center gap-3">
                        <Building2 className="h-8 w-8 text-skyblue" />
                        <div>
                            <CardTitle className="text-2xl">Paramètres de l'établissement</CardTitle>
                            <CardDescription>Configurez les informations de votre établissement scolaire</CardDescription>
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
                                    <CardDescription>Informations de base de l'établissement</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="establishment_name">Nom de l'établissement *</Label>
                                            <Input
                                                id="establishment_name"
                                                {...register("establishment_name", { required: "Le nom est requis" })}
                                                placeholder="École Primaire Exemple"
                                                className="focus-visible:ring-2 focus-visible:ring-primary/50"
                                            />
                                            {errors.establishment_name && (
                                                <p className="text-sm text-destructive">{errors.establishment_name.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="approval_number">Numéro d'approbation</Label>
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
                                                onValueChange={(value) => setValue("status", value, { shouldDirty: true })}
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
                                            <Label htmlFor="registration_number_format">Format numéro d'inscription</Label>
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
                                    <CardDescription>Coordonnées de l'établissement</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="establishment_phone_1">Téléphone principal *</Label>
                                            <Input
                                                id="establishment_phone_1"
                                                {...register("establishment_phone_1", { required: "Le téléphone est requis" })}
                                                placeholder="+237 6XX XXX XXX"
                                                className="focus-visible:ring-2 focus-visible:ring-primary/50"
                                            />
                                            {errors.establishment_phone_1 && (
                                                <p className="text-sm text-destructive">{errors.establishment_phone_1.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="establishment_phone_2">Téléphone secondaire</Label>
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
                                    <CardDescription>Téléchargez le logo de votre établissement</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row items-start gap-6">
                                            <div className="relative w-full sm:w-64 h-64 rounded-md overflow-hidden border border-dashed border-gray-300 flex items-center justify-center bg-muted/50">
                                                {isImageLoading ? (
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                                        <p className="text-sm text-muted-foreground">Chargement...</p>
                                                    </div>
                                                ) : previewUrl ? (
                                                    <>
                                                        <div 
                                                            className="relative w-full h-full"
                                                            style={{
                                                                transform: `rotate(${rotation}deg) scale(${zoomLevel / 100})`,
                                                                transition: 'transform 0.3s ease',
                                                            }}
                                                        >
                                                            <Image
                                                                src={previewUrl}
                                                                alt="Logo de l'établissement"
                                                                fill
                                                                className="object-contain p-2"
                                                                sizes="256px"
                                                                style={{
                                                                    objectFit: 'contain',
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="absolute top-2 right-2 flex gap-2">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="p-1 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                                                                            onClick={rotateImage}
                                                                        >
                                                                            <RotateCw className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Tourner de 90°</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
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
                                                        <span className="text-xs text-center">Aucun logo sélectionné</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 w-full space-y-4">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        className="cursor-pointer"
                                                    >
                                                        <Label htmlFor="logo-upload" className="cursor-pointer flex items-center gap-2">
                                                            <Upload className="h-4 w-4" />
                                                            {previewUrl ? "Changer l'image" : "Télécharger une image"}
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
                                                    {previewUrl && (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={rotateImage}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <RotateCw className="h-4 w-4" />
                                                                Tourner
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                {previewUrl && (
                                                    <div className="space-y-2">
                                                        <Label>Zoom: {zoomLevel}%</Label>
                                                        <Slider
                                                            defaultValue={[zoomLevel]}
                                                            min={10}
                                                            max={200}
                                                            step={5}
                                                            onValueChange={handleZoomChange}
                                                        />
                                                        <div className="flex justify-between text-xs text-muted-foreground">
                                                            <span><ZoomOut className="inline h-3 w-3" /> 10%</span>
                                                            <span>100%</span>
                                                            <span>200% <ZoomIn className="inline h-3 w-3" /></span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="text-sm text-muted-foreground">
                                                    <p>Formats supportés: JPG, PNG, WEBP, SVG (max 5MB)</p>
                                                    <p>Dimensions recommandées: 512x512 pixels</p>
                                                    <p>Arrière-plan transparent recommandé pour les logos</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Localisation */}
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Localisation
                                    </CardTitle>
                                    <CardDescription>Sélectionnez l'emplacement de votre établissement sur la carte</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Suspense fallback={<div className="h-96 w-full rounded-lg border flex items-center justify-center bg-muted">
                                        <p>Chargement de la carte...</p>
                                    </div>}>
                                        {/* <MapSelector
                                            initialCoordinates={coordinates}
                                            onCoordinatesChange={handleCoordinatesChange}
                                        /> */}
                                    </Suspense>
                                    {coordinates && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-4 p-4 bg-muted rounded-lg"
                                        >
                                            <p className="text-sm">
                                                <strong>Coordonnées sélectionnées:</strong>
                                                <br />
                                                Latitude: {coordinates.lat.toFixed(6)}
                                                <br />
                                                Longitude: {coordinates.lng.toFixed(6)}
                                            </p>
                                        </motion.div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Paramètres financiers */}
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle>Paramètres financiers</CardTitle>
                                    <CardDescription>Configuration des validations et devise</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="expense_approval_level">Niveau de validation des dépenses</Label>
                                            <Select
                                                onValueChange={(value) => setValue("expense_approval_level", Number(value), { shouldDirty: true })}
                                                defaultValue={String(watch("expense_approval_level"))}
                                            >
                                                <SelectTrigger className="focus-visible:ring-2 focus-visible:ring-primary/50">
                                                    <SelectValue placeholder="Sélectionner le niveau" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0">Niveau 0 - Aucune validation requise</SelectItem>
                                                    <SelectItem value="1">Niveau 1 - Validation simple</SelectItem>
                                                    <SelectItem value="2">Niveau 2 - Double validation</SelectItem>
                                                    <SelectItem value="3">Niveau 3 - Triple validation</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="currency">Devise</Label>
                                            <Select
                                                onValueChange={(value) => setValue("currency", value, { shouldDirty: true })}
                                                defaultValue={watch("currency") ?? "FCFA"}
                                            >
                                                <SelectTrigger className="focus-visible:ring-2 focus-visible:ring-primary/50">
                                                    <SelectValue placeholder="Sélectionner la devise" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60 overflow-y-auto">
                                                    <SelectItem value="FCFA">Franc CFA (FCFA) - Afrique Centrale/Ouest</SelectItem>
                                                    <SelectItem value="NGN">Naira (NGN) - Nigeria</SelectItem>
                                                    <SelectItem value="ZAR">Rand (ZAR) - Afrique du Sud</SelectItem>
                                                    <SelectItem value="GHS">Cedi (GHS) - Ghana</SelectItem>
                                                    <SelectItem value="KES">Shilling kenyan (KES) - Kenya</SelectItem>
                                                    <SelectItem value="UGX">Shilling ougandais (UGX) - Ouganda</SelectItem>
                                                    <SelectItem value="TZS">Shilling tanzanien (TZS) - Tanzanie</SelectItem>
                                                    <SelectItem value="ETB">Birr (ETB) - Éthiopie</SelectItem>
                                                    <SelectItem value="MAD">Dirham marocain (MAD) - Maroc</SelectItem>
                                                    <SelectItem value="TND">Dinar tunisien (TND) - Tunisie</SelectItem>
                                                    <SelectItem value="EGP">Livre égyptienne (EGP) - Égypte</SelectItem>
                                                    <SelectItem value="DZD">Dinar algérien (DZD) - Algérie</SelectItem>
                                                    <SelectItem value="AOA">Kwanza (AOA) - Angola</SelectItem>
                                                    <SelectItem value="BWP">Pula (BWP) - Botswana</SelectItem>
                                                    <SelectItem value="BIF">Franc burundais (BIF) - Burundi</SelectItem>
                                                    <SelectItem value="CVE">Escudo (CVE) - Cap-Vert</SelectItem>
                                                    <SelectItem value="KMF">Franc comorien (KMF) - Comores</SelectItem>
                                                    <SelectItem value="CDF">Franc congolais (CDF) - RD Congo</SelectItem>
                                                    <SelectItem value="DJF">Franc djiboutien (DJF) - Djibouti</SelectItem>
                                                    <SelectItem value="ERN">Nakfa (ERN) - Érythrée</SelectItem>
                                                    <SelectItem value="SZL">Lilangeni (SZL) - Eswatini</SelectItem>
                                                    <SelectItem value="GMD">Dalasi (GMD) - Gambie</SelectItem>
                                                    <SelectItem value="GNF">Franc guinéen (GNF) - Guinée</SelectItem>
                                                    <SelectItem value="GWP">Peso bissau-guinéen (GWP) - Guinée-Bissau</SelectItem>
                                                    <SelectItem value="LRD">Dollar libérien (LRD) - Liberia</SelectItem>
                                                    <SelectItem value="LYD">Dinar libyen (LYD) - Libye</SelectItem>
                                                    <SelectItem value="MGA">Ariary (MGA) - Madagascar</SelectItem>
                                                    <SelectItem value="MWK">Kwacha malawien (MWK) - Malawi</SelectItem>
                                                    <SelectItem value="MRU">Ouguiya (MRU) - Mauritanie</SelectItem>
                                                    <SelectItem value="MUR">Roupie mauricienne (MUR) - Maurice</SelectItem>
                                                    <SelectItem value="MZN">Metical (MZN) - Mozambique</SelectItem>
                                                    <SelectItem value="NAD">Dollar namibien (NAD) - Namibie</SelectItem>
                                                    <SelectItem value="RWF">Franc rwandais (RWF) - Rwanda</SelectItem>
                                                    <SelectItem value="STN">Dobra (STN) - Sao Tomé-et-Principe</SelectItem>
                                                    <SelectItem value="SCR">Roupie seychelloise (SCR) - Seychelles</SelectItem>
                                                    <SelectItem value="SLL">Leone (SLL) - Sierra Leone</SelectItem>
                                                    <SelectItem value="SOS">Shilling somalien (SOS) - Somalie</SelectItem>
                                                    <SelectItem value="SSP">Livre sud-soudanaise (SSP) - Soudan du Sud</SelectItem>
                                                    <SelectItem value="SDG">Livre soudanaise (SDG) - Soudan</SelectItem>
                                                    <SelectItem value="ZMW">Kwacha zambien (ZMW) - Zambie</SelectItem>
                                                    <SelectItem value="ZWL">Dollar zimbabwéen (ZWL) - Zimbabwe</SelectItem>
                                                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                                    <SelectItem value="USD">Dollar US (USD)</SelectItem>
                                                    <SelectItem value="GBP">Livre sterling (GBP)</SelectItem>
                                                    <SelectItem value="CHF">Franc suisse (CHF)</SelectItem>
                                                    <SelectItem value="CAD">Dollar canadien (CAD)</SelectItem>
                                                    <SelectItem value="AUD">Dollar australien (AUD)</SelectItem>
                                                    <SelectItem value="JPY">Yen japonais (JPY)</SelectItem>
                                                    <SelectItem value="CNY">Yuan chinois (CNY)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="primary_validator">Validateur principal</Label>
                                            <UserSelect
                                                value={watch("primary_validator") || undefined}
                                                onUserSelect={(userId: number | null, userName: string) => {
                                                    setValue("primary_validator", userName ? String(userName) : "", { shouldDirty: true })
                                                }}
                                                placeholder="Sélectionner un validateur principal"
                                            />
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
                            className="hover:bg-accent/80 transition-colors"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Annuler
                        </Button>
                        <div className="flex items-center gap-4">
                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <div className="flex items-center gap-2">
                                    <Progress value={uploadProgress} className="w-32 h-2" />
                                    <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                                </div>
                            )}
                            <Button
                                type="submit"
                                disabled={!isDirty || isLoading}
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
    )
}