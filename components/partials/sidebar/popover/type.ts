export interface MenuItem {
    title: string;
    icon?: any;
    href?: string;
    isHeader?: boolean;
    child?: MenuItem[];
    multi_menu?: MenuItem[];
  }
  