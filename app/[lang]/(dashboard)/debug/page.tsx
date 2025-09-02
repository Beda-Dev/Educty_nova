"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useSchoolStore } from "@/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any[]>([]);

  // Données depuis Zustand
  const { students, registrations, payments, transactions } = useSchoolStore();

  const handleSearch = () => {
    const lowerQuery = query.toLowerCase();

    const matchedStudents = students.filter(
      (s) =>
        s.registration_number?.toLowerCase().includes(lowerQuery) ||
        s.first_name?.toLowerCase().includes(lowerQuery) ||
        s.name?.toLowerCase().includes(lowerQuery)
    );

    const matchedRegistrations = registrations.filter((r) =>
      r.student_id && matchedStudents.some((s) => s.id === r.student_id)
    );

    const matchedPayments = payments.filter((p) =>
      matchedStudents.some((s) => s.id === p.student_id)
    );

    const matchedTransactions = transactions.filter((t) =>
        matchedPayments.some((m) => m.transaction_id === t.id)
    );

    setResult([
      { type: "Élèves", data: matchedStudents },
      { type: "Inscriptions", data: matchedRegistrations },
      { type: "Paiements", data: matchedPayments },
      { type: "Transactions", data: matchedTransactions },
    ]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <motion.h1
        className="text-3xl font-bold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🔍 Recherche Élève
      </motion.h1>

      <div className="flex gap-2">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Matricule, Nom ou Prénom"
          className="flex-1"
        />
        <Button onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" /> Rechercher
        </Button>
      </div>

      <div className="space-y-4">
        {result.map((block) => (
          <motion.div
            key={block.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{block.type}</CardTitle>
              </CardHeader>
              <CardContent>
                {block.data.length === 0 ? (
                  <p className="text-gray-500">Aucun résultat</p>
                ) : (
                  <ul className="space-y-2">
                    {block.data.map((item: any) => (
                      <li key={item.id}>
                        <Card className="p-3">
                          <pre className="text-sm whitespace-pre-wrap">
                            {JSON.stringify(item, null, 2)}
                          </pre>
                        </Card>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
