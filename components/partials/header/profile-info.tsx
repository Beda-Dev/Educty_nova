"use client";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import Link from "next/link";
import Image from "next/image";
import { useSchoolStore } from "@/store";
import { cn } from "@/lib/utils";
import { deleteUser } from "@/lib/userStore";
import { RoleWithFullAccessCaisse } from "@/lib/full";

const ProfileInfo = () => {
  const { userOnline, setUserOnline } = useSchoolStore();
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_2;

  const handleLogout = async () => {
    try {
      if (userOnline?.id) {
        await deleteUser(); // suppression IndexedDB
      }
      setUserOnline(null); // vider le store
      toast.success("Déconnexion réussie");
      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      toast.error("Échec de la déconnexion. Veuillez réessayer.");
    }
  };

  const hasFullAccess = userOnline?.roles?.some(role =>
    RoleWithFullAccessCaisse.includes(role.name)
  );

  const getAvatarUrl = (avatar?: string | null): string | undefined => {
    if (!avatar) return undefined;
    const isAbsoluteUrl = avatar.startsWith("http://") || avatar.startsWith("https://");
    return isAbsoluteUrl ? avatar : `${baseUrl}/${avatar}`;
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full p-0 hover:bg-muted"
        >
          <Avatar className="h-8 w-8">
            {userOnline?.avatar ? (
              <div className="relative h-full w-full">
                <Image
                  src={getAvatarUrl(userOnline.avatar) || ''}
                  alt={userOnline?.name || "Utilisateur"}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
            ) : <AvatarFallback className="bg-skyblue text-primary-foreground">
              {getInitials(userOnline?.name)}
            </AvatarFallback>}

          </Avatar>
          <span className="sr-only">Menu profil</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-2" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-medium leading-none">
              {userOnline?.name || "Utilisateur"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userOnline?.email || "Aucun email"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/profil">
            <DropdownMenuItem className="cursor-pointer">
              <Icon icon="heroicons:user" className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
          </Link>
          {hasFullAccess && (
            <Link href="/establishment_settings">
              <DropdownMenuItem className="cursor-pointer">
                <Icon icon="heroicons:cog" className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
            </Link>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={handleLogout}
        >
          <Icon icon="heroicons:power" className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileInfo;
