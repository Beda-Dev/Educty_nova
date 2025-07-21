"use client"
import { useEffect } from "react"
import { Bell } from "@/components/svg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import shortImage from "@/public/images/all-img/short-image-2.png";
import { useSchoolStore } from "@/store";
import { useRouter } from "next/navigation";
import { fetchValidationExpenses, fetchExpenses } from "@/store/schoolservice";

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Date invalide";
  }
};

const formatAmount = (amount: string | number, currency: string = "FCFA") => {
  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return `0 ${currency}`;
    return `${num.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} ${currency}`;
  } catch {
    return `0 ${currency}`;
  }
};

const NotificationMessage = () => {
  const {
    validationExpenses,
    setValidationExpenses,
    userOnline,
    settings,
    expenses,
    setExpenses,
    users
  } = useSchoolStore();
  const router = useRouter();

  // Rafraîchit les données du store à l'ouverture et lors du focus de la fenêtre
  useEffect(() => {
    const refreshData = async () => {
      const [validationList, expensesList] = await Promise.all([
        fetchValidationExpenses(),
        fetchExpenses(),
      ]);
      setValidationExpenses(validationList);
      setExpenses(expensesList);
    };

    refreshData();

    const onFocus = () => {
      refreshData();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [setValidationExpenses, setExpenses]);

  const firstFiltre = (validationExpenses || []).filter((v) =>
    !(expenses || []).some((expense) => expense.validation_expense_id == v.id)
  );

  if (!validationExpenses || !Array.isArray(validationExpenses) || validationExpenses.length === 0) {
    return null;
  }

  const filteredValidationExpenses = firstFiltre.filter((v) => {
    return v?.validation_status === "en attente" &&
      v?.demand?.status === "en attente" &&
      Number(v?.user_id) === Number(userOnline?.id) &&
      typeof v.id === 'number';
  });

  const currency = settings[0]?.currency || "FCFA";

  const handleValidationClick = (id: number) => {
    if (!id || typeof id !== 'number') return;
    router.push(`/caisse_comptabilite/validation/${id}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative md:h-9 md:w-9 h-8 w-8 hover:bg-default-100 dark:hover:bg-default-200 
          data-[state=open]:bg-default-100  dark:data-[state=open]:bg-default-200 
           hover:text-skyblue text-default-500 dark:text-default-800 rounded-full"
        >
          <Bell className="h-5 w-5" />
          {filteredValidationExpenses.length > 0 && (
            <Badge className="w-4 h-4 p-0 text-xs font-medium flex items-center justify-center absolute left-[calc(100%-18px)] bottom-[calc(100%-16px)] ring-2 ring-primary-foreground">
              {filteredValidationExpenses.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[999] mx-4 lg:w-[412px] p-0"
      >
        <DropdownMenuLabel
          style={{ backgroundImage: `url(${shortImage.src})` }}
          className="w-full h-full bg-cover bg-no-repeat p-4 flex items-center"
        >
          <span className="text-base font-semibold text-white flex-1">
            Demandes de décaissement en attente
          </span>
        </DropdownMenuLabel>
        
        <div className="h-[300px] xl:h-[350px]">
          <ScrollArea className="h-full">
            {filteredValidationExpenses.length > 0 ? (
              filteredValidationExpenses.reverse().map((validation) => (
                <div 
                  key={`notification-${validation.id}`}
                  className="border-b last:border-b-0"
                >
                  <DropdownMenuItem className="flex gap-4 py-3 px-4 cursor-pointer dark:hover:bg-background focus:bg-accent">
                    <div className="flex-1 flex items-start gap-3">
                      <Avatar className="h-10 w-10 rounded">
                        <AvatarFallback>
                          {validation.user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-default-900 mb-1">
                          {validation.user?.name || "Utilisateur inconnu"} - { users.find((user)=> Number(user.id) == Number(validation.demand?.applicant_id) )?.name || "Demandeur inconnu"}
                        </div>
                        <div className="text-xs text-default-600 mb-1">
                          Montant demandé: {formatAmount(validation.demand?.amount || 0, currency)}
                        </div>
                        <div className="text-xs text-default-900 line-clamp-2">
                         Justification :  {validation.comment || "aucune"}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div
                        className={cn(
                          "text-xs font-medium text-default-900 whitespace-nowrap",
                          {
                            "text-default-600":
                              validation.validation_status !== "en attente",
                          }
                        )}
                      >
                        {formatDate(validation.validation_date)}
                      </div>
                      <div
                        className={cn("w-2 h-2 rounded-full", {
                          "bg-primary": validation.validation_status === "en attente",
                          "bg-gray-400": validation.validation_status !== "en attente",
                        })}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (validation.id) handleValidationClick(validation.id);
                        }}
                      >
                        Traiter
                      </Button>
                    </div>
                  </DropdownMenuItem>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Aucune demande en attente
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="m-4 mt-5">
          <Button 
            asChild 
            className="w-full"
            variant="outline"
          >
            <Link href="/caisse_comptabilite/validation">
              Voir toutes les validations
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMessage;

/*
  Remarques sur le code :

  1. fetchValidationExpenses et fetchExpenses doivent exister dans le store ou être importés
  2. Si fetchValidationExpenses/fetchExpenses échouent, setValidationExpenses/setExpenses peuvent recevoir undefined
  3. Si validationExpenses ou expenses sont undefined, le filtrage peut échouer (mais tu as bien mis || [])
  4. Si settings[0] n'existe pas, settings[0]?.currency retournera undefined (ce qui est géré par le fallback "FCFA")
  5. Si userOnline est null, Number(userOnline?.id) === Number(v?.user_id) retournera false (ce qui est OK)
  6. Si validationExpenses n'est pas un tableau, le composant ne s'affiche pas (ce qui est OK)
  7. Si setValidationExpenses ou setExpenses ne sont pas définis dans le store, il y aura une erreur

  Donc :
  - Assure-toi que setValidationExpenses et setExpenses existent bien dans le store.
  - fetchValidationExpenses et fetchExpenses doivent être importés ou accessibles.
  - Si tu veux éviter un appel réseau à chaque focus, tu peux ajouter un contrôle pour ne pas surcharger l'API.

  Sinon, la logique est correcte et robuste pour la plupart des cas d'usage.
  Pas d'erreur bloquante détectée dans ce code.
*/