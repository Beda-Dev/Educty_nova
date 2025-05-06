"use client";

import { useState, useEffect } from "react";
import React from 'react';
import RolePage from './roles_page';
import { useSchoolStore } from "@/store"
const Role = () => {
  const { roles , userOnline} = useSchoolStore();
  
  return <RolePage data={roles} />
};

export default Role;
