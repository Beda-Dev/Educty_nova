
import { useSchoolStore } from "@/store";
import { comparaisonChaine } from "./fonction";
import { Role, User, Permission as permInterface } from "@/lib/interface";
import {
  fetchRoles,
  fetchPermissions,
  fetchUsers,
} from "@/store/schoolservice";



export const fetchWithRetry = async (
    url: string,
    options: RequestInit,
    retries = 3,
    delay = 1000
  ): Promise<Response> => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response;
    } catch (error) {
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw error;
    }
  };
  
  export const checkAndAssignPermission = async (
    permissionName: string,
    permissions: permInterface[],
    setPermission: (data: permInterface[]) => void
  ) => {
    const existingPermission = permissions.find((p) =>
      comparaisonChaine(p.name, permissionName)
    );
    if (existingPermission) return existingPermission;
  
    const res = await fetchWithRetry(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/permission`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: permissionName }),
    });
    const newPerm = await res.json();
    const updatedPermissions = await fetchPermissions();
    setPermission(updatedPermissions);
    return newPerm;
  };
  