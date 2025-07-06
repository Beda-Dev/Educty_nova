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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useSchoolStore } from "@/store";
import { cn } from "@/lib/utils";

const ProfileInfo = () => {
  const { userOnline, setUserOnline } = useSchoolStore();
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_2;

  const handleLogout = () => {
    setUserOnline(null);
    toast.success("Déconnexion réussie");
    router.push("/");
  };

  const getAvatarUrl = (avatar?: string | null ): string | undefined => {
    if (!avatar) return undefined;
    const isAbsoluteUrl =
      avatar.startsWith("http://") || avatar.startsWith("https://");
    return isAbsoluteUrl ? avatar : `${baseUrl}${avatar}`;
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
            <AvatarImage
              src={getAvatarUrl(userOnline?.avatar)}
              alt={userOnline?.name || "Utilisateur"}
            />
            <AvatarFallback className="bg-skyblue text-primary-foreground">
              {getInitials(userOnline?.name)}
            </AvatarFallback>
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
          <Link href="/establishment_settings">
            <DropdownMenuItem className="cursor-pointer">
              <Icon icon="heroicons:cog" className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </DropdownMenuItem>
          </Link>
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
