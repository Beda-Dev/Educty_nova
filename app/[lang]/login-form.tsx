"use client";
import React, { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn, isLocationMatch, translate, getDynamicPath } from "@/lib/utils";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSchoolStore } from "@/store";
import { User } from "@/lib/interface";
import { useRouter } from "next/navigation";
import { mergeUserPermissions } from "@/lib/fonction";
import LogoComponent1 from "./logo1";
import { saveUser } from "@/lib/userStore";

const schema = z.object({
  email: z
    .string()
    .email({ message: "Votre adresse e-mail n’est pas valide." }),
  password: z
    .string()
    .min(8, { message: "Le mot de passe doit comporter au moins 8 caractères." }),
});

function findUserByEmail(email: string, users: User[]): User | null {
  return users.find((user) => user.email === email) || null;
}

type LoginFormData = {
  email: string;
  password: string;
};

const LogInForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [passwordType, setPasswordType] = React.useState("password");
  const [isLoading, setIsLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const { users, setUserOnline, roles, permissions } = useSchoolStore();
  const togglePasswordType = () => {
    if (passwordType === "text") {
      setPasswordType("password");
    } else if (passwordType === "password") {
      setPasswordType("text");
    }
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: {
      email: "admin@gmail.com",
      password: "password",
    },
  });
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const isDesktop2xl = useMediaQuery("(max-width: 1530px)");
  const isMobile = useMediaQuery("(max-width: 767px)");

  // La vérification des identifiants se fait côté serveur via l'API /api/login
  const onSubmit = async (formData: LoginFormData) => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        // Appel API côté serveur
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok) {
          // Vérifie si l'email existe dans users
          const userExists = users && users.find((u) => u.email === formData.email);
          if (userExists) {
            setApiError("Mot de passe incorrect.");
            toast.error("Mot de passe incorrect.");
          } else {
            setApiError(result?.message || "Identifiants invalides.");
            toast.error(result?.message || "Identifiants invalides ou erreur serveur.");
          }
          console.warn("Échec de connexion :", result);
          return;
        }

        const userData = result.data;

        // Vérifier si l'utilisateur est désactivé
        if (userData && userData.active === 0) {
          setApiError("Votre compte est désactivé. Veuillez contacter l'administrateur.");
          toast.error("Votre compte est désactivé. Veuillez contacter l'administrateur.");
          setIsLoading(false);
          return;
        }

        const userWithPermissions = mergeUserPermissions(
          userData,
          roles,
          permissions
        );

        setUserOnline(userWithPermissions || userData);
        // 💾 Enregistre dans IndexedDB
        await saveUser(userWithPermissions);

        

        // Attendre que roles, permissions et users soient chargés avant la redirection
        const waitForData = async () => {
          let tries = 0;
          while (
            (!roles?.length || !permissions?.length || !users?.length) &&
            tries < 30 // max ~3s
          ) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            tries++;
          }
        };
        await waitForData();

        toast.success("Connexion réussie");

        router.push("/dashboard");
        reset();
      } catch (error) {
        console.error("Erreur lors de la tentative de connexion :", error);
        toast.error("Erreur réseau. Veuillez réessayer.");
      } finally {
        setIsLoading(false);
      }
    });
  };

  // if (!users?.length || !roles?.length || !permissions?.length) {
  //   return (
  //     <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-background">
  //       <Loader2 className="h-8 w-8 animate-spin text-skyblue" />
  //       <span className="text-skyblue">Chargement des données...</span>
  //     </div>
  //   );
  // }

  return (
    <div
      className={`w-full ${isMobile
          ? "bg-white p-4 rounded-xl shadow-sm border mt-4"
          : "bg-whitesmoke"
        }`}
      style={isMobile ? { maxWidth: 380, margin: "0 auto" } : {}}
    >
      {isMobile && (
        <div className="flex flex-col items-center mb-4">
          <LogoComponent1 width={48} height={48} />
        </div>
      )}
      <div
        className={
          isMobile
            ? "text-xl font-bold text-default-900 mb-2 text-center"
            : "2xl:mt-8 mt-6 2xl:text-3xl text-2xl font-bold text-default-900 bg-whitesmoke "
        }
      >
        {isMobile ? "Bienvenue 👋" : "Bonjour 👋"}
      </div>
      <div
        className={
          isMobile
            ? "text-sm text-default-600 mb-4 text-center"
            : "2xl:text-lg text-base text-default-600 mt-2 leading-6 bg-whitesmoke"
        }
      >
        {isMobile
          ? "Connectez-vous pour accéder à votre espace"
          : "Entrez vos identifiants pour accéder à votre compte"}
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={isMobile ? "mt-4" : "2xl:mt-7 mt-8 bg-whitesmoke"}
      >
        <div className="relative bg-whitesmoke">
          <Input
            removeWrapper
            type="email"
            id="email"
            size={!isDesktop2xl ? "xl" : "lg"}
            placeholder=" "
            disabled={isPending}
            {...register("email")}
            className={cn("peer", {
              "border-destructive": errors.email,
            })}
            aria-invalid={!!errors.email}
            aria-describedby="email-error"
          />
          <Label
            htmlFor="email"
            className={cn(
              " absolute text-base text-default-600  rounded-t duration-300 transform -translate-y-5 scale-75 top-2 z-10 origin-[0]   bg-whitesmoke  px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75  peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1",
              {
                " text-sm bg-whitesmoke": isDesktop2xl,
              }
            )}
          >
            Email
          </Label>
        </div>
        {errors.email && (
          <p id="email-error" className="mt-2 text-sm text-destructive">
            {errors.email.message}
          </p>
        )}

        <div className="relative mt-6 bg-whitesmoke">
          <Input
            removeWrapper
            type={passwordType === "password" ? "password" : "text"}
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
            className={cn(
              " absolute text-base  rounded-t text-default-600  duration-300 transform -translate-y-5 scale-75 top-2 z-10 origin-[0]   bg-whitesmoke px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75  peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1",
              {
                " text-sm bg-whitesmoke": isDesktop2xl,
              }
            )}
          >
            Mot de passe
          </Label>
          <div
            className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 cursor-pointer bg-whitesmoke"
            onClick={togglePasswordType}
          >
            {passwordType === "password" ? (
              <Icon
                icon="heroicons:eye"
                className="w-4 h-4 text-default-400 "
              />
            ) : (
              <Icon
                icon="heroicons:eye-slash"
                className="w-4 h-4 text-default-400"
              />
            )}
          </div>
        </div>
        {errors.password && (
          <div className=" text-destructive mt-2 bg-whitesmoke">
            {errors.password.message}
          </div>
        )}

        <div className="mt-5  mb-6 flex flex-wrap gap-2 bg-whitesmoke">
          <Link
            href="/forgot"
            className="flex-none text-sm text-skyblue bg-whitesmoke"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <Button
          color="tyrian"
          type="submit"
          className="w-full transition-opacity duration-300"
          disabled={isLoading || isPending || !isValid}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connexion en cours...
            </>
          ) : (
            "Se connecter"
          )}
        </Button>
      </form>
    </div>
  );
};

export default LogInForm;
