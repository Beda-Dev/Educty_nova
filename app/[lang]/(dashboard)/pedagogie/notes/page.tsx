'use client'

import React, { useEffect } from 'react'
import GestionNotes from "./componant"
import { useSchoolStore } from "@/store"
import { fetchNotes, fetchTypeEvaluations, fetchMatters, fetchEvaluations } from "@/store/schoolservice"

function Page() {
  const { setNotes, setTypeEvaluations, setMatters, setEvaluations } = useSchoolStore();

  useEffect(() => {
    // Chargement initial, pas de dépendances pour éviter les requêtes en boucle
    fetchNotes().then(setNotes);
    fetchTypeEvaluations().then(setTypeEvaluations);
    fetchMatters().then(setMatters);
    fetchEvaluations().then(setEvaluations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GestionNotes />
  )
}

export default Page