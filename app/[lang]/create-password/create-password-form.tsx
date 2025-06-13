"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { useMediaQuery } from "@/hooks/use-media-query";
import LogoComponent1 from "@/app/[lang]/logo1";

const schema = z.object({
  password: z
    .string()
    .min(8, { message: "Votre mot de passe doit contenir au moins 8 caractères." }),
  confirmPassword: z
    .string()
    .min(8, { message: "Votre mot de passe doit contenir au moins 8 caractères." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

const FormulaireNouveauMotDePasse = () => {
  const [isPending, startTransition] = React.useTransition();
  const [newPasswordType, setNewPasswordType] = React.useState<boolean>(false);
  const [confirmPasswordType, setConfirmPasswordType] = React.useState<boolean>(false);
  const isDesktop2xl = useMediaQuery("(max-width: 1530px)");

  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "all",
  });

  const onSubmit = (data: { password: string }) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/reset-password", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newPassword: data.password,
          }),
        });

        if (!response.ok) {
          throw new Error("Échec de la réinitialisation du mot de passe");
        }

        const result = await response.json();
        toast.success("Mot de passe réinitialisé avec succès");
        reset();
        router.push("/dashboard");
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Une erreur est survenue lors de la réinitialisation");
      }
    });
  };

  return (
    <div className="w-full">
      <Link href="/dashboard" className="inline-block">
        <LogoComponent1 width={40} height={40} className="2xl:h-14 2xl:w-14"/>
      </Link>
      <div className="2xl:mt-8 mt-6 2xl:text-3xl lg:text-2xl text-xl font-bold text-default-900">
        Créer un nouveau mot de passe
      </div>
      <div className="2xl:text-lg text-base text-default-600 mt-2 leading-6">
        Entrez votre mot de passe pour déverrouiller l'écran !
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="2xl:mt-7 mt-8">
        <div className="relative mt-4">
          <Input
            removeWrapper
            type={newPasswordType ? "text" : "password"}
            id="password"
            size={!isDesktop2xl ? "xl" : "lg"}
            placeholder=" "
            disabled={isPending}
            {...register("password")}
            className={cn("peer", {
              "border-destructive": errors.password,
            })}
          />
          <Label
            htmlFor="password"
            className="absolute text-base text-default-600 duration-300 transform -translate-y-5 scale-75 top-2 z-10 origin-[0] bg-background px-2 peer-focus:px-2
               peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 
               peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
          >
            Nouveau mot de passe
          </Label>
          <div
            className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 cursor-pointer"
            onClick={() => setNewPasswordType(!newPasswordType)}
          >
            {newPasswordType ? (
              <Icon icon="heroicons:eye" className="w-5 h-5 text-default-400" />
            ) : (
              <Icon
                icon="heroicons:eye-slash"
                className="w-5 h-5 text-default-400"
              />
            )}
          </div>
        </div>
        {errors.password && (
          <div className="text-destructive mt-2">
            {errors.password.message as string}
          </div>
        )}

        <div className="relative mt-4">
          <Input
            removeWrapper
            type={confirmPasswordType ? "text" : "password"}
            id="confirmPassword"
            size={!isDesktop2xl ? "xl" : "lg"}
            placeholder=" "
            disabled={isPending}
            {...register("confirmPassword")}
            className={cn("peer", {
              "border-destructive": errors.confirmPassword,
            })}
          />
          <Label
            htmlFor="confirmPassword"
            className="absolute text-base text-default-600 duration-300 transform -translate-y-5 scale-75 top-2 z-10 origin-[0] bg-background px-2 peer-focus:px-2
               peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 
               peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
          >
            Confirmer le mot de passe
          </Label>
          <div
            className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 cursor-pointer"
            onClick={() => setConfirmPasswordType(!confirmPasswordType)}
          >
            {confirmPasswordType ? (
              <Icon icon="heroicons:eye" className="w-5 h-5 text-default-400" />
            ) : (
              <Icon
                icon="heroicons:eye-slash"
                className="w-5 h-5 text-default-400"
              />
            )}
          </div>
        </div>
        {errors.confirmPassword && (
          <div className="text-destructive mt-2">
            {errors.confirmPassword.message as string}
          </div>
        )}
        <div className="mt-5 flex items-center gap-1.5">
          <Checkbox
            size="sm"
            className="border-default-300 mt-[1px]"
            id="terms"
          />
          <Label
            htmlFor="terms"
            className="text-sm text-default-600 cursor-pointer whitespace-nowrap"
          >
            J'accepte nos Conditions Générales d'Utilisation
          </Label>
        </div>

        <Button className="w-full mt-8" size={!isDesktop2xl ? "lg" : "md"} disabled={isPending}>
          {isPending && <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />}
          {isPending ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
        </Button>
      </form>
      <div className="mt-6 text-center text-base text-default-600">
        Pas maintenant ? Retournez à la{" "}
        <Link href="/" className="text-skyblue">
          page de connexion
        </Link>
      </div>
    </div>
  );
};

export default FormulaireNouveauMotDePasse;