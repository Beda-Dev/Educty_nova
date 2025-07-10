import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Search } from "lucide-react";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Settings,
  Users,
  BookOpen,
  Calendar,
  Layers,
  School,
  Book,
  Clipboard,
  LayoutGrid,
  FileText,
  List,
  Tags,
  Briefcase,
  UserCog,
  DollarSign,
  Warehouse,
  ClipboardList,
  CreditCard,
  CalendarCheck,
  Package,
  RefreshCw,
  User,
  UserPlus,
  UserCheck,
  Clock,
  CheckCircle,
  Home,
  Calculator,
  Mail
} from "lucide-react";

type MenuItem = {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
  description?: string;
  children?: MenuItem[];
  hidden?: boolean;
};

type MenuCategory = {
  [key: string]: MenuItem[];
};

const menuItems: MenuCategory = {
  parametres: [
    {
      id: "general",
      title: "Généraux",
      icon: <Settings className="w-4 h-4" />,
      path: "/parametres/general",
      children: [
        {
          id: "users",
          title: "Utilisateurs",
          description: "Gérer les utilisateurs",
          icon: <Users className="w-4 h-4" />,
          path: "/parametres/general/users",
        },
      ],
    },
    {
      id: "pedagogy",
      title: "Pédagogie",
      icon: <BookOpen className="w-4 h-4" />,
      path: "/parametres/pedagogy",
      children: [
        {
          id: "academic-year",
          title: "Année academique",
          description: "Année scolaire",
          icon: <Calendar className="w-4 h-4" />,
          path: "/parametres/pedagogy/academic_year",
        },
        {
          id: "levels",
          title: "Niveaux",
          description: "Niveaux d'études",
          icon: <Layers className="w-4 h-4" />,
          path: "/parametres/pedagogy/level",
        },
        {
          id: "classes",
          title: "Classes",
          description: "Gestion des classes",
          icon: <School className="w-4 h-4" />,
          path: "/parametres/pedagogy/classe",
        },
        {
          id: "matiere",
          title: "Matières",
          description: "Gestion des différentes matières enseignées",
          icon: <Book className="w-6 h-6" />,
          path: "/parametres/pedagogy/matieres",
        },
        {
          id: "type_evaluation",
          title: "Types d'évaluation",
          description: "Gestion des types d'évaluation",
          icon: <Clipboard className="w-6 h-6" />,
          path: "/parametres/pedagogy/type_evaluation",
        },
        {
          id: "type_period",
          title: "Types de Périodes",
          description: "Gestion des types de périodes académiques",
          icon: <Calendar className="w-6 h-6" />,
          path: "/parametres/pedagogy/type_period"
        },
        {
          id: "periodes",
          title: "Periodes",
          description: "Gestion des periodes academique",
          icon: <Calendar className="w-6 h-6" />,
          path: "/parametres/pedagogy/periodes",
        },
        {
          id: "serie",
          title: "Séries",
          description: "Gestion des séries",
          icon: <LayoutGrid className="w-6 h-6" />,
          path: "/parametres/pedagogy/serie",
        }
      ],
    },
    {
      id: "scolarite",
      title: "Scolarité",
      icon: <School className="w-4 h-4" />,
      path: "/parametres/scolarite",
      children: [
        {
          id: "documents",
          title: "Documents",
          description: "Gestion des types de documents et pièces justificatives",
          icon: <FileText className="w-4 h-4" />,
          path: "/parametres/scolarite/type_document",
        },
        {
          id: "fees_type",
          title: "Types de frais",
          description: "Gestion des différents types de frais scolaires",
          icon: <List className="w-6 h-6" />,
          path: "/parametres/scolarite/fees_type",
        },
        {
          id: "pricing",
          title: "Tarification",
          description: "Gestion des tarifs et montants des frais",
          icon: <Tags className="w-6 h-6" />,
          path: "parametres/scolarite/pricing",
        },
      ],
    },
    {
      id: "administration",
      title: "Admin",
      icon: <Users className="w-4 h-4" />,
      path: "/parametres/administration",
      children: [
        {
          id: "roles",
          title: "Fonctions",
          description: "Rôles du personnel",
          icon: <Briefcase className="w-4 h-4" />,
          path: "/parametres/administration/fonctions",
        },
        {
          id: "employees",
          title: "Employés",
          description: "Gérer le personnel",
          icon: <UserCog className="w-4 h-4" />,
          path: "/parametres/administration/employes",
        },
        {
          id: "professors",
          title: "Enseignants",
          description: "Gérer les professeurs",
          icon: <UserCog className="w-4 h-4" />,
          path: "/parametres/administration/professeur",
        }
      ],
    },
    {
      id: "caisse",
      title: "Caisse",
      icon: <DollarSign className="w-4 h-4" />,
      path: "/parametres/caisse",
      children: [
        {
          id: "caisses",
          title: "Caisses d'enregitrement",
          path: "/parametres/caisse/caisses_enregistrement",
          icon: <Warehouse className="w-4 h-4" />,
        },
        {
          id: "type_depense",
          title: "Type de dépense",
          path: "/parametres/caisse/type_depense",
          icon: <ClipboardList className="w-4 h-4" />,
        },
        {
          id: "payment-methods",
          title: "Méthodes de Paiement",
          path: "/parametres/caisse/methodes_paiement",
          icon: <CreditCard className="w-6 h-6" />,
        },
        {
          id: "payment-schedules",
          title: "Échéanciers de Paiement",
          icon: <CalendarCheck className="w-6 h-6" />,
          path: "/parametres/caisse/echeanciers_paiement",
        },
      ],
    },
  ],
  inventaire: [
    {
      id: "entrepots",
      title: "Entrepôts",
      path: "/inventaire/entrepots",
      icon: <Warehouse className="w-4 h-4" />,
      children: [],
    },
    {
      id: "produits",
      title: "Produits",
      path: "/inventaire/produits",
      icon: <Package className="w-4 h-4" />,
      children: [],
    },
    {
      id: "operations",
      title: "Opérations",
      path: "/inventaire/operations",
      icon: <RefreshCw className="w-4 h-4" />,
      children: [],
    },
  ],
  eleves: [
    {
      id: "inscription",
      title: "Inscription",
      path: "/eleves/registration",
      icon: <User className="w-4 h-4" />,
      children: [
        {
          id: "new-registration",
          title: "Nouvelle inscription",
          path: "/eleves/registration/new_registration",
          icon: <UserPlus  className="w-4 h-4" />,
        },
        {
          id: "re-registration",
          title: "Re-inscription",
          path: "/eleves/registration/re-registration",
          icon: <UserCheck  className="w-4 h-4" />,
        },
      ],
    },
    {
      id: "eleves-inscrits",
      title: "Élèves inscrits",
      path: "/eleves/students",
      icon: <Users className="w-4 h-4" />,
      children: [],
    },
    {
      id: "Historique-inscription",
      title: "Historique inscription",
      path: "/eleves/historique",
      icon: <Book className="w-4 h-4" />,
      children: [],
    },
    {
      id: "Historique-documents",
      title: "Historique documents",
      path: "/eleves/documents",
      icon: <FileText className="w-4 h-4" />,
      children: [],
    },
  ],
  caisse_comptabilite: [
    {
      id: "encaissement",
      title: "Encaissement",
      path: "/caisse_comptabilite/encaissement",
      icon: <DollarSign className="w-4 h-4" />,
      children: [
        {
          id: "paiement",
          title: "Paiement",
          path: "/caisse_comptabilite/encaissement/paiement",
          icon: <DollarSign className="w-4 h-4" />,
        },
        {
          id: "historique_paiement",
          title: "Historique Paiement",
          path: "/caisse_comptabilite/encaissement/historique_paiement",
          icon: <Clock className="w-4 h-4" />,
        },
      ],
    },
    {
      id: "decaissement",
      title: "Décaissement",
      path: "/caisse_comptabilite/decaissement",
      icon: <DollarSign className="w-4 h-4" />,
      children: [
        {
          id: "depense",
          title: "Dépense",
          path: "/caisse_comptabilite/decaissement/depense",
          icon: <DollarSign className="w-4 h-4" />,
        }
      ],
    },
    {
      id: "sessions",
      title: "Sessions de caisse",
      icon: <Clock className="w-6 h-6" />,
      path: "/caisse_comptabilite/session_caisse",
      children: [
        {
          id: "close_session",
          title: "fermeture caisse",
          icon: <Calendar className="w-6 h-6" />,
          path: "/caisse_comptabilite/close-session",
          hidden: true
        },
        {
          id: "open_session",
          title: "ouverture caisse",
          icon: <Calendar className="w-6 h-6" />,
          path: "/caisse_comptabilite/open-session",
          hidden: false
        }
      ]
    },
    {
      id: "demandes",
      title: "Demandes de décaissement",
      icon: <FileText className="w-6 h-6" />,
      path: "/caisse_comptabilite/demandes",
    },
    {
      id: "validation-decaissement",
      title: "Validation des demandes",
      icon: <CheckCircle className="w-6 h-6" />,
      path: "/caisse_comptabilite/validation",
    },
    {
      id: "finance",
      title: "Résumé financier",
      icon: <DollarSign className="w-4 h-4" />,
      path: "/caisse_comptabilite/resume_financie",

    },
  ],
  pedagogie: [
    {
      id: "grades",
      title: "Notes",
      path: "/pedagogie/notes",
      icon: <FileText className="w-4 h-4" />,
      children: [],
    },
    {
      id: "schedule",
      title: "Emploi du temps",
      path: "/pedagogie/emploi_du_temps",
      icon: <Calendar className="w-4 h-4" />,
      children: [
        {
          id: "eleves",
          title: "Emploi du temps classes",
          path: "/pedagogie/emploi_du_temps_classe",
          icon: <User className="w-6 h-6" />,
        },
        {
          id: "professeurs",
          title: "Emploi du temps professeurs",
          path: "/pedagogie/emploi_du_temps_professeur",
          icon: <Calendar className="w-6 h-6" />,
        },
      ],
    },
    {
      id: "cahier-text",
      title: "Cahier de texte",
      path: "/pedagogie/cahier-texte",
      icon: <Book className="w-4 h-4" />,
      children: [],
    },
    {
      id: "presence",
      title: "Liste de présence",
      path: "/pedagogie/liste-presence",
      icon: <ClipboardList className="w-4 h-4" />,
      children: [],
    },
    {
      id: "library",
      title: "Bibliothèque",
      path: "/pedagogie/bibliotheque",
      icon: <BookOpen className="w-4 h-4" />,
      children: [
        {
          id: "overview",
          title: "Vue d'ensemble",
          icon: <Home className="w-6 h-6" />,
          path: "/pedagogie/bibliotheque/overview",
        },
        {
          id: "books",
          title: "Livres",
          description: "Gestion du catalogue et des exemplaires",
          icon: <Book className="w-6 h-6" />,
          path: "/pedagogie/bibliotheque/livres",
        },
        {
          id: "loans",
          title: "Emprunts",
          description: "Suivi des prêts et retours",
          icon: <Clock className="w-6 h-6" />,
          path: "/pedagogie/bibliotheque/emprunts",
        },
        {
          id: "borrowers",
          title: "Emprunteurs",
          description: "Gestion des membres et cartes de lecteur",
          icon: <Users className="w-6 h-6" />,
          path: "/pedagogie/bibliotheque/emprunteurs",
        },
      ],
    },
  ],
  vie_scolaire: [
    {
      id: "grades",
      title: "Notes",
      path: "/vie_scolaire/notes",
      icon: <FileText className="w-4 h-4" />,
      children: [],
    },
    {
      id: "schedule",
      title: "Emploi du temps",
      path: "/vie_scolaire/emploi_du_temps",
      icon: <Calendar className="w-4 h-4" />,
      children: [
        {
          id: "eleves",
          title: "Emploi du temps classes",
          path: "/vie_scolaire/emploi_du_temps_classe",
          icon: <User className="w-6 h-6" />,
        },
      ],
    },
    {
      id: "averages",
      title: "Moyennes",
      path: "/vie_scolaire/moyennes",
      icon: <Calculator className="w-6 h-6" />,
      children: [],
    },
    {
      id: "correspondence",
      title: "Carnet de correspondance",
      path: "/vie_scolaire/carnet-correspondance",
      icon: <Mail className="w-6 h-6" />,
      children: [],
    },
  ],
};

