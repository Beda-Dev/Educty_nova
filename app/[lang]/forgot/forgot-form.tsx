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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteLogo } from "@/components/svg";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSchoolStore } from "@/store";
import {User} from '@/lib/interface'



const ForgotForm = () => {
  const { users, roles, permissions , CodeOTP , setCodeOTP } = useSchoolStore();
  const [isPending, startTransition] = React.useTransition();
  const isDesktop2xl = useMediaQuery("(max-width: 1530px)");
  const router = useRouter();
  
  const schema = z.object({
    email: z.string()
      .min(1, { message: "L'email est requis" })
      .email({ message: "Veuillez entrer une adresse email valide" })
      .refine(
        (email) => {
          // Vérifie si l'email existe dans les utilisateurs
          return users?.some(user => user.email.toLowerCase() === email.toLowerCase());
        },
        {
          message: "Aucun compte trouvé avec cette adresse email",
          path: ["email"]
        }
      ),
    password: z.string()
      .min(1, { message: "Le mot de passe est requis" })
      .min(4, { message: "Le mot de passe doit contenir au moins 4 caractères" })
  });
  
  // Fonction utilitaire pour vérifier l'existence de l'email
  function isEmailRegistered(email: string, users: User[]): boolean {
    if (!users || users.length === 0) return false;
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }



  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "all",
  });
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const onSubmit = async (data: any) => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/send-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: data.email }),
        });
  
        const result = await res.json();
  
        if (res.ok) {
          const expiration = new Date(Date.now() + 20 * 60 * 1000); // 20 min
  
          // Stocker OTP + email + expiration
          const otpData = {
            otp: result.otp as number,
            email: data.email as string,
            expiresAt: expiration.toISOString(),
          };
          // Mettre à jour le code OTP dans l'état
          setCodeOTP(otpData);

  
          toast.success("Le code de réinitialisation a été envoyé à votre adresse e-mail");
          reset();
          router.push("/verification_otp");
        } else {
          toast.error(result.message || "Erreur lors de l'envoi de l'e-mail");
        }
      } catch (error) {
        console.error("Erreur envoi OTP:", error);
        toast.error("Erreur réseau, veuillez réessayer");
      }
    });
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  };  
  
  return (
    <div className="w-full">
      <Link href="/dashboard" className="inline-block">
        <SiteLogo className="h-10 w-10 2xl:w-14 2xl:h-14 text-primary" />
      </Link>
      <div className="2xl:mt-8 mt-6 2xl:text-3xl text-2xl font-bold text-default-900">
      Vous avez oublié votre mot de passe ?
      </div>
      <div className="2xl:text-lg text-base text-default-600 mt-2 leading-6">
      Entrez votre adresse e-mail et les instructions vous seront envoyées !
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 xl:mt-7">
        <div className="relative">
          <Input
            removeWrapper
            type="email"
            id="email"
            size={!isDesktop2xl ? "xl" : "lg"}
            placeholder=" "
            disabled={isPending}
            onKeyDown={handleKeyDown}
            {...register("email")}
            className={cn("peer", {
              "border-destructive": errors.email,
            })}
          />
          <Label
            htmlFor="email"
            className="absolute text-base text-default-600  duration-300 transform -translate-y-5 scale-75 top-2 z-10 origin-[0]   bg-background  px-2 peer-focus:px-2
               peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 
               peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
          >
            Email
          </Label>
        </div>
        {errors.email && (
          <div className=" text-destructive mt-2">{errors.email.message as string}</div>
        )}

        <Button className="w-full mt-6" size={!isDesktop2xl ? "lg" : "md"}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "envoi..." : "Envoyer un e-mail de récupération"}
        </Button>
      </form>
    </div>
  );
};

export default ForgotForm;
