"use client"
import React from 'react'
import PermissionsTable from './permissionTable'
import { useSchoolStore } from '@/store';
import {permissions} from "./../../permission/permissions"

interface Props {
    params: {
        id: string;
      };

}

function PagePermission({params}:Props){
const {roles} = useSchoolStore();
const { id } = params;

 const filteredRole = roles.find((role)=> role.id === Number(id))


  return filteredRole ? (
    <PermissionsTable permissionsTab={permissions} roleId={filteredRole.id} role={filteredRole} />
  ) : null;
}

export default PagePermission