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
      title: "Settings",
      icon: Settings,
      href: "/parametres",
    },
    {
      title: "Students",
      icon: UserGroup,
      href: "/eleves",
    },
    {
      title: "Cash Register",
      icon: Payment,
      href: "/caisse_comptabilite",
    },
    {
      title: "School Life",
      icon: fees,
      href: "/vie_scolaire",
    },
    {
      title: "Pedagogy",
      icon: Docs,
      href: "/pedagogie",
    },
    {
      title: "Inventory",
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
        title: "Settings",
        icon: Settings,
        href: "/parametres",
      },
      {
        title: "Students",
        icon: UserGroup,
        href: "/eleves",
      },
      {
        title: "Cash Register",
        icon: Payment,
        href: "/caisse_comptabilite",
      },
      {
        title: "School Life",
        icon: fees,
        href: "/vie_scolaire",
      },
      {
        title: "Pedagogy",
        icon: Docs,
        href: "/pedagogie",
      },
      {
        title: "Inventory",
        icon: Note2,
        href: "/inventaire",
      },
    ],
    classic: [
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
        title: "Settings",
        icon: Settings,
        href: "/parametres",
      },
      {
        title: "Students",
        icon: UserGroup,
        href: "/eleves",
      },
      {
        title: "Cash Register",
        icon: Payment,
        href: "/caisse_comptabilite",
      },
      {
        title: "School Life",
        icon: fees,
        href: "/vie_scolaire",
      },
      {
        title: "Pedagogy",
        icon: Docs,
        href: "/pedagogie",
      },
      {
        title: "Inventory",
        icon: Note2,
        href: "/inventaire",
      },
    ],
  },
};

export type ModernNavType = (typeof menusConfig.sidebarNav.modern)[number];
export type ClassicNavType = (typeof menusConfig.sidebarNav.classic)[number];
export type MainNavType = (typeof menusConfig.mainNav)[number];