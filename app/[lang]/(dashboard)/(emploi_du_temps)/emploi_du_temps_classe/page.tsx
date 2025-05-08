"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { joursSemaine, classes, emploiDuTemps, couleursMatieres } from "./data";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function EmploiDuTemps() {
  const [classeSelectionnee, setClasseSelectionnee] = useState<string>(classes[0]);
  const [semaineOffset, setSemaineOffset] = useState(0);

  const handleSemainePrecedente = () => {
    setSemaineOffset(prev => prev - 1);
  };

  const handleSemaineSuivante = () => {
    setSemaineOffset(prev => prev + 1);
  };

  const resetSemaine = () => {
    setSemaineOffset(0);
  };

  return (
    <div className="container mx-auto py-6 px-2 sm:px-6">
      <Card className="w-full overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Emploi du Temps Scolaire</CardTitle>
              <CardDescription className="text-white/80">
                Planning des cours pour {classeSelectionnee}
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:w-64">
                <Select value={classeSelectionnee} onValueChange={setClasseSelectionnee}>
                  <SelectTrigger className="bg-white/90 text-gray-900">
                    <SelectValue placeholder="Sélectionnez une classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classe) => (
                      <SelectItem key={classe} value={classe}>
                        {classe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleSemainePrecedente}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={resetSemaine}
                  className="px-3 py-1 text-sm rounded-md bg-white/20 hover:bg-white/30 transition-colors"
                >
                  Cette semaine
                </button>
                <button 
                  onClick={handleSemaineSuivante}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-max">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow className="bg-gray-100 dark:bg-gray-800">
                  <TableHead className="w-32 p-3 border border-gray-200 dark:border-gray-700 font-bold text-center">
                    Heures / Jours
                  </TableHead>
                  {joursSemaine.map((jour) => (
                    <TableHead 
                      key={jour} 
                      className="w-48 p-3 border border-gray-200 dark:border-gray-700 font-bold text-center capitalize"
                    >
                      {jour}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {['08:00 - 09:00', '09:00 - 10:00', '10:15 - 11:15', '11:15 - 12:15', '14:00 - 15:00', '15:00 - 16:00'].map((horaire) => (
                  <TableRow key={horaire} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell className="p-3 border border-gray-200 dark:border-gray-700 font-medium text-center sticky left-0 bg-white dark:bg-gray-900">
                      {horaire}
                    </TableCell>
                    
                    {joursSemaine.map((jour) => {
                      const cours = emploiDuTemps[classeSelectionnee][jour]?.find(c => c.heure === horaire);
                      const couleur = cours?.couleur || couleursMatieres.default;
                      
                      return (
                        <TableCell 
                          key={`${jour}-${horaire}`} 
                          className="p-0 border border-gray-200 dark:border-gray-700 h-24 min-w-[12rem]"
                        >
                          <AnimatePresence>
                            {cours && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className={`h-full p-2 flex flex-col justify-between ${couleur} rounded-sm m-1`}
                              >
                                <div className="font-semibold text-sm">{cours.matiere}</div>
                                <div className="text-xs opacity-80">{cours.professeur}</div>
                                <div className="text-xs opacity-60">{cours.salle}</div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Semaine du {getDateSemaine(semaineOffset)}</p>
      </div>
    </div>
  );
}

function getDateSemaine(offset: number): string {
  const now = new Date();
  const lundi = new Date(now);
  lundi.setDate(now.getDate() - now.getDay() + 1 + offset * 7);
  
  const vendredi = new Date(lundi);
  vendredi.setDate(lundi.getDate() + 4);
  
  return `${lundi.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} au ${vendredi.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
}