interface HeaderSearchProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const HeaderSearch: React.FC<HeaderSearchProps> = ({ open, setOpen }) => {
  const [searchValue, setSearchValue] = React.useState("");

  const filteredItems = React.useMemo(() => {
    if (!searchValue) return menuItems;

    const result: MenuCategory = {};
    
    Object.keys(menuItems).forEach((category) => {
      const filteredCategoryItems = menuItems[category]
        .map(item => ({
          ...item,
          children: item.children?.filter(child => 
            !child.hidden && 
            (child.title.toLowerCase().includes(searchValue.toLowerCase()) ||
             child.description?.toLowerCase().includes(searchValue.toLowerCase()))
          )
        }))
        .filter(item => 
          !item.hidden &&
          (item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
           item.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
           (item.children && item.children.length > 0))
        );

      if (filteredCategoryItems.length > 0) {
        result[category] = filteredCategoryItems;
      }
    });

    return result;
  }, [searchValue]);

  const categoryLabels: Record<string, string> = {
    parametres: "Paramètres",
    inventaire: "Inventaire",
    eleves: "Élèves",
    caisse_comptabilite: "Caisse & Comptabilité",
    pedagogie: "Pédagogie",
    vie_scolaire: "Vie Scolaire"
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent size="5xl"  className="p-0  overflow-hidden h-full">
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center px-4 py-3 border-b">
            <Search className="mr-2 h-5 w-5 text-muted-foreground" />
            <CommandInput 
              placeholder="Rechercher un menu, une fonctionnalité..."
              className="flex-1 border-none shadow-none focus-visible:ring-0"
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex rounded-full h-8 w-8"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fermer</span>
            </Button>
          </div>
          
          <CommandList className="p-4">
            {Object.keys(filteredItems).length === 0 ? (
              <CommandEmpty className="py-6 text-center text-muted-foreground">
                Aucun résultat trouvé pour "{searchValue}"
              </CommandEmpty>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(filteredItems).map(([category, items]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground px-2">
                      {categoryLabels[category] || category}
                    </h3>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <CommandGroup 
                          key={item.id}
                          className="bg-card rounded-lg border p-2"
                        >
                          <CommandItem className="p-0 aria-selected:bg-transparent">
                            <Link
                              href={item.path}
                              className="flex items-center gap-3 p-2 w-full rounded-md hover:bg-accent"
                              onClick={() => setOpen(false)}
                            >
                              <span className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 text-primary">
                                {item.icon}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{item.title}</p>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </Link>
                          </CommandItem>
                          
                          {item.children && item.children.length > 0 && (
                            <div className="mt-1 space-y-1 pl-11">
                              {item.children.map((child) => (
                                <CommandItem key={child.id} className="p-0 aria-selected:bg-transparent">
                                  <Link
                                    href={child.path}
                                    className="flex items-center gap-2 p-2 w-full text-sm rounded-md hover:bg-accent"
                                    onClick={() => setOpen(false)}
                                  >
                                    <span className="text-muted-foreground">
                                      {child.icon}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <p className="truncate">{child.title}</p>
                                      {child.description && (
                                        <p className="text-xs text-muted-foreground truncate">
                                          {child.description}
                                        </p>
                                      )}
                                    </div>
                                  </Link>
                                </CommandItem>
                              ))}
                            </div>
                          )}
                        </CommandGroup>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default HeaderSearch;