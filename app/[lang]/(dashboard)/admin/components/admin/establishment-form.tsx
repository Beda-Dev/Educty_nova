"use client"

import { useState, useEffect } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Trash, Upload, Plus, X, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

const formSchema = z.object({
  id: z.string().optional(),
  nom_etablissement: z.string().min(2, {
    message: "Le nom de l'établissement doit contenir au moins 2 caractères.",
  }),
  telephone_etablissement: z.array(
    z.string().regex(/^\+?[0-9]{10,15}$/, {
      message: "Numéro de téléphone invalide",
    }),
  ),
  logo_etablissement: z.string().optional(),
  agrement_numero: z.string().min(1, {
    message: "Le numéro d'agrément est requis.",
  }),
  statut: z.string().min(1, {
    message: "Le statut est requis.",
  }),
  adresse: z.string().min(5, {
    message: "L'adresse doit contenir au moins 5 caractères.",
  }),
  email: z.string().email({
    message: "Adresse email invalide.",
  }),
})

type FormValues = z.infer<typeof formSchema>

const fetchEstablishment = async (): Promise<FormValues | null> => {
  try {
    const response = await fetch("/api/establishment")
    if (!response.ok) throw new Error("Erreur lors de la récupération des données")
    return await response.json()
  } catch (error) {
    console.error(error)
    return null
  }
}

const saveEstablishment = async (data: FormValues) => {
  const method = data.id ? "PUT" : "POST"
  const url = data.id ? `/api/establishment/${data.id}` : "/api/establishment"

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Erreur lors de l'enregistrement")
  }

  return await response.json()
}

export default function EstablishmentForm() {
  const queryClient = useQueryClient()
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch establishment data
  const { data: establishmentData, isLoading } = useQuery({
    queryKey: ["establishment"],
    queryFn: fetchEstablishment,
  })

  // Mutation for saving data
  const mutation = useMutation({
    mutationFn: saveEstablishment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["establishment"] })
      toast({
        title: "Succès",
        description: "Les informations ont été enregistrées avec succès."
      })
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        color: "destructive",
      })
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom_etablissement: "",
      telephone_etablissement: [""],
      logo_etablissement: "",
      agrement_numero: "",
      statut: "",
      adresse: "",
      email: "",
    },
  })

  // Reset form when data is loaded
  useEffect(() => {
    if (establishmentData) {
      form.reset(establishmentData)
      if (establishmentData.logo_etablissement) {
        setLogoPreview(establishmentData.logo_etablissement)
      }
    }
  }, [establishmentData, form])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "Le logo ne doit pas dépasser 2MB.",
          color: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
        form.setValue("logo_etablissement", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoPreview(null)
    form.setValue("logo_etablissement", "")
  }

  const addPhoneNumber = () => {
    const currentPhones = form.getValues("telephone_etablissement") || []
    form.setValue("telephone_etablissement", [...currentPhones, ""])
  }

  const removePhoneNumber = (index: number) => {
    const currentPhones = form.getValues("telephone_etablissement") || []
    if (currentPhones.length > 1) {
      form.setValue(
        "telephone_etablissement",
        currentPhones.filter((_, i) => i !== index),
      )
    }
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    mutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
          <div className="p-6 flex justify-end">
            <Skeleton className="h-10 w-[200px]" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>
                {establishmentData?.id
                  ? "Modifiez les informations de votre établissement"
                  : "Configurez les informations principales de votre établissement"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="nom_etablissement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'établissement</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de l'établissement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo_etablissement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo de l'établissement</FormLabel>
                    <FormControl>
                      <motion.div
                        layout
                        className="flex flex-col items-center space-y-4"
                      >
                        {logoPreview ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative h-32 w-32"
                          >
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="object-contain rounded-md w-32 h-32"
                            />
                            <motion.button
                              type="button"
                              className="absolute -right-2 -top-2 h-6 w-6 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                              onClick={removeLogo}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Trash className="h-4 w-4" />
                            </motion.button>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex h-32 w-32 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <label
                              htmlFor="logo-upload"
                              className="flex cursor-pointer flex-col items-center justify-center"
                            >
                              <Upload className="h-10 w-10 text-gray-400" />
                              <span className="mt-2 text-sm text-gray-500">Télécharger</span>
                              <input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleLogoChange}
                              />
                            </label>
                          </motion.div>
                        )}
                      </motion.div>
                    </FormControl>
                    <FormDescription>Format recommandé: PNG ou JPG, max 2MB</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telephone_etablissement"
                render={() => (
                  <FormItem>
                    <FormLabel>Numéros de téléphone</FormLabel>
                    <div className="space-y-2">
                      <AnimatePresence>
                        {form.watch("telephone_etablissement")?.map((_, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FormField
                              control={form.control}
                              name={`telephone_etablissement.${index}`}
                              render={({ field }) => (
                                <FormItem className="flex items-center gap-2 mb-0">
                                  <FormControl>
                                    <Input placeholder="+33 1 23 45 67 89" {...field} />
                                  </FormControl>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removePhoneNumber(index)}
                                    disabled={form.watch("telephone_etablissement").length <= 1}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={addPhoneNumber}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un numéro
                    </Button>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@etablissement.fr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agrement_numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro d'agrément</FormLabel>
                    <FormControl>
                      <Input placeholder="AGR-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="statut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sarl">SARL</SelectItem>
                        <SelectItem value="sas">SAS</SelectItem>
                        <SelectItem value="sa">SA</SelectItem>
                        <SelectItem value="eurl">EURL</SelectItem>
                        <SelectItem value="association">Association</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adresse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Textarea placeholder="123 rue de l'Exemple, 75000 Paris" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <div className="p-6 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {establishmentData?.id ? "Mettre à jour" : "Créer l'établissement"}
              </Button>
            </div>
          </Card>
        </motion.div>
      </form>
    </Form>
  )
}