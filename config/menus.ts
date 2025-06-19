
import {
  DashBoard,
  Sheild,
  UserGroup,
  Level,
  Class,
  Note2,
  fees,
  Payment,
  Authentication,
  Settings,
  Docs
} from "@/components/svg";

export interface MenuItemProps {
  title: string;
  icon?: any;
  href?: string;
  child?: MenuItemProps[];
  megaMenu?: MenuItemProps[];
  multi_menu?: MenuItemProps[];
  nested?: MenuItemProps[];
  items?: MenuItemProps[]; // Ajout du champ items
  onClick?: () => void;
  isHeader?: boolean;
  requiredPermission?: string; // Ex: "voir dashboard"
  requiredRole?: string; // Ex: "admin"
  hideIf?: boolean;
}

export const menusConfig = {
  mainNav: [
    {
      isHeader: true,
      title: "Menu",
    },
    {
      title: "Dashboard",
      icon: DashBoard,
      href: "/dashboard",
    },
    {
      title: "Paramètres",
      icon: Settings,
      href: "/parametres",
    },
    {
      title: "Élèves",
      icon: UserGroup,
      href: "/eleves",
    },
    {
      title: "Caisse",
      icon: Payment,
      href: "/caisse_comptabilite",
    },
    {
      title: "Vie scolaire",
      icon: fees,
      href: "/vie_scolaire",
    },
    {
      title: "Pédagogie",
      icon: Docs,
      href: "/pedagogie",
    },
    {
      title: "Inventaire",
      icon: Note2,
      href: "/inventaire",
    },
  ],
  sidebarNav: {
    modern: [
      {
        isHeader: true,
        title: "Menu",
      },
      {
        title: "Dashboard",
        icon: DashBoard,
        href: "/dashboard",
      },
      {
        title: "Paramètres",
        icon: Settings,
        href: "/parametres",
      },
      {
        title: "Élèves",
        icon: UserGroup,
        href: "/eleves",
      },
      {
        title: "Caisse",
        icon: Payment,
        href: "/caisse_comptabilite",
      },
      {
        title: "Vie scolaire",
        icon: fees,
        href: "/vie_scolaire",
      },
      {
        title: "Pédagogie",
        icon: Docs,
        href: "/pedagogie",
      },
      {
        title: "Inventaire",
        icon: Note2,
        href: "/inventaire",
      },
    ],
    classic: [
      {
        isHeader: true,
        title: "menu",
      },
      {
        title: "Dashboard",
        icon: DashBoard,
        href: "/dashboard",
      },
      {
        title: "settings",
        icon: Settings,
        href: "/parametres",
      },
      {
        title: "eleves",
        icon: UserGroup,
        href: "/eleves",
      },

      {
        title: "cash register",
        icon: Payment,
        href: "/caisse_comptabilite",
      },
      {
        title: "vie scolaire",
        icon: fees,
        href: "/vie_scolaire",
      },
      {
        title: "pedagogie",
        icon: Docs,
        href: "/pedagogie",
      },
      {
        title: "inventaire",
        icon: Note2,
        href: "/inventaire",
      },
    ],
  },
};

export type ModernNavType = (typeof menusConfig.sidebarNav.modern)[number];
export type ClassicNavType = (typeof menusConfig.sidebarNav.classic)[number];
export type MainNavType = (typeof menusConfig.mainNav)[number];