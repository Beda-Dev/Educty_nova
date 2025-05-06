import { Role } from "@/lib/interface";

export interface Permission {
    name: string;
    description?: string;
  }
  
  export interface EntityPermissions {
    [key: string]: Permission;
  }
  
  export interface AppPermissions {
    [entity: string]: EntityPermissions;
  }
  
  export interface PermissionsTableProps {
    permissionsTab: AppPermissions;
    roleId?: number;
    role: Role;
  }
  
  export interface FlatPermission {
    id: string;
    name: string;
    description?: string;
    entity: string;
  }