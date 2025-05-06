"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useSchoolStore } from "@/store";
import { comparaisonChaine } from "./fonction";
import { Role, User, Permission as permInterface } from "@/lib/interface";
import {
  fetchRoles,
  fetchPermissions,
  fetchUsers,
} from "@/store/schoolservice";
import { mergeUserPermissions } from "@/lib/fonction";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import {getFlatPermissions} from "./obtentionPermission";
import { fetchWithRetry, checkAndAssignPermission } from "./verificationPermissionTofetch";
import { Permission, FlatPermission , AppPermissions , EntityPermissions , PermissionsTableProps } from "./types";
import { usePermissionsLogic } from "./usePermissionsLogic";


export default function PermissionsTable({
  permissionsTab,
  roleId,
  role,
}: PermissionsTableProps) {
  const {
    flatPermissions,
    selectedPermissions,
    handleSwitchChange,
    toggleSelectAll,
    handleBack,
    handleSubmit,
    isSubmitting,
    allSelected,
  } = usePermissionsLogic({ permissionsTab, roleId, role });

  const router = useRouter();
  const {
    userOnline,
  } = useSchoolStore();


  const permissionRequisAssigner = ["assigner permission"];
  const permissionRequisVoir = ["voir permission"];

  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );

  const hasAdminAccessAssigner = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisAssigner
  );

  

  
  if (!hasAdminAccessVoir) {
    return (
      <Card>
        <ErrorPage />
      </Card>
    );
  }

  return (
    <Card className="p-4" title="permissions">
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <div className="flex justify-end mb-4">
            <Button
              variant="soft"
              onClick={toggleSelectAll}
              className="text-sm"
            >
              {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Entité</TableHead>
                <TableHead className="w-[150px]">Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right w-[100px]">Activé</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flatPermissions.map((permission) => {
                const isChecked = role.permissions?.some((p) =>
                  comparaisonChaine(p.name, permission.name)
                );

                return (
                  <TableRow key={permission.id}>
                    <TableCell className="font-medium capitalize">
                      {permission.entity}
                    </TableCell>
                    <TableCell className="capitalize">
                      {permission.name.split(" ")[0]}
                    </TableCell>
                    <TableCell>{permission.description}</TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={
                          selectedPermissions[permission.id] ?? isChecked
                        }
                        onCheckedChange={() =>
                          handleSwitchChange(permission.id)
                        }
                        disabled={isSubmitting}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            onClick={handleBack}
            variant="outline"
            disabled={isSubmitting}
          >
            Retour
          </Button>
          {true ? (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? "Enregistrement en cours..."
                : "Enregistrer les permissions"}
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
