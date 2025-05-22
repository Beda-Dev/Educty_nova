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
import { cn , isLocationMatch, translate, getDynamicPath } from "@/lib/utils";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSchoolStore } from "@/store";
import {User} from '@/lib/interface'
import { useRouter } from "next/navigation";
import {mergeUserPermissions} from "@/lib/fonction";
import LogoComponent from "./logo";

const schema = z.object({
  email: z.string().email({ message: "Votre adresse e-mail n’est pas valide." }),
  password: z.string().min(4),
});

function findUserByEmail(email: string, users: User[]): User | null {
  return users.find(user => user.email === email) || null;
} 

type LoginFormData = {
  email: string;
  password: string;
};

const LogInForm = () => {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition();
  const [passwordType, setPasswordType] = React.useState("password");
  const {users , setUserOnline , roles , permissions} = useSchoolStore()
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
    formState: { errors },
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


  
  const onSubmit = async (formData: LoginFormData) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
  
        const result = await response.json();
  
        if (!response.ok) {
          toast.error(result?.message || "Identifiants invalides ou erreur serveur.");
          console.warn("Échec de connexion :", result);
          return;
        }
  
        const userData = result.data;
        const userWithPermissions = mergeUserPermissions(userData, roles, permissions);
  
        setUserOnline(userWithPermissions || userData);
  
        toast.success("Connexion réussie");
        router.push("/dashboard");
        reset();
      } catch (error) {
        console.error("Erreur lors de la tentative de connexion :", error);
        toast.error("Erreur réseau. Veuillez réessayer.");
      }
    });
  };
  

  if (!users?.length || !roles?.length || !permissions?.length) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-whitesmoke">
        <Loader2 className="h-6 w-6 animate-spin text-primary bg-whitesmoke" />
        <span className="ml-2 text-primary bg-whitesmoke">Chargement...</span>
      </div>
    );
  }
    


  
  return (
    <div className="w-full bg-whitesmoke ">

      <div className="2xl:mt-8 mt-6 2xl:text-3xl text-2xl font-bold text-default-900 bg-whitesmoke ">
      Bonjour 👋
      </div>
      <div className="2xl:text-lg text-base text-default-600 mt-2 leading-6 bg-whitesmoke">
      Entrez vos identifiants pour accéder à votre compte
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="2xl:mt-7 mt-8 bg-whitesmoke">
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
          <div className=" text-destructive mt-2 bg-whitesmoke">{errors.email.message}</div>
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
              <Icon icon="heroicons:eye" className="w-4 h-4 text-default-400 " />
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

          <Link href="/forgot" className="flex-none text-sm text-primary bg-whitesmoke">
          Mot de passe oublié ?
          </Link>
        </div>
        <Button
        color="tyrian"
          className="w-full"
          disabled={isPending}
          size={!isDesktop2xl ? "lg" : "md"}
        >
          {isPending && <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />}
          {isPending ? "Chargement..." : "Se connecter"}
        </Button>
      </form>
    </div>
  );
};

export default LogInForm;
