import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { School } from "lucide-react";
import { useSchoolStore } from "@/store";

export default function Home() {
  const {levels} = useSchoolStore();
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Échéanciers de paiements par niveau</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map((level) => (
          <Card key={level.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-muted/50">
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                {level.label}
              </CardTitle>
              <CardDescription>Consultez les échéanciers de paiements pour ce niveau</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Link href={`/parametres/caisse/echeanciers_paiement/${level.id}`} passHref>
                <Button className="w-full">Voir les échéanciers</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
