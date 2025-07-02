'use client'

import React, { useEffect } from 'react'
import GestionNotes from "./componant"
import { useSchoolStore } from "@/store"
import { fetchNotes, fetchProfessor, fetchStudents, fetchTypeEvaluations, fetchMatters } from "@/store/schoolservice"

function Page() {
  const { setNotes, setProfessor, setStudents, setTypeEvaluations, setMatters } = useSchoolStore();

  useEffect(() => {
    // Chargement initial, pas de dépendances pour éviter les requêtes en boucle
    fetchNotes().then(setNotes);
    fetchProfessor().then(setProfessor);
    fetchStudents().then(setStudents);
    fetchTypeEvaluations().then(setTypeEvaluations);
    fetchMatters().then(setMatters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GestionNotes />
  )
}

export default Page