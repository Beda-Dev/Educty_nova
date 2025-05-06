import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Icon } from "@iconify/react";

const menuItems = [
  { isHeader: true, title: "Menu" },
  { title: "Tableau de bord", icon: "heroicons:chart-bar", href: "/dashboard" },
  { 
    title: "Administration", 
    icon: "heroicons:shield", 
    child: [
      { title: "Utilisateurs", href: "/users", icon: "heroicons:user-circle" },
      { title: "Rôles", href: "/roles", icon: "heroicons:tag-20-solid" },
      { title: "Permissions", href: "/permission", icon: "heroicons:key" },
    ]
  },
  { 
    title: "Élèves", 
    icon: "heroicons:user-group", 
    child: [
      { title: "Inscription", href: "/registration", icon: "heroicons:key" },
      { title: "Élèves inscrits", href: "/students", icon: "heroicons:tag-20-solid" },
      { title: "Historique d'inscription", href: "/historique", icon: "heroicons:tag-20-solid" },
    ]
  },
  { isHeader: true, title: "Paramètres" },
  { title: "Niveau", icon: "heroicons:academic-cap", href: "/level" },
  { title: "Classe", icon: "heroicons:building-library", href: "/classe" },
  { title: "Année académique", icon: "heroicons:calendar-days", href: "/academic_year" },
  { 
    title: "Frais scolaires", 
    icon: "heroicons:cash", 
    child: [
      { title: "Type de frais", href: "/fees_type", icon: "heroicons:document" },
      { title: "Tarification", href: "/pricing", icon: "heroicons:credit-card" },
    ]
  },
  { 
    title: "Documents", 
    icon: "heroicons:document-text", 
    child: [
      { title: "Documents fournis", href: "/documents", icon: "heroicons:document" },
      { title: "Type de document", href: "/type_document", icon: "heroicons:document-duplicate" },
    ]
  },
  { isHeader: true, title: "Caisse" },
  { 
    title: "Paiements", 
    icon: "heroicons:banknotes", 
    child: [
      { title: "Paiement", href: "/paiement", icon: "heroicons:currency-dollar" },
      { title: "Historique", href: "/historique_paiement", icon: "heroicons:clock" },
      { title: "Caisses d'enregistrement", href: "/caisses", icon: "heroicons:archive-box" },
    ]
  },
  { 
    title: "Dépenses", 
    icon: "heroicons:currency-dollar", 
    child: [
      { title: "Déboursement", href: "/depense", icon: "heroicons:arrow-trending-down" },
      { title: "Type de dépenses", href: "/type_depense", icon: "heroicons:list-bullet" },
    ]
  },
];

interface HeaderSearchProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const HeaderSearch: React.FC<HeaderSearchProps> = ({ open, setOpen }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent size="xl" className="p-0">
        <Command>
          <div className="flex items-center border-b border-default-200 px-4">
            <CommandInput placeholder="Rechercher..." className="h-2 flex-1 border ml-1" />
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-transparent text-xs hover:text-default-800 px-1"
              onClick={() => setOpen(false)}
            >
              <X className="w-5 h-5 text-default-500" />
            </Button>
          </div>
          <CommandList className="py-5 px-7 max-h-[500px] overflow-y-auto">
            <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map((item, index) => (
                item.isHeader ? (
                  <h3 key={index} className="col-span-2 text-sm font-semibold text-gray-600 uppercase tracking-widest mb-2">
                    {item.title}
                  </h3>
                ) : (
                  <CommandGroup key={index} className="border rounded-lg p-3 bg-white shadow-sm">
                    <h4 className="text-default-700 font-medium flex items-center gap-2 mb-2">
                      <Icon icon={item.icon ?? ""} className="text-lg" />
                      {item.title}
                    </h4>
                    <div className="space-y-1">
                      {item.child ? (
                        item.child.map((subItem, subIndex) => (
                          <CommandItem key={subIndex} className="aria-selected:bg-transparent p-0">
                            <Link href={subItem.href} className="flex gap-2 items-center px-2 py-1 rounded-md text-default-500 hover:bg-gray-100">
                              <Icon icon={subItem.icon} className="text-md" />
                              <span>{subItem.title}</span>
                            </Link>
                          </CommandItem>
                        ))
                      ) : (
                        <CommandItem className="aria-selected:bg-transparent p-0">
                          <Link href={item.href ?? ""} className="flex gap-2 items-center px-2 py-1 rounded-md text-default-500 hover:bg-gray-100">
                            <Icon icon={item.icon ?? ""} className="text-md" />
                            <span>{item.title}</span>
                          </Link>
                        </CommandItem>
                      )}
                    </div>
                  </CommandGroup>
                )
              ))}
            </div>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default HeaderSearch;
