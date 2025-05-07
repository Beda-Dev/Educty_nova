import { User as UserType } from "./../app/[lang]/(dashboard)/(tables)/data-table/data";
import {
  Application,
  Chart,
  Components,
  DashBoard,
  Stacks2,
  Map,
  Grid,
  Files,
  Graph,
  ClipBoard,
  Cart,
  Envelope,
  Messages,
  Monitor,
  ListFill,
  Calendar,
  Flag,
  Book,
  Note,
  ClipBoard2,
  Note2,
  Note3,
  BarLeft,
  BarTop,
  ChartBar,
  PretentionChartLine,
  PretentionChartLine2,
  Google,
  Pointer,
  Map2,
  MenuBar,
  Icons,
  ChartArea,
  Building,
  Building2,
  Sheild,
  Error,
  Diamond,
  Heroicon,
  LucideIcon,
  CustomIcon,
  Mail,
  User,
  Authentication,
  Payment,
  fees,
  Class,
  UserGroup,
  Level,
  Freetype,
  Documents,
  Docs,
  Settings
} from "@/components/svg";

export interface MenuItemProps {
  title: string;
  icon: any;
  href?: string;
  child?: MenuItemProps[];
  megaMenu?: MenuItemProps[];
  multi_menu?: MenuItemProps[];
  nested?: MenuItemProps[];
  onClick: () => void;
  requiredPermission?: string; // Ex: "voir dashboard"
  requiredRole?: string; // Ex: "admin"
  hideIf?: boolean;
}

