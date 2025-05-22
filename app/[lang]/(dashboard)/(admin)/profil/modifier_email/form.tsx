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
import LogoComponent1 from "@/app/[lang]/logo1";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSchoolStore } from "@/store";
import { Card } from "@/components/ui/card";
import { VerificationModal } from "./VerificationModal";
import { generateOTP } from "@/lib/auth";

const EmailUpdateForm = () => {
  const { users, userOnline, setCodeOTP } = useSchoolStore();
  const [isPending, startTransition] = React.useTransition();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [emailData, setEmailData] = React.useState<{
    currentEmail: string;
    newEmail: string;
  } | null>(null);
  const isDesktop2xl = useMediaQuery("(max-width: 1530px)");

  // Schéma de base sans les validations asynchrones
  const baseSchema = z.object({
    currentEmail: z
      .string()
      .min(1, { message: "L'email actuel est requis" })
      .email({ message: "Veuillez entrer une adresse email valide" }),
    newEmail: z
      .string()
      .min(1, { message: "Le nouvel email est requis" })
      .email({ message: "Veuillez entrer une adresse email valide" })
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    trigger,
    setError,
    clearErrors
  } = useForm({
    resolver: zodResolver(baseSchema),
    mode: "onChange",
    defaultValues: {
      currentEmail: userOnline?.email || "",
      newEmail: ""
    }
  });

  // Validation personnalisée
  const validateCustomRules = async () => {
    const values = watch();
    let allValid = true;

    // Vérification que le nouvel email est différent de l'actuel
    if (values.newEmail === userOnline?.email) {
      setError("newEmail", {
        type: "manual",
        message: "Vous devez entrer un nouvel email différent de l'email actuel"
      });
      allValid = false;
    } else {
      clearErrors("newEmail");
    }

    // Vérification que l'email actuel existe dans otherUsers
    const otherUsers = users?.filter((user) => user.id !== userOnline?.id) || [];
    // if (!otherUsers.some(user => user.email.toLowerCase() === values.currentEmail?.toLowerCase())) {
    //   return
    //   setError("currentEmail", {
    //     type: "manual",
    //     message: "Cette adresse email n'est pas associée à votre compte"
    //   });
    //   allValid = false;
    // } else {
    //   clearErrors("currentEmail");
    // }

    return allValid;
  };

  // Déclencheur de validation
  React.useEffect(() => {
    const subscription = watch(async () => {
      await trigger();
      await validateCustomRules();
    });
    return () => subscription.unsubscribe();
  }, [watch, trigger]);

  const onSubmit = async (data: any) => {
    const isCustomValid = await validateCustomRules();
    if (!isCustomValid) return;

    startTransition(async () => {
      try {
        const otp = generateOTP(data.newEmail);
        setCodeOTP({
          otp: Number(otp.otp),
          email: data.newEmail,
          expiresAt: otp.expiresAt.toISOString(),
        });

        const res = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.newEmail,
            CodeOtp: otp.otp,
            message: otp.message
          }),
        });

        if (res.ok) {
          setEmailData({
            currentEmail: data.currentEmail,
            newEmail: data.newEmail,
          });
          setIsModalOpen(true);
          toast.success("Code de vérification envoyé à votre nouvel email");
        } else {
          const result = await res.json();
          toast.error(result.message || "Erreur lors de l'envoi du code");
        }
      } catch (error) {
        console.error("Erreur:", error);
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
    <div className="max-w-md mx-auto">
      <Card className="p-6 shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <Link href="/dashboard" className="mb-4">
            <LogoComponent1  width={48} height={48}/>
          </Link>
          <h1 className="text-2xl font-bold text-center text-gray-900">
            Modifier votre email
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Entrez votre email actuel et le nouvel email pour recevoir un code de
            vérification
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentEmail" className="text-gray-700">
              Email actuel
            </Label>
            <Input
              id="currentEmail"
              type="email"
              placeholder="votre@email.com"
              disabled={isPending}
              onKeyDown={handleKeyDown}
              {...register("currentEmail")}
              className={cn({
                "border-destructive": errors.currentEmail,
              })}
            />
            {errors.currentEmail && (
              <p className="text-sm text-destructive">
                {errors.currentEmail.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newEmail" className="text-gray-700">
              Nouvel email
            </Label>
            <Input
              id="newEmail"
              type="email"
              placeholder="nouveau@email.com"
              disabled={isPending}
              onKeyDown={handleKeyDown}
              {...register("newEmail")}
              className={cn({
                "border-destructive": errors.newEmail,
              })}
            />
            {errors.newEmail && (
              <p className="text-sm text-destructive">
                {errors.newEmail.message as string}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="outline"
            color="skyblue"
            className="w-full mt-4"
            disabled={isPending || !isValid || !isDirty || Object.keys(errors).length > 0}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Envoi en cours..." : "Vérification"}
          </Button>
        </form>
      </Card>

      <VerificationModal
        isOpen={isModalOpen}
        onCloseAction={() => setIsModalOpen(false)}
        emailData={emailData}
      />
    </div>
  );
};

export default EmailUpdateForm;