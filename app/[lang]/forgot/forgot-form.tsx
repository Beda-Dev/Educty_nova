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
import LogoComponent1 from "@/app/[lang]/logo1";
import { useMediaQuery } from "@/hooks/use-media-query";

const ForgotForm = () => {
  const [isPending, startTransition] = React.useTransition();
  const isDesktop2xl = useMediaQuery("(max-width: 1530px)");
  const router = useRouter();
  
  const schema = z.object({
    email: z.string()
      .min(1, { message: "L'email est requis" })
      .email({ message: "Veuillez entrer une adresse email valide" })
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data: { email: string }) => {
    startTransition(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/password/forgot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: data.email }),
        });
  
        if (!response.ok) {
          if (response.status === 400) {
            throw new Error('Aucun compte trouvé avec cette adresse email');
          }
          throw new Error('Une erreur est survenue lors de la demande de réinitialisation');
        }
        
        toast.success('Un lien de réinitialisation a été envoyé à votre adresse email.');
      } catch (error) {
        console.error('Erreur lors de la demande de réinitialisation:', error);
        toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
      }
    });
  };

  // Correction: suppression de l'accolade fermante en trop
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="w-full">
      <Link href="/" className="inline-block">
        <LogoComponent1 width={40} height={40} className="2xl:h-14 2xl:w-14"/>
      </Link>
      <div className="2xl:mt-8 mt-6 2xl:text-3xl lg:text-2xl text-xl font-bold text-default-900">
        Mot de passe oublié ?
      </div>
      <p className="text-default-500 mt-2">
        Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 xl:mt-7">
        <div className="relative">
          <Input
            type="email"
            id="email"
            size={!isDesktop2xl ? "xl" : "lg"}
            placeholder=" "
            disabled={isPending}
            onKeyDown={handleKeyDown}
            {...register("email")}
            className={cn("peer w-full", {
              "border-destructive": errors.email,
            })}
          />
          <Label
            htmlFor="email"
            className="absolute text-base text-default-600 duration-300 transform -translate-y-5 scale-75 top-2 z-10 origin-[0] bg-background px-2 peer-focus:px-2
               peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 
               peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
          >
            Email
          </Label>
        </div>
        {errors.email && (
          <div className="text-destructive mt-2 text-sm">{errors.email.message as string}</div>
        )}

        <Button 
          type="submit"
          className="w-full mt-6" 
          size={!isDesktop2xl ? "lg" : "md"}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : 'Envoyer le lien de réinitialisation'}
        </Button>
      </form>
    </div>
  );
};

export default ForgotForm;