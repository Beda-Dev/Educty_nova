"use client";

import { useEffect } from "react";
import { useSchoolStore } from "@/store";
import { fetchProfessor, fetchUsers } from "@/store/schoolservice";
import Professors from "./componant";

export default function ProfessorsPage() {
  const { setProfessor, setUsers } = useSchoolStore();

  useEffect(() => {
    // Met à jour le store avec les professeurs et les utilisateurs
    fetchProfessor().then(setProfessor);
    fetchUsers().then(setUsers);
  }, [setProfessor, setUsers]);

  return <Professors />;
}