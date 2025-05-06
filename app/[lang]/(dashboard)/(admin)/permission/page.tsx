"use client";

import { useState, useEffect } from "react";
import React from 'react';
import PermissionsPage from './permissions_page';
import { useSchoolStore } from "@/store"
const Permissions: React.FC = () => {
  const { permissions , userOnline} = useSchoolStore();
  
  return <PermissionsPage data={permissions} />
};

export default Permissions;
