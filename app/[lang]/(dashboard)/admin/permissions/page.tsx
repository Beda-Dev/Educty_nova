"use client"
import { useEffect, useRef, useState } from "react";



export default function RolesPage() {
  return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Gestion des rôles</h2>
        </div>
        <div className="rounded-lg border bg-card p-8 text-card-foreground shadow">
          <p className="text-muted-foreground">Cette page permettra de gérer les rôles des utilisateurs.</p>
        </div>
      </div>
   
  )
}