export const menusConfig = {
  mainNav: [
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
      title: "Admin",
      icon: Sheild,
      child: [
        {
          title: "Users",
          href: "/users",
          icon: "heroicons:user-circle",
        },
        {
          title: "Roles",
          href: "/roles",
          icon: "heroicons:tag-20-solid",
        },
        {
          title: "Permissions",
          href: "/permission",
          icon: "heroicons:key",
        },
      ],
    },
    {
      title: "students",
      icon: UserGroup,
      child: [
        {
          title: "Inscription",
          href: "/registration",
          icon: "heroicons:key",
        },
        {
          title: "eleves inscrit",
          href: "/students",
          icon: "heroicons:tag-20-solid",
        },
        {
          title: "Historique d'inscritption",
          href: "/historique",
          icon: "heroicons:tag-20-solid",
        },
      ],
    },

    {
      isHeader: true,
      title: "settings",
    },
    {
      title: "level",
      icon: Level,
      href: "/level",
      requiredPermission: "voir niveau",
      requiredRole: "admin",
    },
    {
      title: "class",
      icon: Class,
      href: "/classe",
    },
    {
      title: "academic year",
      icon: Note2,
      href: "/academic_year",
    },
    {
      title: "school fees",
      icon: fees,
      child: [
        {
          title: "fee type",
          icon: "Freetype",
          href: "/fees_type",
        },
        {
          title: "pricing",
          icon: "",
          href: "/pricing",
        },
      ],
    },

    {
      isHeader: true,
      title: "cash register",
    },
    {
      title: "paiments",
      icon: Payment,
      child: [
        {
          title: "paiement",
          icon: "Freetype",
          href: "/paiement",
        },
        {
          title: "historique",
          icon: "",
          href: "/historique_paiement",
        },
        {
          title: "caisses d'enregistrement",
          icon: "",
          href: "/caisses",
        },
      ],
    },
    {
      title: "expenses",
      icon: Authentication,
      child: [
        {
          title: "déboursement",
          icon: "",
          href: "/depense",
        },
        {
          title: "type depenses",
          icon: "",
          href: "/type_depense",
        },
      ],
    },
  ],
  sidebarNav: {
    modern: [
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
        title: "Admin",
        icon: Sheild,
        child: [
          {
            title: "Users",
            href: "/users",
            icon: "heroicons:user-circle",
          },
          {
            title: "Roles",
            href: "/roles",
            icon: "heroicons:tag-20-solid",
          },
          {
            title: "Permissions",
            href: "/permission",
            icon: "heroicons:key",
          },
        ],
      },
      {
        title: "students",
        icon: UserGroup,
        child: [
          {
            title: "Inscription",
            href: "/registration",
            icon: "heroicons:key",
          },
          {
            title: "eleves inscrit",
            href: "/students",
            icon: "heroicons:tag-20-solid",
          },
          {
            title: "Historique d'inscritption",
            href: "/historique",
            icon: "heroicons:tag-20-solid",
          },
        ],
      },

      {
        isHeader: true,
        title: "settings",
      },
      {
        title: "level",
        icon: Level,
        href: "/level",
      },
      {
        title: "class",
        icon: Class,
        href: "/classe",
      },
      {
        title: "academic year",
        icon: Note2,
        href: "/academic_year",
      },
      {
        title: "school fees",
        icon: fees,
        child: [
          {
            title: "fee type",
            icon: "Freetype",
            href: "/fees_type",
          },
          {
            title: "pricing",
            icon: "",
            href: "/pricing",
          },
        ],
      },
      {
        isHeader: true,
        title: "cash register",
      },
      {
        title: "paiments",
        icon: Payment,
        child: [
          {
            title: "paiement",
            icon: "Freetype",
            href: "/paiement",
          },
          {
            title: "historique",
            icon: "",
            href: "/historique_paiement",
          },
          {
            title: "caisses d'enregistrement",
            icon: "",
            href: "/caisses",
          },
        ],
      },
      {
        title: "expenses",
        icon: Authentication,
        child: [
          {
            title: "déboursement",
            icon: "",
            href: "/depense",
          },
          {
            title: "type depenses",
            icon: "",
            href: "/type_depense",
          },
        ],
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
      // {
      //   title: "Admin",
      //   icon: Sheild,
      //   child: [
      //     {
      //       title: "Users",
      //       href: "/users",
      //       icon: "heroicons:user-circle",
      //     },
      //     {
      //       title: "Roles",
      //       href: "/roles",
      //       icon: "heroicons:tag-20-solid",
      //     },
      //     {
      //       title: "Permissions",
      //       href: "/permission",
      //       icon: "heroicons:key",
      //     },
      //   ],
      // },
      // {
      //   title: "students",
      //   icon: UserGroup,
      //   child: [
      //     {
      //       title: "Inscription",
      //       href: "/registration",
      //       icon: "heroicons:key",
      //     },
      //     {
      //       title: "eleves inscrit",
      //       href: "/students",
      //       icon: "heroicons:tag-20-solid",
      //     },
      //     {
      //       title: "Historique d'inscritption",
      //       href: "/historique",
      //       icon: "heroicons:tag-20-solid",
      //     },
      //     {
      //       title: "Historique de document",
      //       href: "/historique",
      //       icon: "heroicons:tag-20-solid",
      //     },

      //   ],
      // },

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

      // {
      //   title: "level",
      //   icon: Level,
      //   href: "/level",
      // },
      // {
      //   title: "class",
      //   icon: Class,
      //   href: "/classe",
      // },
      // {
      //   title: "academic year",
      //   icon: Note2,
      //   href: "/academic_year",
      // },
      // {
      //   title: "school fees",
      //   icon: fees,
      //   child: [
      //     {
      //       title: "fee type",
      //       icon: "Freetype",
      //       href: "/fees_type",
      //     },
      //     {
      //       title: "pricing",
      //       icon: "",
      //       href: "/pricing",
      //     },
      //   ],
      // },
      // {
      //   title: "documents",
      //   icon: Docs,
      //   child: [
      //     {
      //       title: "documents fournis",
      //       icon: "Freetype",
      //       href: "/documents",
      //     },
      //     {
      //       title: "type de document",
      //       icon: "",
      //       href: "/type_document",
      //     },
      //   ],
      // },
      // {
      //   isHeader: true,
      //   title: "cash register",
      // },
      // {
      //   title: "paiments",
      //   icon: Payment,
      //   child: [
      //     {
      //       title: "paiement",
      //       icon: "Freetype",
      //       href: "/paiement",
      //     },
      //     {
      //       title: "historique",
      //       icon: "",
      //       href: "/historique_paiement",
      //     },
      //     {
      //       title: "caisses d'enregistrement",
      //       icon: "",
      //       href: "/caisses",
      //     },
      //   ],
      // },
      // {
      //   title: "expenses",
      //   icon: Authentication,
      //   child: [
      //     {
      //       title: "déboursement",
      //       icon: "",
      //       href: "/depense",
      //     },
      //     {
      //       title: "type depenses",
      //       icon: "",
      //       href: "/type_depense",
      //     },
      //   ],
      // },
    ],
  },
};

export type ModernNavType = (typeof menusConfig.sidebarNav.modern)[number];
export type ClassicNavType = (typeof menusConfig.sidebarNav.classic)[number];
export type MainNavType = (typeof menusConfig.mainNav)[number];
