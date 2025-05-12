"use client"
import React from "react";
import TableUser from "./table";
import { useEffect , useState } from "react";
import { useSchoolStore } from "@/store";




export default function UsersPage(): JSX.Element {
  const { users, roles } = useSchoolStore();

  return  <TableUser  users={users} roles={roles}/>
  
}